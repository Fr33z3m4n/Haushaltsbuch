from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image, ImageFilter, ImageEnhance
import pdf2image
import re
import io
import logging
from typing import Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="HaushaltsBuch OCR Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TESSERACT_CONFIG = "--oem 3 --psm 6 -l deu+eng"


class ExtractResponse(BaseModel):
    amount: Optional[float] = None
    date: Optional[str] = None
    merchant: Optional[str] = None
    raw_text: str
    confidence: float


def preprocess_image(img: Image.Image) -> Image.Image:
    img = img.convert("L")
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    img = img.filter(ImageFilter.SHARPEN)
    if img.width < 1000:
        scale = 1000 / img.width
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    return img


def clean_line(line: str) -> str:
    """Remove OCR table artifacts like leading/trailing | characters."""
    return re.sub(r"^\s*\|+\s*|\s*\|+\s*$", "", line).strip()


def parse_german_amount(raw: str) -> Optional[float]:
    """Parse German-formatted amount string like '12,99' or '1.234,56'."""
    raw = raw.strip()
    # German format: dot = thousands sep, comma = decimal sep
    if re.match(r"^\d{1,3}(\.\d{3})*(,\d{2})$", raw):
        return float(raw.replace(".", "").replace(",", "."))
    # Comma as decimal: 12,99
    if re.match(r"^\d{1,4},\d{2}$", raw):
        return float(raw.replace(",", "."))
    # Period as decimal: 12.99
    if re.match(r"^\d{1,4}\.\d{2}$", raw):
        return float(raw)
    try:
        return float(raw.replace(",", "."))
    except ValueError:
        return None


def extract_amount(text: str) -> Optional[float]:
    lines = text.split("\n")

    # Strategy 1: Look for total-keyword lines (searched bottom-up, highest priority)
    # Covers: ENDSUMME (EUR) 10,39 / SUMME: 10,39 / TOTAL 10.39 / GESAMTBETRAG 10,39
    keyword_pattern = re.compile(
        r"(?:ENDSUMME|TOTAL|GESAMT(?:BETRAG)?|SUMME|ZU\s*ZAHLEN|"
        r"ENDBETRAG|RECHNUNGSBETRAG|ZWISCHENSUMME|EUR-BETRAG)"
        r"\s*[:\-=]?\s*(?:\(EUR\)|\(€\)|EUR|€)?\s*[:\-=]?\s*"
        r"([\d]{1,3}(?:[.,]\d{3})*[.,]\d{2})",
        re.IGNORECASE,
    )
    for line in reversed(lines):
        m = keyword_pattern.search(clean_line(line))
        if m:
            val = parse_german_amount(m.group(1))
            if val and 0.01 <= val <= 99999.99:
                return val

    # Strategy 2: Amount explicitly labelled with EUR/€ symbol
    eur_pattern = re.compile(
        r"(?:EUR|€)\s*([\d]{1,3}(?:[.,]\d{3})*[.,]\d{2})"
        r"|([\d]{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:EUR|€)",
        re.IGNORECASE,
    )
    for line in reversed(lines):
        m = eur_pattern.search(clean_line(line))
        if m:
            raw = m.group(1) or m.group(2)
            val = parse_german_amount(raw)
            if val and 0.01 <= val <= 99999.99:
                return val

    # Strategy 3: Largest numeric amount on the receipt as last resort
    amount_pattern = re.compile(r"\b(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\b")
    candidates = []
    for line in lines:
        for m in amount_pattern.finditer(clean_line(line)):
            val = parse_german_amount(m.group(1))
            if val and 0.01 <= val <= 9999.99:
                candidates.append(val)
    if candidates:
        return max(candidates)

    return None


def extract_date(text: str) -> Optional[str]:
    # Priority: lines containing "datum", "date", "uhrzeit" keyword
    labeled_pattern = re.compile(
        r"(?:datum|date)\s*[:\-]?\s*(\d{2}[.\-/]\d{2}[.\-/]\d{2,4})",
        re.IGNORECASE,
    )
    all_date_pattern = re.compile(
        r"\b(\d{2})[.\-/](\d{2})[.\-/](\d{2,4})\b"
        r"|\b(\d{4})[.\-/](\d{2})[.\-/](\d{2})\b"
    )

    def try_parse(d, m, y_raw) -> Optional[str]:
        y = int(y_raw)
        if y < 100:
            y += 2000
        d, m = int(d), int(m)
        if 1 <= m <= 12 and 1 <= d <= 31 and 2000 <= y <= 2100:
            return f"{y:04d}-{m:02d}-{d:02d}"
        return None

    for line in text.split("\n"):
        lm = labeled_pattern.search(line)
        if lm:
            parts = re.split(r"[.\-/]", lm.group(1))
            if len(parts) == 3:
                result = try_parse(parts[0], parts[1], parts[2])
                if result:
                    return result

    for line in text.split("\n"):
        for m in all_date_pattern.finditer(line):
            if m.group(1):  # DD.MM.YYYY or DD.MM.YY
                result = try_parse(m.group(1), m.group(2), m.group(3))
                if result:
                    return result
            else:  # YYYY.MM.DD
                y, mo, d = m.group(4), m.group(5), m.group(6)
                result = try_parse(d, mo, y)
                if result:
                    return result

    return datetime.today().strftime("%Y-%m-%d")


def extract_merchant(text: str) -> Optional[str]:
    skip_patterns = re.compile(
        r"(RECHNUNG|QUITTUNG|KASSENBON|BELEG|BON|VIELEN\s*DANK|DATUM|UHRZEIT|"
        r"KASSE|MWST|UST\.|KUNDENNUMMER|STEUERNUMMER|STEUER-NR|WWW\.|HTTP|"
        r"TEL\.|FAX|FILIALE|MARKT\s*\d|KASSEN-NR|TRANSAKTIONS|BELEGNR|"
        r"RECHNUNGS-NR|ARTIKEL|MENGE|PREIS|RABATT|KUNDE\s*:|POSITIONSRABATT|"
        r"YK-PREIS|VK-PREIS|ENDSUMME|GESAMTBETRAG|ZWISCHENSUMME)",
        re.IGNORECASE,
    )
    # Strip table chars, then filter
    lines = [clean_line(ln) for ln in text.split("\n")]
    lines = [ln for ln in lines if ln]

    for line in lines[:10]:
        if len(line) < 3 or len(line) > 60:
            continue
        # Skip pure numbers / symbols / article numbers
        if re.match(r"^[\d\s.,/:*\-=_|]+$", line):
            continue
        # Skip lines that look like product descriptions:
        # they typically end with a price or article number
        if re.search(r"\d{5,}", line):          # article numbers like 1107556
            continue
        if re.search(r"\d+[.,]\d{2}\s*$", line):  # ends with a price
            continue
        if skip_patterns.search(line):
            continue
        # Must contain at least one letter
        if not re.search(r"[a-zA-ZÄÖÜäöüß]", line):
            continue
        cleaned = re.sub(r"[^\w\s\-&.,'/()]", "", line, flags=re.UNICODE).strip()
        if len(cleaned) >= 3:
            return cleaned
    return None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ocr-service"}


@app.post("/ocr/extract", response_model=ExtractResponse)
async def extract(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/tiff", "application/pdf"}
    content_type = file.content_type or ""
    filename = (file.filename or "").lower()

    is_pdf = content_type == "application/pdf" or filename.endswith(".pdf")
    is_image = content_type.startswith("image/") or any(
        filename.endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif")
    )

    if not (is_pdf or is_image):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")

    try:
        data = await file.read()

        if is_pdf:
            pages = pdf2image.convert_from_bytes(data, dpi=200, first_page=1, last_page=1)
            if not pages:
                raise HTTPException(status_code=422, detail="PDF could not be converted to image")
            img = pages[0]
        else:
            img = Image.open(io.BytesIO(data))

        img = preprocess_image(img)
        raw_text = pytesseract.image_to_string(img, config=TESSERACT_CONFIG)
        logger.info("OCR raw text (first 300 chars): %s", raw_text[:300])

        amount = extract_amount(raw_text)
        date = extract_date(raw_text)
        merchant = extract_merchant(raw_text)

        # Confidence: based on how many fields were extracted
        fields_found = sum(1 for f in [amount, date, merchant] if f is not None)
        confidence = fields_found / 3.0

        return ExtractResponse(
            amount=amount,
            date=date,
            merchant=merchant,
            raw_text=raw_text,
            confidence=confidence,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("OCR extraction failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

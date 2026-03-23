# 📒 HaushaltsBuch

> **Ein persönliches Haushaltsbuch zur Verwaltung von Finanzen, Fixkosten und monatlichen Ein-/Ausgaben.**

---

## 🤖 Entstehung dieses Projekts

Dieses Projekt wurde als **Experiment** vollständig durch den KI-Assistenten **GitHub Copilot** erstellt – von der Architekturentscheidung über die Implementierung bis hin zu Docker-Setup, PWA-Konfiguration und GitHub Actions CI/CD. Es dient als Proof of Concept, wie weit KI-gestützte Softwareentwicklung im Jahr 2025/2026 bereits reicht.

Kein einzige Zeile Code wurde manuell geschrieben. Alle Entscheidungen (Tech-Stack, Ordnerstruktur, Datenbankschema, UI/UX) wurden durch Dialog mit Copilot erarbeitet.

---

## 🎯 Zielbild

Viele Haushaltsbuch-Apps im Internet erfüllen nicht die individuellen Anforderungen. Dieses Tool soll:

- Eine **vollständige Übersicht** über monatliche und jährliche Fixkosten bieten
- **Mehrere Konten** (Bank, PayPal, Kreditkarte etc.) verwalten
- Ein- und Ausgaben in verschiedenen **Intervallen** (monatlich, quartalsweise, halbjährlich, jährlich) erfassen
- Eine **monatliche Abhakliste** bieten, um erledigte Buchungen zu markieren
- **Mandantenfähig** sein – jedes Familienmitglied hat eigene Daten hinter eigenem Login
- Als **Progressive Web App (PWA)** auf dem Smartphone installierbar sein

---

## 🏗️ Architektur

```
HaushaltsBuch/                  ← NX Monorepo (Workspace Root)
├── apps/
│   ├── frontend/               ← Angular 21 SPA (PWA)
│   │   ├── src/app/
│   │   │   ├── core/           ← Services, Guards, Interceptors, Models
│   │   │   ├── features/       ← Fachliche Seiten (Dashboard, Buchungen, …)
│   │   │   └── shared/         ← Wiederverwendbare Komponenten & Pipes
│   │   ├── public/             ← Assets, Manifest, Icons
│   │   └── Dockerfile          ← Multi-Stage: Node Build → Nginx
│   │
│   └── backend/                ← Node.js / Express REST API
│       ├── src/
│       │   ├── config/         ← DB- & JWT-Konfiguration
│       │   ├── controllers/    ← Route-Handler
│       │   ├── entities/       ← TypeORM Entities
│       │   ├── middleware/      ← Auth, Validation
│       │   ├── routes/         ← API-Routen
│       │   └── database/       ← Migrations
│       └── Dockerfile          ← Multi-Stage: TypeScript Compile → Node Runner
│
├── libs/shared-models/         ← Gemeinsame Interfaces (Frontend ↔ Backend)
├── docker-compose.yml          ← Lokale Entwicklungsumgebung
└── .github/workflows/          ← CI/CD: Build & Push nach GHCR
```

### Architekturprinzipien

| Prinzip | Umsetzung |
|---|---|
| **Mandantenfähigkeit** | Jeder Benutzer sieht ausschließlich eigene Daten (DB-Level-Filterung per `userId`) |
| **Sicherheit** | JWT Access + Refresh Tokens, bcrypt Passwort-Hashing, Rate Limiting, Helmet |
| **Standalone Components** | Alle Angular-Komponenten sind standalone (kein NgModule) |
| **Klare Schichtentrennung** | `core` / `shared` / `features` – keine Business-Logik in UI-Komponenten |
| **Runtime-Konfiguration** | API-URL wird per `env.js` zur Laufzeit injiziert – kein Rebuild beim Serverwechsel |

---

## 🛠️ Tech-Stack

### Frontend
| Technologie | Version | Zweck |
|---|---|---|
| **Angular** | 21 | SPA-Framework |
| **Bootstrap** | 5 | UI-Framework / Responsive Design |
| **Font Awesome** | 6 Free | Icons |
| **ng2-charts / Chart.js** | – | Dashboard-Grafiken |
| **Angular Service Worker** | – | PWA / Auto-Update |
| **SCSS** | – | Styling mit CSS Custom Properties (Dark Mode) |

### Backend
| Technologie | Version | Zweck |
|---|---|---|
| **Node.js** | 20 LTS | Runtime |
| **Express** | 4 | REST API Framework |
| **TypeORM** | – | ORM / Datenbankzugriff |
| **MySQL** | 8.0 | Datenbank |
| **JWT** | – | Authentifizierung |
| **bcrypt** | – | Passwort-Hashing |
| **Helmet** | – | Security-Headers |
| **express-rate-limit** | – | Rate Limiting |

### Infrastruktur
| Technologie | Zweck |
|---|---|
| **NX 22** | Monorepo-Verwaltung |
| **Docker / Docker Compose** | Containerisierung |
| **nginx** | Frontend-Serving (SPA-Routing) |
| **GHCR** | Container Registry (GitHub Container Registry) |
| **GitHub Actions** | CI/CD – automatischer Build & Push bei jedem Commit |

---

## ✨ Features

- 🏦 **Kontenverwaltung** – Bank, PayPal, Kreditkarte, Bargeld uvm.
- 🏷️ **Kategorien** – frei definierbar mit eigener Farbe und Font Awesome Icon
- 💸 **Buchungen** – monatlich, quartalsweise, halbjährlich, jährlich; mit Fälligkeitstag und optionalem Enddatum
- 📅 **Monatsübersicht** – Abhakliste für erledigte Buchungen, offene Posten, Gesamtsummen
- 📊 **Jahresübersicht** – aggregierte Jahreswerte pro Monat
- 📈 **Dashboard** – Statistik-Karten, Jahresverlauf (Liniendiagramm), Einnahmen vs. Ausgaben (Donut), Ausgaben nach Kategorien
- 🌙 **Dark Mode** – systembasiert oder manuell umschaltbar
- 📱 **PWA** – installierbar auf Android & iOS, automatische Updates
- 👥 **Benutzerverwaltung** – Admin kann Benutzer anlegen/deaktivieren
- 🔐 **Mandantenfähigkeit** – vollständige Datentrennung zwischen Benutzern

---

## 🚀 Schnellstart (lokal)

### Voraussetzungen
- Docker & Docker Compose
- Git

### 1. Repository klonen

```bash
git clone https://github.com/Fr33z3m4n/Haushaltsbuch.git
cd Haushaltsbuch
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

`.env` anpassen – mindestens folgende Werte setzen:

```env
MYSQL_ROOT_PASSWORD=sicheres_root_passwort
DB_DATABASE=haushaltsbuch
DB_USERNAME=haushaltsbuch
DB_PASSWORD=sicheres_db_passwort
JWT_SECRET=mindestens_32_zufaellige_zeichen_hier_eintragen
```

### 3. Starten

```bash
docker compose up -d
```

Die App ist erreichbar unter **http://localhost**

> **Erster Login:** Beim ersten Start wird automatisch ein Admin-Benutzer angelegt.  
> Registrierung über `/register` oder direkt über die Benutzerverwaltung (Admin-Bereich).

---

## 🌐 Production Deployment

### Option A: Vorgefertigte GHCR-Images (empfohlen)

Die Images werden bei jedem Push auf `master` automatisch via GitHub Actions gebaut und in die GitHub Container Registry gepusht.

```bash
# Frontend
docker pull ghcr.io/fr33z3m4n/haushaltsbuch-frontend:latest

# Backend
docker pull ghcr.io/fr33z3m4n/haushaltsbuch-backend:latest
```

### Option B: Selbst bauen

```bash
docker compose build
docker compose up -d
```

---

### Umgebungsvariablen (Produktion)

#### Frontend-Container

| Variable | Standard | Beschreibung |
|---|---|---|
| `API_URL` | `/api` | URL zur Backend-API. Bei separater Domain: `https://api.example.com/api` |

```bash
docker run -d \
  --name haushaltsbuch-frontend \
  -e API_URL=https://api.meinedomain.de/api \
  -p 80:80 \
  ghcr.io/fr33z3m4n/haushaltsbuch-frontend:latest
```

#### Backend-Container

| Variable | Standard | Beschreibung |
|---|---|---|
| `DB_HOST` | – | MySQL-Hostname |
| `DB_PORT` | `3306` | MySQL-Port |
| `DB_DATABASE` | – | Datenbankname |
| `DB_USERNAME` | – | Datenbankbenutzer |
| `DB_PASSWORD` | – | Datenbankpasswort |
| `JWT_SECRET` | – | **Pflicht** – mindestens 32 Zeichen, zufällig generiert |
| `JWT_EXPIRES_IN` | `7d` | Token-Gültigkeit |
| `CORS_ORIGIN` | `*` | Erlaubte Frontend-Domain z. B. `https://hb.meinedomain.de` |
| `RATE_LIMIT_MAX` | `500` | Max. Requests pro 15 Minuten pro IP |

```bash
# Starkes JWT-Secret generieren
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Reverse Proxy (nginx / Plesk)

Wenn Frontend und Backend über dieselbe Domain erreichbar sein sollen:

```nginx
# /api → Backend
location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# / → Frontend
location / {
    proxy_pass http://127.0.0.1:80/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

In diesem Fall reicht `API_URL=/api` (Standard).

---

## 📱 PWA – Als App installieren

Die App ist als Progressive Web App (PWA) konfiguriert und kann direkt auf dem Smartphone installiert werden:

- **Android (Chrome):** Adressleiste → Menü → „App installieren" / „Zum Startbildschirm hinzufügen"
- **iOS (Safari):** Teilen-Button → „Zum Home-Bildschirm"

Die App prüft alle **2 Stunden** automatisch auf neue Versionen und lädt sich bei einem Update selbstständig neu.

---

## 📁 Datenbankstruktur

Die Datenbank wird beim ersten Start automatisch per Migration angelegt (`apps/backend/src/database/migrations/`).

| Tabelle | Inhalt |
|---|---|
| `users` | Benutzer, Passwort-Hash, Admin-Flag |
| `accounts` | Konten je Benutzer (Bank, PayPal, …) |
| `categories` | Kategorien je Benutzer mit Farbe & Icon |
| `transactions` | Buchungen mit Betrag, Intervall, Konto, Kategorie |
| `monthly_status` | Abhaklisten-Status pro Buchung, Monat und Jahr |

---

## 🤝 Mitmachen / Forken

Pull Requests und Forks sind ausdrücklich erwünscht! Dieses Projekt steht unter der **Apache License 2.0** – du darfst es:

- ✅ Frei verwenden (privat & kommerziell)
- ✅ Verändern und anpassen
- ✅ Die GHCR-Images direkt nutzen
- ✅ Weiterverteilen

Einzige Bedingung: Den ursprünglichen Lizenzhinweis beibehalten.

---

## 📄 Lizenz

Copyright 2025 Fr33z3m4n

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

<div align="center">
  <sub>Vollständig erstellt durch <strong>GitHub Copilot</strong> – kein manuell geschriebener Code.</sub>
</div>

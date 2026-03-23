import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const migrationsDir = path.join(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'haushaltsbuch',
    multipleStatements: true,
  });

  console.log('Connected to database. Running migrations...');

  // Create migrations tracking table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS \`migrations\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`filename\` VARCHAR(255) NOT NULL UNIQUE,
      \`executedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [executed] = await connection.execute<mysql.RowDataPacket[]>(
    'SELECT filename FROM migrations ORDER BY filename ASC',
  );
  const executedFiles = new Set(executed.map((r) => r.filename as string));

  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const file of sqlFiles) {
    if (executedFiles.has(file)) {
      console.log(`  ✓ Skipping (already run): ${file}`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`  → Running: ${file}`);
    await connection.execute(sql);
    await connection.execute('INSERT INTO migrations (filename) VALUES (?)', [file]);
    console.log(`  ✓ Done: ${file}`);
    ran++;
  }

  await connection.end();
  console.log(`\nMigrations complete. ${ran} migration(s) applied.`);
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});

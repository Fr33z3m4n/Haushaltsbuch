#!/bin/sh
set -e

echo "⏳ Waiting for MySQL to be ready..."
until node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}).then(c => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "  MySQL not ready yet – retrying in 2s..."
  sleep 2
done

echo "✅ MySQL is ready. Running migrations..."
node database/migrate.js

echo "🚀 Starting backend server..."
exec node index.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySchema() {
    try {
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await pool.query(schema);

        console.log('Schema applied successfully! ✅');
        process.exit(0);
    } catch (err) {
        console.error('Error applying schema: ❌', err);
        process.exit(1);
    }
}

applySchema();

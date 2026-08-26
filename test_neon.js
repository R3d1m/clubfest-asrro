import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

async function testConnection() {
  console.log('🔍 Checking Neon DB configuration...\n');

  if (!connectionString) {
    console.error('❌ Error: No DATABASE_URL found in .env file!');
    console.log('\n👉 Please open .env and set your Neon DB connection string:');
    console.log('   DATABASE_URL=postgresql://neondb_owner:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT NOW() as current_time, version() as version;');
    console.log('✅ Successfully connected to Neon DB!');
    console.log('⏰ Database Server Time:', res.rows[0].current_time);
    console.log('🐘 PostgreSQL Version:', res.rows[0].version);

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('📋 Public Tables:', tables.rows.map(r => r.table_name).join(', ') || '(No tables yet - will be auto-created on server start)');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();

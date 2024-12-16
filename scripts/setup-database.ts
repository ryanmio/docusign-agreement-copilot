import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('exec', { sql: statement });
      
      if (error) {
        console.error('Error executing statement:', error);
        throw error;
      }
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 
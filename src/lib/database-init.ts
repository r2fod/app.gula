import { supabase } from '@/integrations/supabase/client';

interface TableSchema {
  name: string;
  checkQuery: string;
}

const REQUIRED_TABLES: TableSchema[] = [
  {
    name: 'ai_interactions',
    checkQuery: 'id, user_id, query, response, feedback, context, created_at'
  },
  {
    name: 'ai_knowledge',
    checkQuery: 'id, category, key, value, confidence, usage_count, last_used, created_at'
  },
  {
    name: 'ai_event_patterns',
    checkQuery: 'id, event_type, pattern, success_count, total_count, last_seen, created_at'
  },
  {
    name: 'role_permissions',
    checkQuery: 'id, user_id, role, permissions, created_at, updated_at, created_by'
  },
  {
    name: 'role_audit_log',
    checkQuery: 'id, user_id, action, old_role, new_role, changed_by, created_at'
  }
];

async function checkTableExists(tableName: string, columns: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from(tableName)
      .select(columns)
      .limit(1);
    
    if (!error) {
      return true;
    }
    
    const errorMessage = error?.message?.toLowerCase() || '';
    return !errorMessage.includes('does not exist') && 
           !errorMessage.includes('relation') && 
           !errorMessage.includes('not found');
  } catch {
    return false;
  }
}

export async function initializeDatabase(): Promise<{
  success: boolean;
  missingTables: string[];
  existingTables: string[];
}> {
  const missingTables: string[] = [];
  const existingTables: string[] = [];
  
  console.log('🔍 Checking database tables...');
  
  for (const schema of REQUIRED_TABLES) {
    const exists = await checkTableExists(schema.name, schema.checkQuery);
    
    if (!exists) {
      console.warn(`⚠️ Table ${schema.name} does not exist`);
      missingTables.push(schema.name);
    } else {
      console.log(`✓ Table ${schema.name} exists`);
      existingTables.push(schema.name);
    }
  }
  
  if (missingTables.length > 0) {
    console.warn(`⚠️ Missing tables: ${missingTables.join(', ')}`);
    console.log('📝 Please run the following SQL in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/wfkuclqzcwsdysxqhzmi/sql/new');
    console.log('\nMissing migrations:');
    
    if (missingTables.includes('ai_interactions') || 
        missingTables.includes('ai_knowledge') || 
        missingTables.includes('ai_event_patterns')) {
      console.log('- 20250120000000_ai_training_system.sql');
    }
    
    if (missingTables.includes('role_permissions') || 
        missingTables.includes('role_audit_log')) {
      console.log('- 20250120010000_roles_and_permissions.sql');
    }
  } else {
    console.log('✅ All required tables exist');
  }
  
  return {
    success: missingTables.length === 0,
    missingTables,
    existingTables
  };
}

export { REQUIRED_TABLES };

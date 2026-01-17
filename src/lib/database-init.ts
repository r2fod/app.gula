import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

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

  logger.info('🔍 Checking database tables...');

  for (const schema of REQUIRED_TABLES) {
    const exists = await checkTableExists(schema.name, schema.checkQuery);

    if (!exists) {
      logger.warn(`⚠️ Table ${schema.name} does not exist`);
      missingTables.push(schema.name);
    } else {
      logger.info(`✓ Table ${schema.name} exists`);
      existingTables.push(schema.name);
    }
  }

  if (missingTables.length > 0) {
    logger.warn(`⚠️ Missing tables: ${missingTables.join(', ')}`);
    logger.info('📝 Please run the following SQL in Supabase SQL Editor:');
    logger.info('https://supabase.com/dashboard/project/wfkuclqzcwsdysxqhzmi/sql/new');
    logger.info('\nMissing migrations:');

    if (missingTables.includes('ai_interactions') ||
        missingTables.includes('ai_knowledge') ||
        missingTables.includes('ai_event_patterns')) {
      logger.info('- supabase/migrations/20240101000000_ai_system.sql');
    }

    if (missingTables.includes('role_permissions') ||
        missingTables.includes('role_audit_log')) {
      logger.info('- supabase/migrations/20240101000001_role_system.sql');
    }

    return {
      success: false,
      missingTables,
      existingTables
    };
  }

  logger.info('✅ Todas las tablas requeridas existen');
  return {
    success: true,
    missingTables: [],
    existingTables
  };
}

export { REQUIRED_TABLES };

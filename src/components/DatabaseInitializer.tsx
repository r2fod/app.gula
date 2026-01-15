import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/lib/database-init';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DatabaseInitializerProps {
  children: React.ReactNode;
}

export function DatabaseInitializer({ children }: DatabaseInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        console.log('🚀 Checking database schema...');
        const result = await initializeDatabase();
        
        if (result.success) {
          console.log('✅ Database schema is complete');
        } else {
          console.warn('⚠️ Missing database tables:', result.missingTables);
          setMissingTables(result.missingTables);
          
          toast({
            title: "Database Setup Required",
            description: `Missing ${result.missingTables.length} tables. Check console for details.`,
            variant: "destructive",
          });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Database check failed:', error);
        setIsInitialized(true);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [toast]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Checking database...</p>
        </div>
      </div>
    );
  }

  if (missingTables.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">Missing tables: {missingTables.join(', ')}</p>
            <p className="text-sm">
              Please run the required migrations in Supabase SQL Editor:
            </p>
            <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
              <li>Go to: <a href="https://supabase.com/dashboard/project/wfkuclqzcwsdysxqhzmi/sql/new" target="_blank" rel="noopener noreferrer" className="underline">Supabase SQL Editor</a></li>
              <li>Run: <code className="bg-muted px-1 py-0.5 rounded">20250120000000_ai_training_system.sql</code></li>
              <li>Run: <code className="bg-muted px-1 py-0.5 rounded">20250120010000_roles_and_permissions.sql</code></li>
              <li>Refresh this page</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

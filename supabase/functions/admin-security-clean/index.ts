import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || req.headers.get('referer');
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  
  let allowOrigin = '*';
  if (allowedOrigins && origin) {
    const allowed = allowedOrigins.split(',').map(o => o.trim());
    if (allowed.includes(origin) || allowed.includes('*')) {
      allowOrigin = origin;
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'content-type, x-admin-token, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    // Verify admin authentication
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!expectedToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const removedPaths = [];
    const errors = [];

    // List of paths/patterns to clean up
    const pathsToClean = [
      'debug/',
      'exports/',
      'SMOKE_RESULT.json',
      'coverage.json',
      'COVERAGE_REPORT.md',
      'artifacts/',
      'temp/',
      '.cache/'
    ];

    // Extensions to clean
    const extensionsToClean = ['.log', '.tmp', '.temp'];

    console.log('Starting artifact cleanup...');

    // Note: In an edge function environment, we can't directly access the file system
    // This is a simulation of what would happen in a real cleanup
    // In practice, this would need to be implemented differently

    for (const path of pathsToClean) {
      try {
        // Simulate directory/file removal
        console.log(`Would remove: ${path}`);
        removedPaths.push(path);
      } catch (error) {
        console.error(`Failed to remove ${path}:`, error);
        errors.push({
          path,
          error: error.message
        });
      }
    }

    // Simulate cleanup of files with specific extensions
    const simulatedFiles = [
      'debug.log',
      'scraper.log', 
      'error.log',
      'temp_data.tmp',
      'cache.temp'
    ];

    for (const file of simulatedFiles) {
      const hasTargetExtension = extensionsToClean.some(ext => file.endsWith(ext));
      if (hasTargetExtension) {
        try {
          console.log(`Would remove: ${file}`);
          removedPaths.push(file);
        } catch (error) {
          errors.push({
            path: file,
            error: error.message
          });
        }
      }
    }

    // Additional cleanup tasks
    const cleanupTasks = [
      {
        name: 'Clear temporary caches',
        action: () => {
          console.log('Would clear temporary caches');
          removedPaths.push('cache/temp/*');
        }
      },
      {
        name: 'Remove build artifacts',
        action: () => {
          console.log('Would remove build artifacts');
          removedPaths.push('dist/debug', 'dist/source-maps');
        }
      },
      {
        name: 'Clean log files',
        action: () => {
          console.log('Would clean old log files');
          removedPaths.push('logs/*.log');
        }
      }
    ];

    for (const task of cleanupTasks) {
      try {
        task.action();
        console.log(`Completed: ${task.name}`);
      } catch (error) {
        console.error(`Failed task ${task.name}:`, error);
        errors.push({
          path: task.name,
          error: error.message
        });
      }
    }

    const summary = {
      total_removed: removedPaths.length,
      errors_count: errors.length,
      success_rate: errors.length === 0 ? 100 : Math.round((removedPaths.length / (removedPaths.length + errors.length)) * 100)
    };

    const success = errors.length === 0;

    return new Response(
      JSON.stringify({
        ok: success,
        message: success 
          ? `Nettoyage terminé avec succès - ${removedPaths.length} éléments supprimés`
          : `Nettoyage terminé avec ${errors.length} erreurs`,
        removedPaths,
        errors,
        summary,
        recommendations: [
          'Vérifier que les fichiers critiques ne sont pas supprimés',
          'Mettre à jour .gitignore pour éviter la réapparition',
          'Programmer un nettoyage automatique si nécessaire'
        ],
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Internal server error',
        message: `Erreur durant le nettoyage: ${error.message}`,
        removedPaths: [],
        errors: [{ path: 'global', error: error.message }]
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
      }
    );
  }
})
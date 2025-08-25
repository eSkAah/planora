import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className={cn('bg-background min-h-screen p-8')}>
      <div className='mx-auto max-w-4xl space-y-8'>
        {/* Header */}
        <header className='space-y-4 text-center'>
          <h1 className='text-foreground text-4xl font-bold'>🗓️ Planora</h1>
          <p className='text-muted-foreground text-xl'>
            Application SaaS de Gestion des Plannings avec IA
          </p>
        </header>

        {/* T007 Completion Card */}
        <div className='rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800'>
          <div className='mb-4'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              ✅ T007 - TypeScript Configuration Stricte
            </h2>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              Configuration TypeScript ultra-stricte avec types complets pour
              une sécurité maximale
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                🔷 Configuration Ultra-Stricte
              </h3>
              <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                Tous les flags TypeScript stricts activés
              </p>
              <ul className='space-y-1 text-xs text-gray-500'>
                <li>• noImplicitAny, strictNullChecks</li>
                <li>• noUnusedLocals, noImplicitReturns</li>
                <li>• exactOptionalPropertyTypes</li>
              </ul>
            </div>

            <div className='rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                📝 Types Complets
              </h3>
              <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                Types détaillés pour toute l&apos;application
              </p>
              <ul className='space-y-1 text-xs text-gray-500'>
                <li>• Types de base de données</li>
                <li>• Types API avec validation</li>
                <li>• Types utilitaires globaux</li>
              </ul>
            </div>

            <div className='rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                🛡️ Sécurité & Maintenabilité
              </h3>
              <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                Détection d&apos;erreurs à la compilation
              </p>
              <ul className='space-y-1 text-xs text-gray-500'>
                <li>• Pas de types implicites</li>
                <li>• Validation des null/undefined</li>
                <li>• Refactoring sécurisé</li>
              </ul>
            </div>
          </div>

          <div className='mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
            <h4 className='mb-2 font-semibold text-blue-800 dark:text-blue-200'>
              🚀 Sécurité TypeScript Maximale
            </h4>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              Configuration stricte activée avec types complets pour :
            </p>
            <div className='mt-2 grid grid-cols-1 gap-2 text-sm text-blue-700 md:grid-cols-2 dark:text-blue-300'>
              <div>• Types de base de données complets</div>
              <div>• API types avec validation</div>
              <div>• Types globaux et utilitaires</div>
              <div>• Composants type-safe</div>
              <div>• Constantes typées</div>
              <div>• Path mapping optimisé</div>
            </div>
          </div>

          <div className='mt-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20'>
            <p className='text-sm text-green-700 dark:text-green-300'>
              💡{' '}
              <strong>
                Configuration documentée dans{' '}
                <code className='rounded bg-green-100 px-1 dark:bg-green-800'>
                  docs/TYPESCRIPT.md
                </code>
              </strong>
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className='rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
            📋 Progression du Setup
          </h2>
          <div className='space-y-3'>
            {[
              { id: 'T001', name: 'Setup Next.js', completed: true },
              {
                id: 'T002',
                name: 'ESLint + Prettier + Husky',
                completed: true,
              },
              { id: 'T003', name: 'Tailwind CSS', completed: true },
              { id: 'T004', name: 'ShadCN/UI + Thème', completed: true },
              {
                id: 'T005',
                name: "Variables d'environnement",
                completed: false,
                skipped: true,
              },
              {
                id: 'T006',
                name: 'Structure de dossiers',
                completed: true,
              },
              {
                id: 'T007',
                name: 'TypeScript strict',
                completed: true,
                current: true,
              },
              { id: 'T008', name: 'Git optimisé', completed: false },
            ].map(task => (
              <div key={task.id} className='flex items-center space-x-3'>
                <span
                  className={
                    task.completed
                      ? 'text-green-500'
                      : task.current
                        ? 'text-blue-500'
                        : task.skipped
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                  }
                >
                  {task.completed
                    ? '✅'
                    : task.current
                      ? '🔄'
                      : task.skipped
                        ? '⏭️'
                        : '⭕'}
                </span>
                <span
                  className={cn(
                    'text-gray-600 dark:text-gray-400',
                    task.current &&
                      'font-semibold text-gray-900 dark:text-white',
                    task.skipped && 'line-through opacity-60'
                  )}
                >
                  {task.id} - {task.name}
                  {task.skipped && ' (ignoré)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className='text-center text-gray-500'>
          <p>T007 - TypeScript strict configuration ✨</p>
        </footer>
      </div>
    </div>
  );
}

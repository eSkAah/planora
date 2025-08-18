import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className={cn('min-h-screen bg-gray-50 p-8 dark:bg-gray-900')}>
      <div className='mx-auto max-w-4xl space-y-8'>
        {/* Header */}
        <header className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>
            🗓️ Planora
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Application SaaS de Gestion des Plannings avec IA
          </p>
        </header>

        {/* T006 Completion Card */}
        <div className='rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800'>
          <div className='mb-4'>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              ✅ T006 - Structure de Dossiers Organisée
            </h2>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              Architecture moderne et maintenable pour une application SaaS
              complexe
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                🏗️ Architecture Modulaire
              </h3>
              <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                Séparation claire des préoccupations et organisation logique
              </p>
              <ul className='space-y-1 text-xs text-gray-500'>
                <li>• Components réutilisables par type</li>
                <li>• Lib organisée par domaine métier</li>
                <li>• Hooks et store centralisés</li>
              </ul>
            </div>

            <div className='rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                📁 Structure Professionnelle
              </h3>
              <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                Dossiers organisés selon les meilleures pratiques
              </p>
              <ul className='space-y-1 text-xs text-gray-500'>
                <li>• App Router avec route groups</li>
                <li>• Composants par fonctionnalité</li>
                <li>• Types et validations centralisés</li>
              </ul>
            </div>

            <div className='rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                🔧 Outils & Utilitaires
              </h3>
              <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                Fonctions utilitaires et helpers prêts à l&apos;emploi
              </p>
              <ul className='space-y-1 text-xs text-gray-500'>
                <li>• Utils pour CSS (cn function)</li>
                <li>• Formatage de dates</li>
                <li>• Helpers de validation</li>
              </ul>
            </div>
          </div>

          <div className='mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
            <h4 className='mb-2 font-semibold text-blue-800 dark:text-blue-200'>
              🚀 Prêt pour le Développement
            </h4>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              La structure est maintenant en place pour accueillir toutes les
              fonctionnalités de Planora :
            </p>
            <div className='mt-2 grid grid-cols-1 gap-2 text-sm text-blue-700 md:grid-cols-2 dark:text-blue-300'>
              <div>• Authentification & autorisation</div>
              <div>• Gestion des employés</div>
              <div>• Génération de plannings IA</div>
              <div>• Interface multi-tenant</div>
              <div>• Analytics & rapports</div>
              <div>• Configuration avancée</div>
            </div>
          </div>

          <div className='mt-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20'>
            <p className='text-sm text-green-700 dark:text-green-300'>
              💡{' '}
              <strong>
                Architecture documentée dans{' '}
                <code className='rounded bg-green-100 px-1 dark:bg-green-800'>
                  docs/ARCHITECTURE.md
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
                current: true,
              },
              { id: 'T007', name: 'TypeScript strict', completed: false },
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
          <p>T006 - Structure de dossiers professionnelle ✨</p>
        </footer>
      </div>
    </div>
  );
}

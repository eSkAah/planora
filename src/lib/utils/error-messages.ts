/**
 * Utility functions to convert technical error messages to user-friendly French messages
 */

/**
 * Convert technical database/auth errors to user-friendly messages
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
  if (!error) return 'Une erreur est survenue. Veuillez réessayer.';

  const errorMessage = typeof error === 'string'
    ? error
    : (error as any)?.message || String(error);

  const lowerError = errorMessage.toLowerCase();

  // Duplicate key/unique constraint errors
  if (lowerError.includes('duplicate') || lowerError.includes('unique constraint')) {
    if (lowerError.includes('email')) {
      return 'Cet email est déjà utilisé.';
    }
    return 'Cette valeur existe déjà. Veuillez utiliser une valeur unique.';
  }

  // Foreign key errors
  if (lowerError.includes('foreign key') || lowerError.includes('violates')) {
    return 'Impossible de supprimer cet élément car il est utilisé ailleurs.';
  }

  // Permission errors
  if (lowerError.includes('permission') || lowerError.includes('not authorized')) {
    return 'Vous n\'avez pas les droits nécessaires pour cette action.';
  }

  // Not found errors
  if (lowerError.includes('not found') || lowerError.includes('does not exist')) {
    return 'Élément non trouvé.';
  }

  // Validation errors
  if (lowerError.includes('invalid') || lowerError.includes('validation')) {
    return 'Les données saisies sont invalides.';
  }

  // Network/connection errors
  if (lowerError.includes('network') || lowerError.includes('connection')) {
    return 'Problème de connexion. Vérifiez votre internet et réessayez.';
  }

  // Timeout errors
  if (lowerError.includes('timeout')) {
    return 'L\'opération a pris trop de temps. Veuillez réessayer.';
  }

  // Default message based on context
  if (context) {
    const contextMessages: Record<string, string> = {
      create: 'Impossible de créer l\'élément.',
      update: 'Impossible de modifier l\'élément.',
      delete: 'Impossible de supprimer l\'élément.',
      fetch: 'Impossible de récupérer les données.',
    };
    return contextMessages[context] || 'Une erreur est survenue.';
  }

  // Generic fallback
  return 'Une erreur est survenue. Veuillez réessayer.';
}

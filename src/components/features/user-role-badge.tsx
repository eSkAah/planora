/**
 * User Role Badge Component
 *
 * Example component showcasing strict TypeScript usage
 */

import { USER_ROLES } from '@/lib/constants';
import type { UserRole } from '@/lib/database';
import { cn } from '@/lib/utils';

interface UserRoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  showDescription?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
} as const;

const variantClasses = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  outline: 'bg-transparent text-blue-600 border-blue-300 border',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

const roleColors: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-800 border-red-200',
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
  EMPLOYEE: 'bg-green-100 text-green-800 border-green-200',
  VIEWER: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

/**
 * UserRoleBadge component with strict typing
 */
export function UserRoleBadge({
  role,
  size = 'md',
  variant = 'default',
  showDescription = false,
  className,
}: UserRoleBadgeProps) {
  const roleInfo = USER_ROLES[role];

  if (!roleInfo) {
    // This should never happen with proper typing, but good defensive programming
    // eslint-disable-next-line no-console
    console.warn(`Unknown role: ${role}`);
    return null;
  }

  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  const sizeClass = sizeClasses[size];
  const colorClass =
    variant === 'default' ? roleColors[role] : variantClasses[variant];

  return (
    <div className='inline-flex flex-col'>
      <span
        className={cn(baseClasses, sizeClass, colorClass, className)}
        title={roleInfo.description}
      >
        {roleInfo.label}
      </span>

      {showDescription && (
        <span className='mt-1 text-xs text-gray-500'>
          {roleInfo.description}
        </span>
      )}
    </div>
  );
}

/**
 * Type-safe helper to check if user has specific role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 0,
    EMPLOYEE: 1,
    MANAGER: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Type-safe role validation
 */
export function isValidRole(role: string): role is UserRole {
  return role in USER_ROLES;
}

/**
 * Get roles that are accessible to the current user role
 */
export function getAccessibleRoles(currentRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = [
    'VIEWER',
    'EMPLOYEE',
    'MANAGER',
    'ADMIN',
    'SUPER_ADMIN',
  ];

  return allRoles.filter(role => {
    // Super admin can assign any role
    if (currentRole === 'SUPER_ADMIN') {
      return true;
    }

    // Admin can assign roles below them
    if (currentRole === 'ADMIN') {
      return role !== 'SUPER_ADMIN';
    }

    // Managers can only assign employee/viewer roles
    if (currentRole === 'MANAGER') {
      return role === 'EMPLOYEE' || role === 'VIEWER';
    }

    // Others can't assign roles
    return false;
  });
}

import { describe, expect, it } from '@jest/globals';

import {
  USER_ROLES,
  ROLE_PERMISSIONS,
  LEGAL_CONSTRAINTS_BY_COUNTRY,
  API_ENDPOINTS,
  SHIFT_TYPES,
  DEFAULT_USER_PREFERENCES,
} from '@/lib/constants';

describe('Constants', () => {
  describe('USER_ROLES', () => {
    it('should have all expected roles', () => {
      const expectedRoles = [
        'SUPER_ADMIN',
        'ADMIN',
        'MANAGER',
        'EMPLOYEE',
        'VIEWER',
      ];
      const actualRoles = Object.keys(USER_ROLES);

      expectedRoles.forEach(role => {
        expect(actualRoles).toContain(role);
        expect(USER_ROLES[role as keyof typeof USER_ROLES]).toHaveProperty(
          'label'
        );
        expect(USER_ROLES[role as keyof typeof USER_ROLES]).toHaveProperty(
          'description'
        );
      });
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should have permissions for all roles', () => {
      const roles = Object.keys(USER_ROLES);

      roles.forEach(role => {
        expect(ROLE_PERMISSIONS).toHaveProperty(role);
        expect(
          Array.isArray(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS])
        ).toBe(true);
      });
    });

    it('should give SUPER_ADMIN all permissions', () => {
      const superAdminPerms = ROLE_PERMISSIONS.SUPER_ADMIN;
      const expectedPerms = [
        'read',
        'write',
        'delete',
        'admin',
        'manage_users',
        'manage_schedules',
        'manage_employees',
        'view_reports',
        'manage_settings',
      ];

      expectedPerms.forEach(perm => {
        expect(superAdminPerms).toContain(perm);
      });
    });

    it('should give EMPLOYEE only read permission', () => {
      expect(ROLE_PERMISSIONS.EMPLOYEE).toEqual(['read']);
    });

    it('should give VIEWER only read permission', () => {
      expect(ROLE_PERMISSIONS.VIEWER).toEqual(['read']);
    });
  });

  describe('LEGAL_CONSTRAINTS_BY_COUNTRY', () => {
    it('should have constraints for expected countries', () => {
      const expectedCountries = ['FR', 'LU', 'DE'];

      expectedCountries.forEach(country => {
        expect(LEGAL_CONSTRAINTS_BY_COUNTRY).toHaveProperty(country);
        const constraints =
          LEGAL_CONSTRAINTS_BY_COUNTRY[
            country as keyof typeof LEGAL_CONSTRAINTS_BY_COUNTRY
          ];

        expect(constraints).toHaveProperty('name');
        expect(constraints).toHaveProperty('max_hours_per_week');
        expect(constraints).toHaveProperty('max_consecutive_days');
        expect(constraints).toHaveProperty('min_rest_between_shifts');
        expect(typeof constraints.max_hours_per_week).toBe('number');
        expect(constraints.max_hours_per_week).toBeGreaterThan(0);
      });
    });

    it('should have different constraints for different countries', () => {
      const frConstraints = LEGAL_CONSTRAINTS_BY_COUNTRY.FR;
      const luConstraints = LEGAL_CONSTRAINTS_BY_COUNTRY.LU;

      // France has 35h work week, Luxembourg has 40h
      expect(frConstraints.max_hours_per_week).toBe(35);
      expect(luConstraints.max_hours_per_week).toBe(40);
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should have all expected endpoint categories', () => {
      const expectedCategories = ['auth', 'users', 'employees', 'schedules'];

      expectedCategories.forEach(category => {
        expect(API_ENDPOINTS).toHaveProperty(category);
      });
    });

    it('should have parameterized endpoints return functions', () => {
      const userId = 'test-user-id';
      expect(API_ENDPOINTS.users.get(userId)).toBe(`/api/users/${userId}`);
      expect(API_ENDPOINTS.employees.update(userId)).toBe(
        `/api/employees/${userId}`
      );
    });
  });

  describe('SHIFT_TYPES', () => {
    it('should have all expected shift types', () => {
      const expectedShifts = ['morning', 'afternoon', 'evening', 'night'];

      expectedShifts.forEach(shift => {
        expect(SHIFT_TYPES).toHaveProperty(shift);
        const shiftData = SHIFT_TYPES[shift as keyof typeof SHIFT_TYPES];

        expect(shiftData).toHaveProperty('label');
        expect(shiftData).toHaveProperty('start');
        expect(shiftData).toHaveProperty('end');
        expect(shiftData).toHaveProperty('color');
      });
    });

    it('should have valid time formats', () => {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

      Object.values(SHIFT_TYPES).forEach(shift => {
        expect(shift.start).toMatch(timeRegex);
        expect(shift.end).toMatch(timeRegex);
      });
    });
  });

  describe('DEFAULT_USER_PREFERENCES', () => {
    it('should have all expected preference categories', () => {
      expect(DEFAULT_USER_PREFERENCES).toHaveProperty('theme');
      expect(DEFAULT_USER_PREFERENCES).toHaveProperty('language');
      expect(DEFAULT_USER_PREFERENCES).toHaveProperty('notifications');
      expect(DEFAULT_USER_PREFERENCES).toHaveProperty('dashboard');
    });

    it('should have valid notification preferences', () => {
      const notifications = DEFAULT_USER_PREFERENCES.notifications;

      expect(typeof notifications.email).toBe('boolean');
      expect(typeof notifications.push).toBe('boolean');
      expect(typeof notifications.schedule_changes).toBe('boolean');
      expect(typeof notifications.leave_requests).toBe('boolean');
    });

    it('should have valid dashboard preferences', () => {
      const dashboard = DEFAULT_USER_PREFERENCES.dashboard;

      expect(Array.isArray(dashboard.widgets)).toBe(true);
      expect(dashboard.widgets.length).toBeGreaterThan(0);
      expect(['grid', 'list']).toContain(dashboard.layout);
    });
  });
});

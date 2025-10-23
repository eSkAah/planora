-- Seed data for Planora local development
-- Creates two companies, admins, employees and sample shifts

BEGIN;

-- Companies
INSERT INTO public.companies (id, name, country, sector, size_category, timezone)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Aurora Retail', 'France', 'Retail', 'medium', 'Europe/Paris'),
  ('22222222-2222-2222-2222-222222222222', 'LuxCare Hospitality', 'Luxembourg', 'Hospitality', 'medium', 'Europe/Luxembourg')
ON CONFLICT (name) DO NOTHING;

-- Users (link to auth.users expected via Supabase auth)
INSERT INTO public.users (id, email, first_name, last_name, role, company_id, is_active)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'marie.manager@aurora.dev', 'Marie', 'Dupont', 'admin', '11111111-1111-1111-1111-111111111111', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'thomas.director@aurora.dev', 'Thomas', 'Martin', 'manager', '11111111-1111-1111-1111-111111111111', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'luc.lux@luxcare.dev', 'Luc', 'Klein', 'admin', '22222222-2222-2222-2222-222222222222', true)
ON CONFLICT (id) DO NOTHING;

-- Employees
INSERT INTO public.employees (id, user_id, company_id, employee_number, hire_date, department, position, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'EMP-AUR-001', '2023-01-01', 'Store', 'Store Manager', true),
  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'EMP-AUR-002', '2023-02-15', 'Store', 'Assistant Manager', true),
  ('55555555-5555-5555-5555-555555555555', NULL, '11111111-1111-1111-1111-111111111111', 'EMP-AUR-003', '2023-03-10', 'Store', 'Sales Associate', true),
  ('66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EMP-LUX-001', '2022-11-01', 'Operations', 'Hotel Manager', true)
ON CONFLICT (id) DO NOTHING;

-- Contracts
INSERT INTO public.contracts (id, employee_id, company_id, contract_type, title, start_date, hours_per_week, is_active, effective_from)
VALUES
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'full_time', 'CDI Store Manager', '2023-01-01', 35, true, '2023-01-01'),
  ('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'full_time', 'CDI Assistant Manager', '2023-02-15', 35, true, '2023-02-15')
ON CONFLICT (id) DO NOTHING;

-- Shift templates
INSERT INTO public.shift_templates (id, company_id, name, shift_type, start_time, end_time, min_staff_required, required_skills)
VALUES
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'Ouverture magasin', 'morning', '08:00', '16:00', 2, ARRAY['caisse', 'vente']),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Service soir', 'evening', '16:00', '00:00', 3, ARRAY['service'])
ON CONFLICT (id) DO NOTHING;

-- Sample schedule
INSERT INTO public.schedules (id, company_id, title, start_date, end_date, status)
VALUES
  ('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'Semaine 12', '2024-03-18', '2024-03-24', 'published')
ON CONFLICT (id) DO NOTHING;

-- Assign employees to schedule
INSERT INTO public.schedule_assignments (id, schedule_id, employee_id, company_id, date, start_time, end_time, shift_template_id, status)
VALUES
  ('cccccccc-dddd-eeee-ffff-000000000000', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '2024-03-18', '08:00', '16:00', '99999999-9999-9999-9999-999999999999', 'confirmed'),
  ('dddddddd-eeee-ffff-0000-111111111111', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '2024-03-18', '08:00', '16:00', '99999999-9999-9999-9999-999999999999', 'scheduled')
ON CONFLICT (id) DO NOTHING;

COMMIT;

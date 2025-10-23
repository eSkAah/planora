-- Migration: Simplify Scheduling Model
-- Description: Refactor to support simple calendar-based scheduling with AI
-- Created: 2025-10-10

BEGIN;

-- =============================================================================
-- 1. TIME SLOTS (Créneaux Horaires)
-- =============================================================================
-- Les créneaux horaires définis par l'entreprise (ex: Matin 8h-14h, Soir 17h-23h)

CREATE TABLE public.time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- "Matin", "Midi", "Soir", "Nuit", ou custom
    slot_type VARCHAR(20) NOT NULL CHECK (slot_type IN ('morning', 'afternoon', 'evening', 'night', 'custom')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 30 CHECK (break_duration_minutes >= 0),
    color_code VARCHAR(7) DEFAULT '#3B82F6', -- Pour affichage visuel
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0, -- Pour tri dans l'interface
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_timeslot_name UNIQUE(company_id, name),
    CONSTRAINT check_timeslot_duration CHECK (
        CASE WHEN end_time >= start_time
            THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60 >= 60 -- Min 1h
            ELSE EXTRACT(EPOCH FROM ('24:00:00'::TIME - start_time + end_time)) / 60 >= 60
        END
    )
);

CREATE INDEX idx_time_slots_company_id ON public.time_slots(company_id);
CREATE INDEX idx_time_slots_active ON public.time_slots(is_active);

COMMENT ON TABLE public.time_slots IS 'Créneaux horaires configurables par entreprise (ex: Matin 8h-14h)';

-- =============================================================================
-- 2. WORK POSITIONS (Postes de Travail)
-- =============================================================================
-- Les postes définis par l'entreprise (ex: Serveur, Cuisinier, Manager)

CREATE TABLE public.work_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Serveur", "Cuisinier", "Manager", etc.
    description TEXT,
    color_code VARCHAR(7) DEFAULT '#10B981', -- Pour affichage visuel
    min_staff_per_slot INTEGER DEFAULT 1 CHECK (min_staff_per_slot > 0), -- Besoin minimum
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_position_name UNIQUE(company_id, name)
);

CREATE INDEX idx_work_positions_company_id ON public.work_positions(company_id);
CREATE INDEX idx_work_positions_active ON public.work_positions(is_active);

COMMENT ON TABLE public.work_positions IS 'Postes de travail configurables par entreprise';

-- =============================================================================
-- 3. COMPANY CLOSURE DAYS (Jours de Fermeture)
-- =============================================================================
-- Jours de fermeture prévus (fériés, fermeture annuelle, etc.)

CREATE TABLE public.company_closure_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    closure_date DATE NOT NULL,
    reason VARCHAR(200), -- "Noël", "Fermeture annuelle", "Travaux", etc.
    is_recurring BOOLEAN DEFAULT false, -- Si c'est un jour férié récurrent
    recurrence_rule VARCHAR(50), -- "yearly-12-25" pour Noël par exemple
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_closure_date UNIQUE(company_id, closure_date)
);

CREATE INDEX idx_company_closure_days_company_id ON public.company_closure_days(company_id);
CREATE INDEX idx_company_closure_days_date ON public.company_closure_days(closure_date);

COMMENT ON TABLE public.company_closure_days IS 'Jours de fermeture prévus de l\'entreprise';

-- =============================================================================
-- 4. EMPLOYEE PREFERENCES (Désidérata)
-- =============================================================================
-- Préférences des employés pour le planning

CREATE TABLE public.employee_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    -- Préférences de créneaux horaires
    preferred_time_slots UUID[] DEFAULT '{}', -- IDs des time_slots préférés
    avoided_time_slots UUID[] DEFAULT '{}', -- IDs des time_slots à éviter

    -- Préférences de jours
    preferred_days VARCHAR(20)[] DEFAULT '{}', -- ['monday', 'tuesday', ...]
    avoided_days VARCHAR(20)[] DEFAULT '{}', -- ['saturday', 'sunday']

    -- Contraintes
    max_days_per_week INTEGER CHECK (max_days_per_week BETWEEN 1 AND 7),
    max_consecutive_days INTEGER CHECK (max_consecutive_days BETWEEN 1 AND 7),
    requires_weekends_off BOOLEAN DEFAULT false,

    -- Notes libres
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_employee_preferences UNIQUE(employee_id)
);

CREATE INDEX idx_employee_preferences_employee_id ON public.employee_preferences(employee_id);
CREATE INDEX idx_employee_preferences_company_id ON public.employee_preferences(company_id);

COMMENT ON TABLE public.employee_preferences IS 'Désidérata et préférences des employés pour le planning';

-- =============================================================================
-- 5. ABSENCES (Congés, RTT, Maladie, École)
-- =============================================================================
-- Gestion de toutes les absences

CREATE TYPE absence_type AS ENUM (
    'paid_leave',      -- Congés payés
    'unpaid_leave',    -- Congés sans solde
    'rtt',             -- RTT
    'sick_leave',      -- Arrêt maladie
    'school',          -- École (alternants)
    'maternity',       -- Congé maternité
    'paternity',       -- Congé paternité
    'training',        -- Formation
    'other'            -- Autre
);

CREATE TYPE absence_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

CREATE TABLE public.absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    absence_type absence_type NOT NULL,
    status absence_status DEFAULT 'pending',

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Détails
    reason TEXT,
    medical_certificate_url TEXT, -- Pour arrêt maladie

    -- Approbation
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    rejection_reason TEXT,

    -- Métadonnées
    total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    is_half_day BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_absence_dates CHECK (end_date >= start_date),
    CONSTRAINT check_approved_logic CHECK (
        (status = 'approved' AND approved_at IS NOT NULL AND approved_by IS NOT NULL)
        OR status <> 'approved'
    )
);

CREATE INDEX idx_absences_employee_id ON public.absences(employee_id);
CREATE INDEX idx_absences_company_id ON public.absences(company_id);
CREATE INDEX idx_absences_dates ON public.absences(start_date, end_date);
CREATE INDEX idx_absences_type ON public.absences(absence_type);
CREATE INDEX idx_absences_status ON public.absences(status);

COMMENT ON TABLE public.absences IS 'Gestion des absences (congés, RTT, maladie, école, etc.)';

-- =============================================================================
-- 6. UPDATE EMPLOYEES TABLE
-- =============================================================================
-- Ajouter la référence au poste de travail

ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS work_position_id UUID REFERENCES public.work_positions(id);

CREATE INDEX IF NOT EXISTS idx_employees_work_position_id ON public.employees(work_position_id);

COMMENT ON COLUMN public.employees.work_position_id IS 'Poste de travail principal de l\'employé';

-- =============================================================================
-- 7. UPDATE COMPANIES TABLE
-- =============================================================================
-- Ajouter les jours d'ouverture

ALTER TABLE public.companies
    ADD COLUMN IF NOT EXISTS opening_days VARCHAR(20)[] DEFAULT '{monday,tuesday,wednesday,thursday,friday,saturday,sunday}',
    ADD COLUMN IF NOT EXISTS typical_opening_time TIME DEFAULT '08:00:00',
    ADD COLUMN IF NOT EXISTS typical_closing_time TIME DEFAULT '20:00:00';

COMMENT ON COLUMN public.companies.opening_days IS 'Jours d\'ouverture habituels de l\'entreprise';
COMMENT ON COLUMN public.companies.typical_opening_time IS 'Heure d\'ouverture typique';
COMMENT ON COLUMN public.companies.typical_closing_time IS 'Heure de fermeture typique';

-- =============================================================================
-- 8. SIMPLIFY SCHEDULE ASSIGNMENTS
-- =============================================================================
-- Rendre shift_template_id optionnel et ajouter référence directe au time_slot

ALTER TABLE public.schedule_assignments
    ALTER COLUMN shift_template_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS time_slot_id UUID REFERENCES public.time_slots(id),
    ADD COLUMN IF NOT EXISTS work_position_id UUID REFERENCES public.work_positions(id);

CREATE INDEX IF NOT EXISTS idx_schedule_assignments_time_slot_id ON public.schedule_assignments(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_work_position_id ON public.schedule_assignments(work_position_id);

COMMENT ON COLUMN public.schedule_assignments.time_slot_id IS 'Créneau horaire assigné';
COMMENT ON COLUMN public.schedule_assignments.work_position_id IS 'Poste de travail assigné';

-- =============================================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- =============================================================================

ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_closure_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- Time Slots Policies
CREATE POLICY "Time slots company access" ON public.time_slots
    FOR ALL USING (company_id = auth.user_company_id());

-- Work Positions Policies
CREATE POLICY "Work positions company access" ON public.work_positions
    FOR ALL USING (company_id = auth.user_company_id());

-- Company Closure Days Policies
CREATE POLICY "Closure days company access" ON public.company_closure_days
    FOR ALL USING (company_id = auth.user_company_id());

-- Employee Preferences Policies
CREATE POLICY "Employee preferences company access" ON public.employee_preferences
    FOR ALL USING (company_id = auth.user_company_id());

-- Absences Policies
CREATE POLICY "Absences company access" ON public.absences
    FOR SELECT USING (company_id = auth.user_company_id());

CREATE POLICY "Absences employee can request" ON public.absences
    FOR INSERT WITH CHECK (
        company_id = auth.user_company_id()
        AND employee_id IN (
            SELECT id FROM public.employees WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Absences managers can manage" ON public.absences
    FOR UPDATE USING (
        company_id = auth.user_company_id()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'manager')
        )
    );

-- =============================================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE TRIGGER handle_updated_at_time_slots
    BEFORE UPDATE ON public.time_slots
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_work_positions
    BEFORE UPDATE ON public.work_positions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_company_closure_days
    BEFORE UPDATE ON public.company_closure_days
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_employee_preferences
    BEFORE UPDATE ON public.employee_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_absences
    BEFORE UPDATE ON public.absences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 11. DEFAULT DATA HELPER FUNCTION
-- =============================================================================
-- Function pour créer les créneaux par défaut lors de la création d'une entreprise

CREATE OR REPLACE FUNCTION public.create_default_time_slots_for_company(p_company_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Créer 3 créneaux par défaut
    INSERT INTO public.time_slots (company_id, name, slot_type, start_time, end_time, break_duration_minutes, color_code, display_order)
    VALUES
        (p_company_id, 'Matin', 'morning', '08:00:00', '14:00:00', 30, '#F59E0B', 1),
        (p_company_id, 'Après-midi', 'afternoon', '14:00:00', '20:00:00', 30, '#3B82F6', 2),
        (p_company_id, 'Soir', 'evening', '17:00:00', '23:00:00', 30, '#8B5CF6', 3);
END;
$$;

COMMENT ON FUNCTION public.create_default_time_slots_for_company IS 'Crée les créneaux horaires par défaut pour une nouvelle entreprise';

-- =============================================================================
-- 12. UPDATE SCHEDULES TABLE METADATA
-- =============================================================================
-- Ajouter metadata pour stocker les stats de génération IA

ALTER TABLE public.schedules
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN public.schedules.metadata IS 'Métadonnées du planning (stats IA, warnings, etc.)';

COMMIT;

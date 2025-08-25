-- ==============================================
-- PHASE 2: BASE DE DONNÉES & MODÈLES (T021-T027)
-- ==============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types first
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'employee', 'viewer');
CREATE TYPE contract_type AS ENUM ('full_time', 'part_time', 'temporary', 'intern', 'freelance');
CREATE TYPE shift_type AS ENUM ('morning', 'afternoon', 'evening', 'night', 'custom');
CREATE TYPE schedule_status AS ENUM ('draft', 'published', 'archived');

-- T021 - Créer la table `companies` (multi-tenant)
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(50) NOT NULL CHECK (country IN ('France', 'Luxembourg')),
    sector VARCHAR(50) NOT NULL,
    size_category VARCHAR(20) DEFAULT 'small' CHECK (size_category IN ('small', 'medium', 'large')),
    legal_work_hours_per_week INTEGER DEFAULT 35 CHECK (legal_work_hours_per_week > 0),
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- T022 - Créer la table `users` avec rôles
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role DEFAULT 'employee',
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- T023 - Créer la table `employees` avec toutes les informations
CREATE TABLE public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    employee_number VARCHAR(20) UNIQUE,
    
    -- Personal Information
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Professional Information
    hire_date DATE NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    manager_id UUID REFERENCES public.employees(id),
    
    -- Work Configuration
    max_hours_per_week INTEGER DEFAULT 35 CHECK (max_hours_per_week > 0),
    max_consecutive_days INTEGER DEFAULT 6 CHECK (max_consecutive_days > 0),
    min_rest_hours INTEGER DEFAULT 11 CHECK (min_rest_hours > 0),
    
    -- Skills & Qualifications
    skills TEXT[],
    qualifications JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    
    -- Availability & Preferences  
    availability JSONB DEFAULT '{}', -- Disponibilités par jour de la semaine
    shift_preferences JSONB DEFAULT '{}', -- Préférences de créneaux
    unavailable_dates JSONB DEFAULT '[]', -- Dates d'indisponibilité
    
    -- Performance & Notes
    performance_rating NUMERIC(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
    notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    termination_date DATE,
    termination_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_termination_logic CHECK (
        (is_active = true AND termination_date IS NULL) OR 
        (is_active = false AND termination_date IS NOT NULL)
    )
);

-- T024 - Créer la table `contracts` (types de contrats flexibles)
CREATE TABLE public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Contract Details
    contract_type contract_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for permanent contracts
    
    -- Working Time
    hours_per_week NUMERIC(5,2) NOT NULL CHECK (hours_per_week > 0),
    hours_per_day NUMERIC(4,2) CHECK (hours_per_day > 0),
    days_per_week INTEGER DEFAULT 5 CHECK (days_per_week BETWEEN 1 AND 7),
    
    -- Annual Limits
    max_annual_hours INTEGER,
    current_annual_hours INTEGER DEFAULT 0,
    
    -- Overtime Configuration
    overtime_allowed BOOLEAN DEFAULT true,
    max_overtime_hours_per_week INTEGER DEFAULT 0,
    overtime_rate NUMERIC(4,2) DEFAULT 1.25,
    
    -- Contract Status
    is_active BOOLEAN DEFAULT true,
    signed_at TIMESTAMP WITH TIME ZONE,
    effective_from DATE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_contract_dates CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT check_effective_date CHECK (effective_from >= start_date)
);

-- T025 - Créer la table `shift_templates` (modèles de postes)
CREATE TABLE public.shift_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Template Info
    name VARCHAR(100) NOT NULL,
    description TEXT,
    shift_type shift_type NOT NULL,
    color_code VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    
    -- Timing
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN end_time >= start_time THEN 
                EXTRACT(EPOCH FROM (end_time - start_time)) / 60
            ELSE 
                EXTRACT(EPOCH FROM ('24:00:00'::TIME - start_time + end_time)) / 60
        END
    ) STORED,
    
    -- Break Configuration
    break_duration_minutes INTEGER DEFAULT 0,
    is_paid_break BOOLEAN DEFAULT true,
    
    -- Staffing Requirements
    min_staff_required INTEGER DEFAULT 1 CHECK (min_staff_required > 0),
    max_staff_allowed INTEGER CHECK (max_staff_allowed >= min_staff_required),
    
    -- Skills Required
    required_skills TEXT[] DEFAULT '{}',
    required_qualifications JSONB DEFAULT '[]',
    
    -- Rules & Constraints
    is_weekend_shift BOOLEAN DEFAULT false,
    is_holiday_shift BOOLEAN DEFAULT false,
    overtime_eligible BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT true, -- false for specific one-time shifts
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, name)
);

-- T026 - Créer la table `schedules` (plannings générés)
CREATE TABLE public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Schedule Period
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Generation Info
    generated_by UUID REFERENCES public.users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generation_method VARCHAR(20) DEFAULT 'ai' CHECK (generation_method IN ('manual', 'ai', 'template')),
    
    -- AI Generation Parameters (if applicable)
    ai_prompt TEXT,
    ai_constraints JSONB DEFAULT '{}',
    ai_optimization_goals JSONB DEFAULT '[]',
    
    -- Status & Approval
    status schedule_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES public.users(id),
    
    -- Metrics & Quality
    total_hours NUMERIC(8,2) DEFAULT 0,
    total_cost NUMERIC(10,2) DEFAULT 0,
    coverage_score NUMERIC(5,2) CHECK (coverage_score >= 0 AND coverage_score <= 100),
    satisfaction_score NUMERIC(5,2) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
    
    -- Version Control
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES public.schedules(id),
    
    -- Notifications
    notifications_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_schedule_dates CHECK (end_date >= start_date),
    CONSTRAINT check_published_logic CHECK (
        (status = 'published' AND published_at IS NOT NULL AND published_by IS NOT NULL) OR
        (status != 'published')
    )
);

-- T027 - Créer la table `schedule_assignments` (affectations)
CREATE TABLE public.schedule_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    shift_template_id UUID REFERENCES public.shift_templates(id),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Assignment Details
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Override Information (if different from template)
    actual_start_time TIME, -- For clock-in/out tracking
    actual_end_time TIME,
    
    -- Break Information
    break_duration_minutes INTEGER DEFAULT 0,
    break_start_time TIME,
    break_end_time TIME,
    
    -- Status & Tracking
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled')
    ),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES public.users(id),
    
    -- Hours & Pay Calculation
    scheduled_hours NUMERIC(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN end_time >= start_time THEN 
                EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
            ELSE 
                EXTRACT(EPOCH FROM ('24:00:00'::TIME - start_time + end_time)) / 3600
        END - (COALESCE(break_duration_minutes, 0)::NUMERIC / 60)
    ) STORED,
    
    actual_hours NUMERIC(4,2),
    is_overtime BOOLEAN DEFAULT false,
    overtime_hours NUMERIC(4,2) DEFAULT 0,
    
    -- Notes & Comments
    notes TEXT,
    employee_notes TEXT, -- Notes from employee
    manager_notes TEXT, -- Notes from manager
    
    -- Replacement Tracking
    original_employee_id UUID REFERENCES public.employees(id), -- If this is a replacement
    replacement_reason TEXT,
    replacement_requested_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_actual_hours_logic CHECK (
        (status IN ('completed', 'in_progress') AND actual_hours IS NOT NULL) OR
        (status NOT IN ('completed', 'in_progress'))
    ),
    CONSTRAINT unique_employee_date_time UNIQUE (employee_id, date, start_time)
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignments ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS POLICIES (Basic Multi-tenant Security)
-- ==============================================

-- Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION auth.user_company_id() 
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$;

-- Companies: Users can only see their own company
CREATE POLICY "Users can view their own company" ON public.companies
    FOR SELECT USING (id = auth.user_company_id());

CREATE POLICY "Allow company creation" ON public.companies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Company admins can update" ON public.companies
    FOR UPDATE USING (
        id = auth.user_company_id() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Users: Multi-tenant access within company
CREATE POLICY "Users can view users in their company" ON public.users
    FOR SELECT USING (company_id = auth.user_company_id());

CREATE POLICY "Allow user profile creation" ON public.users
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- Employees: Company-scoped access
CREATE POLICY "Employees company access" ON public.employees
    FOR ALL USING (company_id = auth.user_company_id());

CREATE POLICY "Allow employee creation" ON public.employees
    FOR INSERT WITH CHECK (company_id = auth.user_company_id());

-- Contracts: Company-scoped access
CREATE POLICY "Contracts company access" ON public.contracts
    FOR ALL USING (company_id = auth.user_company_id());

-- Shift Templates: Company-scoped access
CREATE POLICY "Shift templates company access" ON public.shift_templates
    FOR ALL USING (company_id = auth.user_company_id());

-- Schedules: Company-scoped access
CREATE POLICY "Schedules company access" ON public.schedules
    FOR ALL USING (company_id = auth.user_company_id());

-- Schedule Assignments: Company-scoped access
CREATE POLICY "Schedule assignments company access" ON public.schedule_assignments
    FOR ALL USING (company_id = auth.user_company_id());

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Companies
CREATE INDEX idx_companies_country ON public.companies(country);
CREATE INDEX idx_companies_sector ON public.companies(sector);

-- Users
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- Employees
CREATE INDEX idx_employees_company_id ON public.employees(company_id);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_manager_id ON public.employees(manager_id);
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_employees_hire_date ON public.employees(hire_date);
CREATE INDEX idx_employees_is_active ON public.employees(is_active);

-- Contracts
CREATE INDEX idx_contracts_employee_id ON public.contracts(employee_id);
CREATE INDEX idx_contracts_company_id ON public.contracts(company_id);
CREATE INDEX idx_contracts_type ON public.contracts(contract_type);
CREATE INDEX idx_contracts_dates ON public.contracts(start_date, end_date);
CREATE INDEX idx_contracts_active ON public.contracts(is_active);

-- Shift Templates
CREATE INDEX idx_shift_templates_company_id ON public.shift_templates(company_id);
CREATE INDEX idx_shift_templates_type ON public.shift_templates(shift_type);
CREATE INDEX idx_shift_templates_active ON public.shift_templates(is_active);
CREATE INDEX idx_shift_templates_timing ON public.shift_templates(start_time, end_time);

-- Schedules
CREATE INDEX idx_schedules_company_id ON public.schedules(company_id);
CREATE INDEX idx_schedules_dates ON public.schedules(start_date, end_date);
CREATE INDEX idx_schedules_status ON public.schedules(status);
CREATE INDEX idx_schedules_generated_by ON public.schedules(generated_by);

-- Schedule Assignments
CREATE INDEX idx_schedule_assignments_schedule_id ON public.schedule_assignments(schedule_id);
CREATE INDEX idx_schedule_assignments_employee_id ON public.schedule_assignments(employee_id);
CREATE INDEX idx_schedule_assignments_company_id ON public.schedule_assignments(company_id);
CREATE INDEX idx_schedule_assignments_date ON public.schedule_assignments(date);
CREATE INDEX idx_schedule_assignments_status ON public.schedule_assignments(status);
CREATE INDEX idx_schedule_assignments_employee_date ON public.schedule_assignments(employee_id, date);

-- ==============================================
-- TRIGGERS AND FUNCTIONS
-- ==============================================

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_companies
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
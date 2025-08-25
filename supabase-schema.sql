-- T021 - Créer la table `companies` (multi-tenant)
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(50) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- T022 - Créer la table `users` avec rôles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'employee', 'viewer');

CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role DEFAULT 'employee',
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be expanded later)
-- Companies: Users can only see their own company
CREATE POLICY "Users can view their own company" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Users: Users can see other users in their company
CREATE POLICY "Users can view users in their company" ON public.users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Allow inserts for company creation (will be restricted later)
CREATE POLICY "Allow company creation" ON public.companies
    FOR INSERT WITH CHECK (true);

-- Allow user profile creation
CREATE POLICY "Allow user profile creation" ON public.users
    FOR INSERT WITH CHECK (id = auth.uid());

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
-- =====================================================
-- Solar CRM - Complete Database Schema
-- =====================================================
-- Project: gqalreoyglltniepgnnr
-- Generated: November 27, 2025
-- PostgreSQL Version: 17.6.1
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL CHECK (phone ~ '^[1-9][0-9]{9}$'),
    role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'office', 'installer', 'customer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    assigned_area TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    agent_id TEXT UNIQUE,
    office_id TEXT UNIQUE,
    customer_id TEXT UNIQUE
);

COMMENT ON TABLE public.users IS 'Stores all user accounts across different roles';
COMMENT ON COLUMN public.users.agent_id IS 'Visible ID for agents to display on website';
COMMENT ON COLUMN public.users.office_id IS 'Visible ID for offices to display on website';
COMMENT ON COLUMN public.users.customer_id IS 'Visible ID for customers to display on website';
COMMENT ON COLUMN public.users.phone IS 'Phone number must be 10 digits starting with 1-9';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ⚠️ WARNING: RLS is currently DISABLED on this table
-- This is a CRITICAL SECURITY ISSUE
-- Enable RLS: ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. LEADS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL CHECK (phone ~ '^[1-9][0-9]{9}$'),
    email TEXT,
    address TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN (
        'lead',
        'lead_interested',
        'lead_processing',
        'lead_completed',
        'lead_cancelled'
    )),
    created_by UUID REFERENCES public.users(id),
    customer_account_id UUID REFERENCES public.users(id),
    installer_id UUID REFERENCES public.users(id),
    source TEXT NOT NULL CHECK (source IN ('agent', 'office', 'customer', 'self')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.leads IS 'Tracks solar installation leads through their lifecycle';
COMMENT ON COLUMN public.leads.status IS 'Lead status: lead (initial contact), lead_interested (customer agreed), lead_processing (form filled + active project), lead_completed (finished), lead_cancelled (declined/withdrew)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_customer_account_id ON public.leads(customer_account_id);
CREATE INDEX IF NOT EXISTS idx_leads_installer_id ON public.leads(installer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- RLS Enabled: ✅

-- =====================================================
-- 3. DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('mandatory', 'optional', 'installation', 'customer', 'admin')),
    document_category TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'corrupted', 'replaced')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.documents IS 'Manages all document uploads for leads';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON public.documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
-- ⚠️ Missing index: CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);

-- RLS Enabled: ✅

-- =====================================================
-- 4. STEP_MASTER TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.step_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_name TEXT NOT NULL,
    order_index NUMERIC NOT NULL,
    allowed_roles TEXT[] NOT NULL,
    remarks_required BOOLEAN DEFAULT FALSE,
    attachments_allowed BOOLEAN DEFAULT FALSE,
    customer_upload BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    requires_installer_assignment BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE public.step_master IS 'Defines workflow steps (admin-editable)';
COMMENT ON COLUMN public.step_master.order_index IS 'Uses fractional ordering for flexible reordering';
COMMENT ON COLUMN public.step_master.requires_installer_assignment IS 'Indicates if this step requires an installer to be assigned to the lead';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_step_master_order_index ON public.step_master(order_index);

-- RLS Enabled: ✅

-- =====================================================
-- 5. LEAD_STEPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lead_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES public.step_master(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'pending', 'completed')),
    completed_by UUID REFERENCES public.users(id),
    completed_at TIMESTAMPTZ,
    remarks TEXT,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lead_id, step_id)
);

COMMENT ON TABLE public.lead_steps IS 'Tracks step completion for each lead';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_steps_lead_id ON public.lead_steps(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_steps_step_id ON public.lead_steps(step_id);
CREATE INDEX IF NOT EXISTS idx_lead_steps_status ON public.lead_steps(status);
-- ⚠️ Missing index: CREATE INDEX idx_lead_steps_completed_by ON public.lead_steps(completed_by);

-- RLS Enabled: ✅

-- =====================================================
-- 6. ACTIVITY_LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.activity_log IS 'Audit trail for all actions in the system';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_lead_id ON public.activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON public.activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);

-- RLS Enabled: ✅

-- =====================================================
-- 7. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'User notifications for various events';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
-- ⚠️ Missing index: CREATE INDEX idx_notifications_lead_id ON public.notifications(lead_id);

-- RLS Enabled: ✅

-- =====================================================
-- 8. CUSTOMER_PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    lead_id UUID REFERENCES public.leads(id),
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    pin_code TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    aadhaar_front_path TEXT,
    aadhaar_back_path TEXT,
    electricity_bill_path TEXT,
    bank_passbook_path TEXT,
    cancelled_cheque_path TEXT,
    pan_card_path TEXT,
    itr_documents_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.customer_profiles IS 'Detailed customer information (PM Suryaghar form data)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON public.customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_lead_id ON public.customer_profiles(lead_id);

-- RLS Enabled: ✅

-- =====================================================
-- 9. CUSTOMER_PROFILE_DRAFTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customer_profile_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    draft_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.customer_profile_drafts IS 'Stores partial customer profile form data as drafts for later completion';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_profile_drafts_user_id ON public.customer_profile_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profile_drafts_lead_id ON public.customer_profile_drafts(lead_id);

-- RLS Enabled: ✅

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_step_master_updated_at
    BEFORE UPDATE ON public.step_master
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_steps_updated_at
    BEFORE UPDATE ON public.lead_steps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON public.customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_profile_drafts_updated_at
    BEFORE UPDATE ON public.customer_profile_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STORED PROCEDURES / FUNCTIONS
-- =====================================================

-- Generate unique user IDs
CREATE OR REPLACE FUNCTION public.generate_unique_user_id(role_prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
DECLARE
    new_id TEXT;
    id_exists BOOLEAN;
BEGIN
    LOOP
        new_id := 'YN' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0') || role_prefix;
        
        CASE role_prefix
            WHEN 'A' THEN
                SELECT EXISTS(SELECT 1 FROM public.users WHERE agent_id = new_id) INTO id_exists;
            WHEN 'O' THEN
                SELECT EXISTS(SELECT 1 FROM public.users WHERE office_id = new_id) INTO id_exists;
            WHEN 'C' THEN
                SELECT EXISTS(SELECT 1 FROM public.users WHERE customer_id = new_id) INTO id_exists;
            ELSE
                id_exists := FALSE;
        END CASE;
        
        EXIT WHEN NOT id_exists;
    END LOOP;
    
    RETURN new_id;
END;
$$;

-- Auto-generate user IDs on insert
CREATE OR REPLACE FUNCTION public.auto_generate_user_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.role = 'agent' AND NEW.agent_id IS NULL THEN
        NEW.agent_id := public.generate_unique_user_id('A');
    ELSIF NEW.role = 'office' AND NEW.office_id IS NULL THEN
        NEW.office_id := public.generate_unique_user_id('O');
    ELSIF NEW.role = 'customer' AND NEW.customer_id IS NULL THEN
        NEW.customer_id := public.generate_unique_user_id('C');
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_user_ids
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_user_ids();

-- Normalize phone numbers
CREATE OR REPLACE FUNCTION public.normalize_phone(phone_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN REGEXP_REPLACE(phone_input, '[^0-9]', '', 'g');
END;
$$;

-- Link customer to existing lead
CREATE OR REPLACE FUNCTION public.link_customer_to_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
DECLARE
    existing_lead_id UUID;
BEGIN
    IF NEW.role = 'customer' THEN
        SELECT id INTO existing_lead_id
        FROM public.leads
        WHERE phone = NEW.phone
        AND customer_account_id IS NULL
        LIMIT 1;
        
        IF existing_lead_id IS NOT NULL THEN
            UPDATE public.leads
            SET customer_account_id = NEW.id,
                status = 'lead_interested'
            WHERE id = existing_lead_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Check mandatory documents
CREATE OR REPLACE FUNCTION public.check_mandatory_documents(p_lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
DECLARE
    required_docs TEXT[] := ARRAY[
        'aadhaar_front',
        'aadhaar_back',
        'electricity_bill',
        'bank_passbook',
        'cancelled_cheque',
        'pan_card'
    ];
    doc TEXT;
    doc_exists BOOLEAN;
BEGIN
    FOREACH doc IN ARRAY required_docs
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.documents
            WHERE lead_id = p_lead_id
            AND document_category = doc
            AND status = 'valid'
        ) INTO doc_exists;
        
        IF NOT doc_exists THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$;

-- Update lead status
CREATE OR REPLACE FUNCTION public.update_lead_status()
RETURNS TRIGGER
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
DECLARE
    profile_exists BOOLEAN;
    docs_complete BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.customer_profiles
        WHERE lead_id = NEW.lead_id
    ) INTO profile_exists;
    
    SELECT public.check_mandatory_documents(NEW.lead_id) INTO docs_complete;
    
    IF profile_exists AND docs_complete THEN
        UPDATE public.leads
        SET status = 'lead_processing'
        WHERE id = NEW.lead_id
        AND status = 'lead_interested';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Initialize lead timeline
CREATE OR REPLACE FUNCTION public.initialize_lead_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.lead_steps (lead_id, step_id, status)
    SELECT 
        NEW.id,
        id,
        CASE 
            WHEN order_index = (SELECT MIN(order_index) FROM public.step_master)
            THEN 'pending'
            ELSE 'upcoming'
        END
    FROM public.step_master
    ORDER BY order_index;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_initialize_lead_timeline
    AFTER INSERT ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_lead_timeline();

-- Complete step
CREATE OR REPLACE FUNCTION public.complete_step(
    p_lead_id UUID,
    p_step_id UUID,
    p_remarks TEXT DEFAULT NULL,
    p_attachments TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
-- ⚠️ Missing: SET search_path = public, pg_temp
AS $$
DECLARE
    current_user_id UUID;
    current_user_role TEXT;
    step_allowed_roles TEXT[];
    next_step_id UUID;
    is_last_step BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    SELECT role INTO current_user_role
    FROM public.users
    WHERE id = current_user_id;
    
    SELECT allowed_roles INTO step_allowed_roles
    FROM public.step_master
    WHERE id = p_step_id;
    
    IF current_user_role != 'admin' AND NOT (current_user_role = ANY(step_allowed_roles)) THEN
        RAISE EXCEPTION 'User does not have permission to complete this step';
    END IF;
    
    UPDATE public.lead_steps
    SET 
        status = 'completed',
        completed_by = current_user_id,
        completed_at = NOW(),
        remarks = COALESCE(p_remarks, remarks),
        attachments = COALESCE(p_attachments, attachments)
    WHERE lead_id = p_lead_id
    AND step_id = p_step_id;
    
    SELECT id INTO next_step_id
    FROM public.step_master
    WHERE order_index > (
        SELECT order_index FROM public.step_master WHERE id = p_step_id
    )
    ORDER BY order_index
    LIMIT 1;
    
    IF next_step_id IS NOT NULL THEN
        UPDATE public.lead_steps
        SET status = 'pending'
        WHERE lead_id = p_lead_id
        AND step_id = next_step_id;
    ELSE
        UPDATE public.leads
        SET status = 'lead_completed'
        WHERE id = p_lead_id;
    END IF;
END;
$$;

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert admin user (if not exists)
INSERT INTO public.users (email, name, phone, role, status)
VALUES ('admin@solarcrm.com', 'Admin User', '9999999999', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample steps
INSERT INTO public.step_master (step_name, order_index, allowed_roles, remarks_required, attachments_allowed)
VALUES 
    ('Lead Created', 1000, ARRAY['admin', 'office', 'agent'], FALSE, FALSE),
    ('Customer Profile Submitted', 2000, ARRAY['admin', 'office', 'customer'], FALSE, FALSE),
    ('Documents Uploaded', 3000, ARRAY['admin', 'office', 'customer', 'agent'], FALSE, TRUE),
    ('Survey Scheduled', 4000, ARRAY['admin', 'office'], TRUE, FALSE),
    ('Survey Completed', 5000, ARRAY['admin', 'office'], TRUE, TRUE),
    ('Proposal Sent', 6000, ARRAY['admin', 'office'], TRUE, TRUE),
    ('Payment Received', 7000, ARRAY['admin', 'office'], TRUE, FALSE),
    ('Installation Scheduled', 8000, ARRAY['admin', 'office'], TRUE, FALSE),
    ('Installation Completed', 9000, ARRAY['admin', 'office', 'installer'], TRUE, TRUE),
    ('Net Meter Applied', 10000, ARRAY['admin', 'office'], TRUE, TRUE),
    ('Commissioning', 11000, ARRAY['admin', 'office'], TRUE, TRUE),
    ('Subsidy Applied', 12000, ARRAY['admin', 'office'], TRUE, TRUE),
    ('Project Closed', 13000, ARRAY['admin', 'office'], TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- NOTES & WARNINGS
-- =====================================================

-- ⚠️ CRITICAL ISSUES:
-- 1. RLS is DISABLED on public.users table
-- 2. 15 functions missing SET search_path
-- 3. Leaked password protection disabled in Auth

-- ⚠️ PERFORMANCE ISSUES:
-- 1. Missing indexes on foreign keys (uploaded_by, completed_by, lead_id in notifications)
-- 2. Auth RLS policies need optimization (wrap auth.uid() in SELECT)
-- 3. Multiple permissive policies should be consolidated

-- ⚠️ DATA QUALITY ISSUES:
-- 1. Some step_master records have corrupted names
-- 2. Duplicate roles in allowed_roles arrays

-- =====================================================
-- END OF SCHEMA
-- =====================================================

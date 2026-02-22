/**
 * SQL helpers for manager accounts.
 * Run these in Supabase SQL Editor once.
 */

const DD = '$$';

export const MANAGERS_TABLE_SQL = `
-- Managers table (role-based admin access)
CREATE TABLE IF NOT EXISTS public.managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS managers_user_id_idx ON public.managers(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS managers_user_role_idx ON public.managers(user_id, role);

-- Migration for older schema
ALTER TABLE public.managers DROP CONSTRAINT IF EXISTS managers_email_key;
`;

export const CREATE_MANAGER_RPC_SQL = `
-- Function: create_manager
-- Creates an auth user and managers record directly in the DB.
CREATE OR REPLACE FUNCTION public.create_manager(
  p_email TEXT,
  p_password TEXT,
  p_role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS ${DD}
DECLARE
  new_uid UUID;
  existing_uid UUID;
  mgr_record RECORD;
BEGIN
  SELECT id INTO existing_uid FROM auth.users WHERE email = p_email;

  IF existing_uid IS NULL THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      aud, role, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      crypt(p_password, gen_salt('bf')),
      NOW(),
      'authenticated', 'authenticated',
      jsonb_build_object('role', 'manager'),
      NOW(), NOW(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), new_uid, new_uid::text,
      jsonb_build_object('sub', new_uid::text, 'email', p_email),
      'email', NOW(), NOW(), NOW()
    );
  ELSE
    new_uid := existing_uid;
  END IF;

  INSERT INTO public.managers (user_id, email, role, is_active)
  VALUES (new_uid, p_email, p_role, true)
  ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;

  SELECT * INTO mgr_record FROM public.managers WHERE user_id = new_uid AND role = p_role;
  RETURN row_to_json(mgr_record);
END;
${DD};
`;

export const UPDATE_MANAGER_USER_RPC_SQL = `
-- Function: update_manager_user
-- Updates manager's auth email/password and syncs email in managers table.
CREATE OR REPLACE FUNCTION public.update_manager_user(
  p_user_id UUID,
  p_email TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS ${DD}
DECLARE
  mgr_record RECORD;
BEGIN
  UPDATE auth.users
  SET
    email = p_email,
    updated_at = NOW(),
    encrypted_password = CASE
      WHEN p_password IS NULL OR length(trim(p_password)) = 0 THEN encrypted_password
      ELSE crypt(p_password, gen_salt('bf'))
    END
  WHERE id = p_user_id;

  UPDATE auth.identities
  SET
    identity_data = jsonb_set(identity_data, '{email}', to_jsonb(p_email::text), true),
    updated_at = NOW()
  WHERE user_id = p_user_id AND provider = 'email';

  UPDATE public.managers
  SET email = p_email
  WHERE user_id = p_user_id;

  SELECT * INTO mgr_record FROM public.managers WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1;
  RETURN row_to_json(mgr_record);
END;
${DD};
`;

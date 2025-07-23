-- Add missing RLS policies for alertes_utilisateurs table (GDPR compliance)

-- Policy for users to update their own subscription preferences
CREATE POLICY "Users can update their own subscription" 
    ON public.alertes_utilisateurs 
    FOR UPDATE 
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Policy for users to delete their own subscription (unsubscribe)
CREATE POLICY "Users can delete their own subscription" 
    ON public.alertes_utilisateurs 
    FOR DELETE 
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Add email validation constraint
ALTER TABLE public.alertes_utilisateurs 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add commune validation constraint  
ALTER TABLE public.alertes_utilisateurs 
ADD CONSTRAINT valid_commune_format 
CHECK (char_length(commune) >= 1 AND char_length(commune) <= 100 AND commune ~ '^[a-zA-ZÀ-ÿ\s\-'']+$');
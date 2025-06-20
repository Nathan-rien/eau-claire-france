
-- Créer la table pour les abonnements aux alertes
CREATE TABLE public.alertes_utilisateurs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    commune TEXT NOT NULL,
    date_inscription TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    consent_rgpd BOOLEAN NOT NULL DEFAULT true,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter un index sur l'email pour les recherches
CREATE INDEX idx_alertes_utilisateurs_email ON public.alertes_utilisateurs(email);

-- Ajouter un index sur la commune pour les notifications
CREATE INDEX idx_alertes_utilisateurs_commune ON public.alertes_utilisateurs(commune);

-- Empêcher les doublons email/commune
CREATE UNIQUE INDEX idx_alertes_utilisateurs_unique ON public.alertes_utilisateurs(email, commune);

-- Activer RLS pour la sécurité des données
ALTER TABLE public.alertes_utilisateurs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (pour l'abonnement)
CREATE POLICY "Permettre insertion publique abonnements" 
    ON public.alertes_utilisateurs 
    FOR INSERT 
    WITH CHECK (true);

-- Politique pour permettre la lecture (pour la gestion future)
CREATE POLICY "Permettre lecture abonnements" 
    ON public.alertes_utilisateurs 
    FOR SELECT 
    USING (true);

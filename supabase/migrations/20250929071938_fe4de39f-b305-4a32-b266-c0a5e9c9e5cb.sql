-- Créer une table de mapping marques-enseignes pour améliorer l'association
CREATE TABLE public.brand_retailer_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  retailer_id UUID NOT NULL REFERENCES public.retailers(id),
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_position TEXT, -- 'low', 'medium', 'high' - positionnement prix de la marque chez ce retailer
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte d'unicité pour éviter les doublons
  UNIQUE(brand_name, retailer_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_brand_retailer_mapping_brand ON public.brand_retailer_mapping(brand_name);
CREATE INDEX idx_brand_retailer_mapping_retailer ON public.brand_retailer_mapping(retailer_id);

-- Activer RLS
ALTER TABLE public.brand_retailer_mapping ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique
CREATE POLICY "brand_retailer_mapping_public_read" 
ON public.brand_retailer_mapping 
FOR SELECT 
USING (true);

-- Politique pour écriture service seulement
CREATE POLICY "brand_retailer_mapping_service_write" 
ON public.brand_retailer_mapping 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Trigger pour updated_at
CREATE TRIGGER update_brand_retailer_mapping_updated_at
  BEFORE UPDATE ON public.brand_retailer_mapping
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques données de mapping basées sur les données existantes
-- Carrefour (mapper avec le vrai UUID)
INSERT INTO public.brand_retailer_mapping (brand_name, retailer_id, is_available, price_position) VALUES
  ('cristaline', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'low'),
  ('vittel', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'medium'),
  ('volvic', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'medium'),
  ('perrier', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'high'),
  ('evian', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'high'),
  ('hepar', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'medium'),
  ('contrex', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'medium');

-- E.Leclerc
INSERT INTO public.brand_retailer_mapping (brand_name, retailer_id, is_available, price_position) VALUES
  ('cristaline', '515d6c6a-ee5f-4837-8bf9-ebc0631bf874', true, 'low'),
  ('vittel', '515d6c6a-ee5f-4837-8bf9-ebc0631bf874', true, 'medium'),
  ('volvic', '515d6c6a-ee5f-4837-8bf9-ebc0631bf874', true, 'medium'),
  ('perrier', '515d6c6a-ee5f-4837-8bf9-ebc0631bf874', true, 'high'),
  ('evian', '515d6c6a-ee5f-4837-8bf9-ebc0631bf874', true, 'high'),
  ('hepar', '515d6c6a-ee5f-4837-8bf9-ebc0631bf874', true, 'medium');

-- Intermarché
INSERT INTO public.brand_retailer_mapping (brand_name, retailer_id, is_available, price_position) VALUES
  ('cristaline', '42ccdcf2-7b85-4aaa-a32b-709f7dea6e2e', true, 'low'),
  ('vittel', '42ccdcf2-7b85-4aaa-a32b-709f7dea6e2e', true, 'medium'),
  ('evian', '42ccdcf2-7b85-4aaa-a32b-709f7dea6e2e', true, 'high'),
  ('perrier', '42ccdcf2-7b85-4aaa-a32b-709f7dea6e2e', true, 'high');
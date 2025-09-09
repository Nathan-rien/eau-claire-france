-- Seed des 12 enseignes pilotes
INSERT INTO public.retailers (name, slug, domain, status, search_url_template) VALUES
('Carrefour', 'carrefour', 'carrefour.fr', 'active', 'https://www.carrefour.fr/s?q={query}'),
('Carrefour Market', 'carrefour_market', 'carrefour.fr', 'active', 'https://www.carrefour.fr/s?q={query}'),
('Auchan', 'auchan', 'auchan.fr', 'active', 'https://www.auchan.fr/recherche?text={query}'),
('E.Leclerc', 'leclerc', 'e.leclerc', 'active', 'https://www.e.leclerc/recherche?keywords={query}'),
('Intermarché', 'intermarche', 'intermarche.com', 'active', 'https://www.intermarche.com/recherche?q={query}'),
('Système U', 'coursesu', 'coursesu.com', 'active', 'https://www.coursesu.com/recherche?q={query}'),
('Monoprix', 'monoprix', 'monoprix.fr', 'active', 'https://www.monoprix.fr/recherche?q={query}'),
('Casino', 'casino', 'casino.fr', 'active', 'https://www.casino.fr/recherche?q={query}'),
('Franprix', 'franprix', 'franprix.fr', 'active', 'https://www.franprix.fr/recherche?q={query}'),
('Cora', 'cora', 'cora.fr', 'active', 'https://www.cora.fr/recherche?q={query}'),
('Supermarchés Match', 'match', 'supermarchesmatch.fr', 'active', 'https://www.supermarchesmatch.fr/recherche?q={query}'),
('Chronodrive', 'chronodrive', 'chronodrive.com', 'active', 'https://www.chronodrive.com/recherche?q={query}'),
('Houra', 'houra', 'houra.fr', 'active', 'https://www.houra.fr/recherche?q={query}')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  search_url_template = EXCLUDED.search_url_template;
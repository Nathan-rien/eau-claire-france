import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Static knowledge base (injected in system prompt) ──────────────────────

const COMPOSITION_DATA = `
## Composition minérale des eaux en bouteille françaises (59 eaux)
Format: Marque | Source | Lieu | Gazeuse | pH | Résidu sec (mg/L) | HCO3 | Ca | Cl | F | Mg | NO3 | K | SiO2 | Na | SO4

Abatilles | Saint-Anne | Arcachon (Gironde) | Non | 8.2 | 354 | 127 | 19 | 137 | 1.0 | 9 | 0 | 4 | - | 100 | 8
Aix-les-Bains | Raphy-St-Simon Est | Grésy-sur-Aix (Savoie) | Non | 7.2 | 360 | 337 | 68 | 3.3 | 0.3 | 35 | 0.1 | 1.6 | - | 9 | 61
Aizac | Grande source du Volcan | Aizac (Ardèche) | Oui | 5.8 | 470 | 440 | 110 | - | 0.2 | 33 | 1 | 1.4 | - | 14 | -
Alizée | Alizée | Chambon-la-Forêt (Loiret) | Non | 7.4 | 311 | 306 | 93 | 18 | 0.35 | 8.1 | 2 | 2.6 | - | 8.8 | 5.2
Amanda (Saint-Amand) | Amanda | Saint-Amand-les-Eaux (Nord) | Non | 7.2 | 1334 | 295 | 243 | 66 | 1.3 | 77 | 1 | 7.9 | - | 54 | 675
Arcens (Perline) | Perline | Arcens (Ardèche) | Oui | 6.3 | 773 | 723 | 9 | 24 | 1.2 | 16 | 1 | 5.3 | 44 | 252 | 12
Arvie | Arvie | Augnat (Puy-de-Dôme) | Oui | 6.3 | 2520 | 2195 | 170 | 387 | 0.9 | 92 | 0 | 130 | 77 | 650 | 31
Badoit | Badoit | Saint-Galmier (Loire) | Oui | 6.0 | 1100 | 1250 | 153 | 54 | 1.2 | 80 | - | 11 | 27 | 180 | 35
Biovive | Biovive | Dax (Landes) | Non | 7.6 | 190 | 157 | 41 | 15 | 0.1 | 3.7 | 1 | 2.5 | 17 | 17 | 11
Celtic (La Liese) | La Liese | Niederbronn-les-Bains (Bas-Rhin) | Non | 7.5 | 50 | 48 | 10.5 | 5 | 0.1 | 4 | 2.1 | 1.9 | - | 1.1 | 6
Chambon (Montfras) | Montfras | Chambon-la-Forêt (Loiret) | Non | 8.0 | 349 | 297 | 96 | 22.6 | 0.2 | 6.1 | 2 | 3.7 | 36 | 10.6 | 9.3
Châteauneuf-Auvergne | Castel Rocher | Châteauneuf-les-Bains (Puy-de-Dôme) | Oui | 6.3 | 2586 | 1956 | 135 | 229 | 3.6 | 30 | 2 | 44 | 98 | 756 | 223
Châteldon | Sergentale | Châteldon (Puy-de-Dôme) | Oui | 6.2 | 1882 | 2075 | 355 | 5.5 | 2.6 | 49 | 41 | 240 | 22 | - | -
Cilaos | Véronique | Cilaos (Réunion) | Oui | 6.2 | 709 | 1300 | 110 | 3 | 0.005 | 70 | 5.3 | 238 | 55 | - | -
Contrex | Source Contrex | Contrexéville (Vosges) | Non | 7.4 | 2078 | 372 | 468 | 7.6 | 0.36 | 74 | 2.8 | 9.4 | 1121 | - | -
César (Saint-Alban) | César | Saint-Alban-les-Eaux (Loire) | Oui | 6.5 | 1750 | 2000 | 220 | 21 | 2.5 | 70 | - | 46 | - | 350 | 6
Faustine | Faustine | Saint-Alban-les-Eaux (Loire) | Oui | 6.3 | 1367 | 1609 | 209 | 20 | 1.3 | 56 | 1 | 30 | 237 | 9 | -
Hydroxydase | Marie-Christine-Nord | Le Breuil-sur-Couze (Puy-de-Dôme) | Oui | 6.8 | 9050 | 6200 | 201 | 350 | 0.08 | 240 | 182 | 11 | 1842 | 11 | -
Hépar | Hépar | Vittel (Vosges) | Non | 7.2 | 2513 | 384 | 549 | 19 | 0.4 | 119 | 4.3 | 14.2 | 1530 | - | -
La Cairolle | La Cairolle | Les Aires (Hérault) | Non | 7.0 | 1510 | 310 | 390 | 13 | 44 | 1 | 14 | 27 | 900 | - | -
La Française | La Française | Propiac (Drôme) | Non | - | 225 | 354 | 982 | 83 | 0 | 22 | 680 | 1095 | - | - | -
La Salvetat | Rieumajou | La Salvetat-sur-Agout (Hérault) | Oui | 6.0 | 520 | 530 | 160 | 5 | 7.5 | 2 | 55 | 5 | 20 | - | -
Le Vernet | Vernet Ouest | Prades (Ardèche) | Oui | - | 675 | 734 | 33.5 | 6.4 | 1.3 | 47.6 | 1 | 28.7 | 192 | 14 | -
Luchon | Lapade | Bagnères-de-Luchon (Haute-Garonne) | Non | 8.0 | 83 | 78 | 26.5 | 2.3 | 1.0 | 1.8 | 0.2 | 0.8 | 8.2 | - | -
Mont Roucous | Mont Roucous | Lacaune (Tarn) | Non | 5.8 | 25 | 6.3 | 2.4 | 3 | 0.1 | 0.5 | 0.4 | 8.2 | 3.1 | 2 | -
Montcalm | Montcalm | Auzat (Ariège) | Non | 6.8 | 32 | 5.2 | 3 | 0.6 | 0.1 | 0.7 | 0.7 | 0.6 | 7.5 | 2.2 | 10
Nessel | Nessel | Soultzmatt (Haut-Rhin) | Oui | 6.2 | 1002 | 1069 | 96 | 19 | 1.0 | 42 | 37 | 216 | 68 | - | -
Ogeu - source du Roy | Roy | Ogeu-les-Bains (Pyrénées-Atlantiques) | Non | 7.9 | 250 | 180 | 47 | 20.7 | 15.1 | 2.9 | 0.7 | 16 | 35.5 | - | -
Ogeu gazeuse | Gazeuse n°1 | Ogeu-les-Bains (Pyrénées-Atlantiques) | Oui | 4.8 | 250 | 180 | 47 | 20.7 | 15.1 | 2.9 | 0.7 | 16 | 35.5 | - | -
Orezza | Sorgente Sottana | Rapaggio (Haute-Corse) | Oui | - | 516 | 710 | 185 | 10 | 0.17 | 16.5 | 0 | 1.5 | 6.9 | 14 | -
Orée du Bois | Orée du Bois | Saint-Amand-les-Eaux (Nord) | Non | 7.2 | 1320 | 292 | 234 | 62 | 1.3 | 70 | 1 | 9 | 43 | 635 | -
Perrier | Les Bouillens | Vergèze (Gard) | Oui | 5.5 | 456 | 420 | 150 | 19.5 | - | 3.9 | 7.3 | 1 | - | 9.6 | 25.3
Plancoët | Sassoy | Plancoët (Côtes-d'Armor) | Non | 6.5 | 257 | 121 | 24 | - | - | 16 | - | 4.9 | - | 32 | 50
Plancoët fines bulles | Sassoy | Plancoët (Côtes-d'Armor) | Oui | 4.6 | 257 | 121 | 24 | - | - | 16 | - | 4.9 | - | 32 | 50
Prince Noir | Prince Noir | Saint-Antonin-Noble-Val (Tarn-et-Garonne) | Non | 7.0 | 2225 | 356 | 541 | 9 | 1.6 | 85 | 1 | 3 | - | 9 | 1377
Puits Saint-Georges | Puits Saint-Georges | Saint-Romain-le-Puy (Loire) | Oui | 6.0 | 1301 | 1404 | 41 | 38 | 0.5 | 36 | 8 | 18 | - | 460 | 10
Quézac | Diva | Quézac (Lozère) | Oui | 5.8 | 980 | 1000 | 165 | 38 | 2.2 | 69 | 1 | 50 | - | 110 | 143
Rozana | Des Romains | Beauregard-Vendon (Puy-de-Dôme) | Oui | 6.3 | 3022 | 1837 | 301 | 649 | - | 160 | 1 | 52 | 97 | 493 | 230
Saint-Yorre | Bassin de Vichy | Allier (Auvergne) | Oui | 6.6 | 4774 | 4368 | 90 | 322 | 1.5 | 11 | 0 | 110 | - | 1708 | 174
Velleminfroy | Velleminfroy | Haute-Saône | Non | - | 2420 | 322 | 510 | 3.2 | - | 66 | 0 | 2.6 | - | 10.3 | 1400
Ventadour | Meyras | Ardèche | Oui | - | - | 150 | 33 | - | - | 11.3 | 0 | 1.5 | - | 15 | 2.1
Vernet | Vernet Ouest | Prades (Ardèche) | Oui | - | - | 538 | 32 | 5.2 | 1.3 | 17 | - | 22 | - | 129 | 7.9
Vernière | Rieumajou | Les Aires (Hérault) | Oui | 6.0 | 1400 | 946 | 168 | 18 | - | 66 | 2 | 35 | - | 105 | 142
Vichy Célestins | Bassin de Vichy | Allier (Auvergne) | Oui | 6.8 | 3378 | 3245 | 90 | 227 | - | 9 | 2 | 71 | - | 1265 | 129
Vittel | Grande Source | Vosges | Non | 7.6 | 1084 | 384 | 240 | 7.3 | 0.17 | 42 | 4.4 | 1.9 | - | 5.2 | 400
Volvic | Clairvic | Puy-de-Dôme (Auvergne) | Non | 7.0 | 130 | 74 | 12 | 15 | - | 8 | 7.3 | 6 | 32 | 12 | 9
Évian | Cachat | Évian-les-Bains (Haute-Savoie) | Non | 7.2 | 345 | 360 | 80 | 10 | 3.8 | 1 | 15 | 6.5 | 14 | - | -
Thonon | Thonon | Thonon-les-Bains (Haute-Savoie) | Non | 7.3 | 342 | 335 | 108 | 8 | 0.1 | 16 | 2.1 | 1.5 | - | 5 | 18
Wattwiller | Wattwiller | Wattwiller (Haut-Rhin) | Non | 7.5 | 1534 | 258 | 288 | 4 | 1.5 | 19.8 | 0.1 | 2 | - | 3 | 630
Cristaline | Multi-sources | France | Non | 7.5 | 244 | 210 | 71 | 14 | 0.2 | 5.5 | 1 | 2 | - | 8 | 10
Laqueuille | Laqueuille | Laqueuille (Puy-de-Dôme) | Non | 6.5 | 46 | 18 | 4.2 | 2 | 0.1 | 1.9 | 3 | 1 | - | 2.7 | 3
Grand Barbier | Grand Barbier | Douvres (Ain) | Non | 7.6 | 340 | 285 | 85 | 4 | 0.2 | 26 | 1 | 1.5 | - | 2 | 30
Fiée des Lois | Fiée des Lois | Prahecq (Deux-Sèvres) | Non | 7.6 | 195 | 152 | 38 | 12 | 0.3 | 7 | 3 | 2 | - | 10 | 8
Sainte-Sophie | Sainte-Sophie | La Chapelle-en-Vercors (Drôme) | Non | 7.4 | 376 | 310 | 92 | 5 | 0.2 | 26 | 0.5 | 1.5 | - | 5 | 20
Pyrénéa | Pyrénéa | Pyrénées | Non | 7.4 | 282 | 230 | 78 | 6 | 0.2 | 8 | 2 | 1 | - | 4 | 12
Saint-Martin d'Abbat | Saint-Martin d'Abbat | Saint-Martin-d'Abbat (Loiret) | Non | 7.5 | 320 | 270 | 95 | 10 | 0.2 | 7 | 4 | 2 | - | 9 | 15
Louise | Louise | Andrézieux-Bouthéon (Loire) | Non | 7.4 | 290 | 240 | 60 | 8 | 0.3 | 18 | 3 | 2.5 | - | 8 | 12
Ophélie | Ophélie | Saint-Cyr-en-Val (Loiret) | Non | 7.6 | 310 | 260 | 98 | 9 | 0.2 | 5 | 2 | 1.5 | - | 7 | 10
`;

const MDD_DATA = `
## Eaux MDD (Marques de distributeurs)
Distributeur | Marque MDD | Source
E.Leclerc | Marque Repère – Eau de source (Laqueuille) | Laqueuille
E.Leclerc | Eco+ – Eau de source (Laqueuille) | Laqueuille
Carrefour | Carrefour Classic' – Eau de source (Grand Barbier) | Grand Barbier
Intermarché | Top Budget – Eau de source (Fiée des Lois) | Fiée des Lois
Système U | U – Eau de source (Sainte-Sophie) | Sainte-Sophie
Auchan | Auchan – Eau de source (Pyrénéa) | Pyrénéa
Casino | Casino – Eau de source (Roche des Écrins) | Roche des Écrins
Cora | Cora – Ondine (St-Martin d'Abbat) | Saint-Martin d'Abbat
Monoprix | Monoprix – Eau de source (5L) | Sources variables
Lidl | Saskia – Eau de source | Kirkel/Löningen/Jessen/Wörth/Leißling
Aldi | Rocheval – Eau de source | Louise / Ophélie
`;

const REGULATORY_THRESHOLDS = `
## Seuils réglementaires français et OMS (eau potable)
Paramètre | Limite FR | Limite OMS | Unité
Nitrates | 50 | 50 | mg/L
Sodium | 200 | 200 | mg/L
Fluorures | 1.5 | 1.5 | mg/L
Calcium | pas de limite | pas de limite | mg/L
Magnésium | pas de limite | pas de limite | mg/L
Sulfates | 250 | 500 | mg/L
Chlorures | 250 | 250 | mg/L
Potassium | pas de limite | pas de limite | mg/L
Résidu sec | 1500 (recommandé) | pas de limite | mg/L
pH | 6.5-9.0 | 6.5-8.5 | -
Plomb | 10 | 10 | µg/L
Arsenic | 10 | 10 | µg/L
Pesticides (total) | 0.5 | - | µg/L
Pesticide (individuel) | 0.1 | - | µg/L
PFAS (total) | 0.1 | - | µg/L

## Eau pour nourrissons (critères spécifiques)
Nitrates < 10 mg/L, Sodium < 20 mg/L, Fluorures < 0.5 mg/L, Résidu sec < 500 mg/L
`;

const PRICE_DATA = `
## Prix moyens des eaux en bouteille (€/L, format 1.5L pack)
Cristaline: ~0.20 | Évian: ~0.45 | Vittel: ~0.46 | Volvic: ~0.43 | Contrex: ~0.75
Hépar: ~0.70 | Saint-Yorre: ~0.55 | Quézac: ~0.60 | La Salvetat: ~0.50
Mont Roucous: ~0.50 | Thonon: ~0.45 | Saint-Amand: ~0.40 | Perrier: ~0.65
Badoit: ~0.55 | Vichy Célestins: ~0.60 | Rozana: ~0.55

Eau du robinet (France métro): ~0.004 €/L (moyenne)
Rapport: l'eau en bouteille coûte en moyenne 100 à 200 fois plus cher que l'eau du robinet.
`;

const SITE_PAGES = `
## Pages du site InfoEau.fr
- /carte : Carte interactive qualité eau du robinet par commune
- /diagnostic : Diagnostic personnalisé qualité eau du robinet
- /carte-polluants : Carte des polluants dans l'eau du robinet
- /polluants : Index complet des polluants (descriptions, seuils, effets santé)
- /alertes : Alertes email dépassement seuils par commune
- /comparatif-bouteilles : Comparatif interactif des eaux en bouteille
- /quelle-eau-boire : Recommandation personnalisée selon profil santé
- /classement : Classement des eaux en bouteille par score santé
- /sources-eau : Carte des sources d'eau minérale en France
- /prix-eaux : Prix par marque et enseigne
- /comparateur-prix : Comparateur de prix entre enseignes
- /cours-eau : Évolution historique des prix (INSEE)
- /marque/:slug : Fiche prix détaillée par marque
- /parcours-eau : Parcours de l'eau du robinet (animation pédagogique)
- /parcours-eau-bouteille : Parcours de l'eau en bouteille
- /carte-europe : Qualité de l'eau en Europe (27 pays UE)
- /methodologie : Méthodologie du scoring santé
`;

const SYSTEM_PROMPT = `Tu es Ondine, l'assistante IA d'InfoEau.fr, la plateforme française de référence sur la qualité de l'eau potable.

## Ton identité
- Prénom : Ondine (inspiré des ondines, esprits de l'eau dans la mythologie)
- Ton : amical, pédagogique, bienveillant, précis
- Expertise : qualité de l'eau du robinet, composition des eaux en bouteille, prix, polluants, réglementation
- Tu tutoies l'utilisateur si il te tutoie, sinon tu vouvoies

## Tes règles (CRITIQUES — respecte-les scrupuleusement)
1. **Réponse courte d'abord** : réponds en **2 à 4 phrases maximum**. Donne la réponse directe, puis propose « Souhaites-tu en savoir plus ? » ou « Je peux détailler si tu veux. »
2. **Pas d'anecdotes non sollicitées** : JAMAIS de "Le savais-tu ?", de comparaisons prix robinet/bouteille, de fun facts, ou d'informations bonus que l'utilisateur n'a pas demandées.
3. **Pas de récapitulatif ni de conclusion** quand la réponse tient en quelques lignes.
4. **Listes à puces** uniquement si la question porte sur une comparaison ou plusieurs éléments.
5. Si l'utilisateur demande d'en savoir plus, ALORS développe avec détails, contexte, valeurs précises et pages du site pertinentes.
6. Réponds TOUJOURS en français sauf si l'utilisateur écrit dans une autre langue.
7. Base tes réponses sur les données fournies ci-dessous. N'invente JAMAIS de données.
8. Si tu ne connais pas la réponse, dis-le honnêtement et redirige vers la page appropriée du site.
9. Cite les valeurs précises (mg/L, pH, prix) uniquement quand c'est directement pertinent à la question posée.

## Données de référence

${COMPOSITION_DATA}

${MDD_DATA}

${REGULATORY_THRESHOLDS}

${PRICE_DATA}

${SITE_PAGES}
`;

// ── Hub'Eau API helper ─────────────────────────────────────────────────────

async function fetchHubEauData(commune: string): Promise<string> {
  try {
    // Try Hub'Eau API for commune water quality
    const url = `https://hubeau.eaux-france.fr/api/v1/qualite_eau_potable/resultats_dis?nom_commune=${encodeURIComponent(commune)}&size=20&sort=desc&fields=nom_commune,date_prelevement,libelle_parametre,resultat_numerique,libelle_unite,conclusion_conformite_prelevement`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return "";
    const data = await resp.json();
    if (!data.data || data.data.length === 0) return "";

    const lines = data.data.map((d: any) =>
      `${d.date_prelevement} | ${d.libelle_parametre} | ${d.resultat_numerique} ${d.libelle_unite || ""} | ${d.conclusion_conformite_prelevement || ""}`
    );
    return `\n## Données eau du robinet pour ${commune} (source: Hub'Eau / ARS)\nDate | Paramètre | Valeur | Conformité\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, commune } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build dynamic context
    let dynamicContext = "";
    if (commune) {
      dynamicContext = await fetchHubEauData(commune);
    }

    const systemContent = SYSTEM_PROMPT + dynamicContext;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ondine-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

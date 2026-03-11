

## Plan: Region switcher with auto-redirect and EU equivalents

### Problem

The France/Europe switcher only changes navigation labels but does not redirect the user to the EU equivalent page. Pages like `/diagnostic`, `/alertes`, `/prix-eaux` have no EU version at all.

### Solution

Two changes:

**1. Auto-redirect on region switch**

Update `RegionContext` to include a route mapping table and use `useNavigate` to redirect the user when they switch region. Example: if on `/classement` and switching to EU, redirect to `/classement-europe` (and vice versa).

Route mapping:
```
/carte          ↔  /carte-europe
/classement     ↔  /classement-europe
/polluants      ↔  /polluants-europe
/diagnostic     ↔  /diagnostic-europe
/alertes        ↔  /alertes-europe
/prix-eaux      ↔  /prix-eaux-europe
```

The `RegionSwitcher` component will use `useLocation` + `useNavigate` to handle this redirect on click. Pages not in the mapping (e.g. `/a-propos`) stay unchanged.

**2. Create missing EU pages**

Create 3 new EU pages based on the EEA data already in `europeWaterApi.ts`:

- **`/diagnostic-europe`** — Select a country, see its compliance stats, key pollutants, population served. Uses `getEUWaterQuality()` filtered by country.
- **`/alertes-europe`** — Shows countries with worst compliance (score C), lists pollutant exceedances from `getEUPollutants()`. No real-time alerts (EEA data is annual), but presents threshold violations.
- **`/prix-eaux-europe`** — No EU price API exists. Show a comparison of average tap water cost per country (static data) and a note explaining bottled water prices vary by country.

**3. Simplify EU navigation**

When `isEurope`, the navigation will show only the EU equivalents (no duplicate FR links). The FR/EU switcher handles going back.

### Files to create
- `src/pages/DiagnosticEurope.tsx`
- `src/pages/AlertesEurope.tsx`
- `src/pages/PrixEauxEurope.tsx`

### Files to modify
- `src/components/RegionSwitcher.tsx` — add redirect logic
- `src/components/Navigation.tsx` — clean EU nav (EU-only links, no mixed FR/EU)
- `src/App.tsx` — add 3 new routes
- `src/services/europeWaterApi.ts` — add EU tap water price data


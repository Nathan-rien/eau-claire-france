

## Fix: Brand timeseries data not loading

### Root cause
`getBrandTimeseries` in `src/services/timeseriesApi.ts` uses a Supabase relational join (`retailers!inner(slug, name)`) on the `prices_history` table. However, there is **no foreign key** between `prices_history.retailer_id` and `retailers.id`, so the join returns an error or empty results.

### Solution
Refactor `getBrandTimeseries` to perform a **two-step query**:
1. Fetch `retailers` list separately (id, slug, name)
2. Query `prices_history` directly (without join) filtering by brand + date range
3. Map `retailer_id` to retailer slug/name using the retailers lookup in JavaScript

### File modified: `src/services/timeseriesApi.ts`

**`getBrandTimeseries` function changes:**
- Remove `retailers!inner(slug, name)` from the select
- Add a separate query to `retailers` table to get the id-to-slug/name mapping
- Join data client-side using the `retailer_id` field
- Keep all existing aggregation logic (daily median calculation, grouping by retailer)

**`getLatestRetailerMedians` function** — apply the same fix (also uses `retailers!inner`).

### No other files need changes
The chart code in `CoursEau.tsx` is correct and will work once the API returns data.


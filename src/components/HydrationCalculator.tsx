import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Droplets, Info, GlassWater } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Sex = "female" | "male";
type AgeBand = "14_18" | "19_50" | "51_70" | "70_plus";
type Activity = "low" | "moderate" | "high";

/**
 * Valeurs de référence Anses / EFSA pour l'APPORT HYDRIQUE TOTAL (boissons + aliments).
 * ~2,0 L/j femme adulte, ~2,5 L/j homme adulte. Aucune formule ml/kg n'est présentée
 * comme une vérité médicale : le poids ne sert qu'à un léger ajustement de la fourchette.
 */
const BASE_TOTAL_L: Record<Sex, Record<AgeBand, number>> = {
  female: { "14_18": 2.0, "19_50": 2.0, "51_70": 2.0, "70_plus": 2.0 },
  male: { "14_18": 2.5, "19_50": 2.5, "51_70": 2.5, "70_plus": 2.5 },
};

const ACTIVITY_ADD: Record<Activity, number> = { low: 0, moderate: 0.3, high: 0.7 };

export default function HydrationCalculator() {
  const { t, language } = useLanguage();

  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState<AgeBand>("19_50");
  const [useWeight, setUseWeight] = useState(false);
  const [weight, setWeight] = useState(65);
  const [activity, setActivity] = useState<Activity>("low");
  const [hotClimate, setHotClimate] = useState(false);
  const [pregnancy, setPregnancy] = useState(false);

  const locale = language === "en" ? "en-GB" : "fr-FR";
  const num = (n: number, d = 1) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

  const r = useMemo(() => {
    let center = BASE_TOTAL_L[sex][age];
    if (useWeight) {
      // Léger ajustement indicatif autour d'un gabarit de référence (~65 kg femme / ~75 kg homme).
      const ref = sex === "female" ? 65 : 75;
      center += Math.max(-0.3, Math.min(0.4, (weight - ref) * 0.006));
    }
    center += ACTIVITY_ADD[activity];
    if (hotClimate) center += 0.4;
    if (pregnancy && sex === "female") center += 0.3;

    const low = Math.max(1.2, center - 0.25);
    const high = center + 0.25;

    return {
      low,
      high,
      // ~70-80 % de l'apport total vient des boissons, le reste des aliments.
      drinkLow: low * 0.7,
      drinkHigh: high * 0.8,
    };
  }, [sex, age, useWeight, weight, activity, hotClimate, pregnancy]);

  const pill = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium ring-1 transition-colors ${
      active
        ? "bg-blue-600 text-primary-foreground ring-blue-600"
        : "bg-background text-muted-foreground ring-border hover:bg-muted"
    }`;

  const assumptions = [
    t(`hydration.calc.sex.${sex}`),
    t(`hydration.calc.age.${age}`),
    t(`hydration.calc.activity.${activity}`),
    hotClimate ? t("hydration.calc.hot.yes") : t("hydration.calc.hot.no"),
    ...(pregnancy && sex === "female" ? [t("hydration.calc.pregnancy.yes")] : []),
    ...(useWeight ? [`${num(weight, 0)} kg`] : []),
  ];

  return (
    <Card className="border-border">
      <CardContent className="p-5 md:p-7 space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground mb-2">
                {t("hydration.calc.sex.label")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {(["female", "male"] as Sex[]).map((s) => (
                  <button key={s} type="button" onClick={() => setSex(s)} className={pill(sex === s)}>
                    {t(`hydration.calc.sex.${s}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground mb-2">
                {t("hydration.calc.age.label")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {(["14_18", "19_50", "51_70", "70_plus"] as AgeBand[]).map((a) => (
                  <button key={a} type="button" onClick={() => setAge(a)} className={pill(age === a)}>
                    {t(`hydration.calc.age.${a}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground mb-2">
                {t("hydration.calc.activity.label")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {(["low", "moderate", "high"] as Activity[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setActivity(a)}
                    className={pill(activity === a)}
                  >
                    {t(`hydration.calc.activity.${a}`)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="hot-climate" className="text-sm font-medium text-foreground">
                {t("hydration.calc.hot.label")}
              </Label>
              <Switch id="hot-climate" checked={hotClimate} onCheckedChange={setHotClimate} />
            </div>

            {sex === "female" && (
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="pregnancy" className="text-sm font-medium text-foreground">
                  {t("hydration.calc.pregnancy.label")}
                </Label>
                <Switch id="pregnancy" checked={pregnancy} onCheckedChange={setPregnancy} />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="use-weight" className="text-sm font-medium text-foreground">
                  {t("hydration.calc.weight.label")}
                </Label>
                <Switch id="use-weight" checked={useWeight} onCheckedChange={setUseWeight} />
              </div>
              {useWeight && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{t("hydration.calc.weight.value")}</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={30}
                      max={200}
                      value={weight}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        setWeight(Number.isFinite(n) && n > 0 ? n : 0);
                      }}
                      className="h-9 w-24 text-right"
                      aria-label={t("hydration.calc.weight.value")}
                    />
                  </div>
                  <Slider
                    value={[Math.min(Math.max(weight, 30), 200)]}
                    min={30}
                    max={200}
                    step={1}
                    onValueChange={([v]) => setWeight(v)}
                    aria-label={t("hydration.calc.weight.value")}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RÉSULTAT */}
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 p-5 md:p-6 ring-1 ring-black/5">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                <Droplets className="w-4 h-4 shrink-0" />
                {t("hydration.calc.result.total")}
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {num(r.low)} – {num(r.high)} L
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("hydration.calc.result.total.hint")}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <GlassWater className="w-4 h-4 shrink-0" />
                {t("hydration.calc.result.drinks")}
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {num(r.drinkLow)} – {num(r.drinkHigh)} L
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("hydration.calc.result.drinks.hint")}</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-black/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {t("hydration.calc.assumptions")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {assumptions.map((a) => (
                <li
                  key={a}
                  className="rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-lg bg-background/80 px-4 py-3 text-sm text-muted-foreground ring-1 ring-border">
            <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
            <p className="m-0">{t("hydration.calc.disclaimer")}</p>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">{t("hydration.calc.source")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

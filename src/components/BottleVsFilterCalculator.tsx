import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info, PiggyBank, ShoppingBasket, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const DAYS = 365;

interface FieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

const NumberField = ({ id, label, value, onChange, min, max, step }: FieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) && n >= 0 ? n : 0);
        }}
        className="h-9 w-28 text-right"
      />
    </div>
    <Slider
      value={[Math.min(Math.max(value, min), max)]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      aria-label={label}
    />
  </div>
);

export default function BottleVsFilterCalculator() {
  const { t, language } = useLanguage();

  const [people, setPeople] = useState(2);
  const [litersPerDay, setLitersPerDay] = useState(1.5);
  const [bottlePrice, setBottlePrice] = useState(0.25);
  const [tapPrice, setTapPrice] = useState(0.004);
  const [cartridgePrice, setCartridgePrice] = useState(5);
  const [cartridgeLiters, setCartridgeLiters] = useState(150);
  const [carafePrice, setCarafePrice] = useState(20);

  const locale = language === "en" ? "en-GB" : "fr-FR";
  const money = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const num = (n: number, d = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: d }).format(n);

  const r = useMemo(() => {
    const annualLiters = people * litersPerDay * DAYS;
    const bottleCost = annualLiters * bottlePrice;
    const cartridges = cartridgeLiters > 0 ? annualLiters / cartridgeLiters : 0;
    const filterCost = annualLiters * tapPrice + cartridges * cartridgePrice;
    const savings = bottleCost - filterCost;
    const paybackMonths = savings > 0 ? (carafePrice / savings) * 12 : null;
    return { annualLiters, bottleCost, cartridges, filterCost, savings, paybackMonths };
  }, [people, litersPerDay, bottlePrice, tapPrice, cartridgePrice, cartridgeLiters, carafePrice]);

  const max = Math.max(r.bottleCost, r.filterCost, 1);

  return (
    <Card className="border-border">
      <CardContent className="p-6 md:p-8">
        <p className="text-muted-foreground mb-6">{t("bof.calc.intro")}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
          <NumberField id="bof-people" label={t("bof.calc.people")} value={people} onChange={setPeople} min={1} max={8} step={1} />
          <NumberField id="bof-liters" label={t("bof.calc.liters")} value={litersPerDay} onChange={setLitersPerDay} min={0.5} max={4} step={0.1} />
          <NumberField id="bof-bottle" label={t("bof.calc.bottlePrice")} value={bottlePrice} onChange={setBottlePrice} min={0.05} max={1.5} step={0.01} />
          <NumberField id="bof-tap" label={t("bof.calc.tapPrice")} value={tapPrice} onChange={setTapPrice} min={0} max={0.02} step={0.001} />
          <NumberField id="bof-cart-price" label={t("bof.calc.cartridgePrice")} value={cartridgePrice} onChange={setCartridgePrice} min={1} max={20} step={0.5} />
          <NumberField id="bof-cart-liters" label={t("bof.calc.cartridgeLiters")} value={cartridgeLiters} onChange={setCartridgeLiters} min={50} max={500} step={10} />
          <NumberField id="bof-carafe" label={t("bof.calc.carafePrice")} value={carafePrice} onChange={setCarafePrice} min={5} max={80} step={1} />
        </div>

        <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5 md:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-5">{t("bof.calc.res.title")}</h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <ShoppingBasket className="w-4 h-4 text-orange-600" />
                  {t("bof.calc.res.bottle")}
                </span>
                <span className="font-semibold text-foreground">
                  {money(r.bottleCost)}
                  {t("bof.calc.unit.year")}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-background overflow-hidden">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${(r.bottleCost / max) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  {t("bof.calc.res.filter")}
                </span>
                <span className="font-semibold text-foreground">
                  {money(r.filterCost)}
                  {t("bof.calc.unit.year")}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-background overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.filterCost / max) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-background p-4">
              <p className="text-xs text-muted-foreground m-0">{t("bof.calc.res.volume")}</p>
              <p className="text-xl font-bold text-foreground m-0">
                {num(r.annualLiters)} {t("bof.calc.unit.liters")}
              </p>
            </div>
            <div className="rounded-lg bg-background p-4">
              <p className="text-xs text-muted-foreground m-0">{t("bof.calc.res.cartridges")}</p>
              <p className="text-xl font-bold text-foreground m-0">{num(r.cartridges, 1)}</p>
            </div>
            <div className="rounded-lg bg-background p-4">
              <p className="text-xs text-muted-foreground m-0">
                {r.savings >= 0 ? t("bof.calc.res.savings") : t("bof.calc.res.extra")}
              </p>
              <p className={`text-xl font-bold m-0 ${r.savings >= 0 ? "text-emerald-600" : "text-orange-600"}`}>
                {money(Math.abs(r.savings))}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-lg bg-background p-4">
            <PiggyBank className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground m-0">{t("bof.calc.res.payback")}</p>
              <p className="text-lg font-semibold text-foreground m-0">
                {r.paybackMonths === null
                  ? t("bof.calc.res.paybackNever")
                  : t("bof.calc.res.paybackMonths", { n: num(Math.max(r.paybackMonths, 0.1), 1) })}
              </p>
              <p className="text-xs text-muted-foreground m-0 mt-1">
                {t("bof.calc.res.paybackNote", { price: num(carafePrice) })}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
          <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
          <p className="m-0">{t("bof.calc.disclaimer")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

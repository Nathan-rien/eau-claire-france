"use client";
import { useEffect } from "react";
import { usePrices } from "@/hooks/usePrices";

export default function PriceDomGuard() {
  const { tap, bottle } = usePrices();
  useEffect(() => {
    const fmt = (v:number) => (v < 0.01 ? v.toFixed(3) : v.toFixed(2)).replace(".", ",") + " €/L";
    const guard = () => {
      const nodes = Array.from(document.querySelectorAll("body *"));
      for (const n of nodes) {
        const t = (n.textContent || "").trim();
        if (!t) continue;
        // si une valeur €/L > 5 s'affiche, on la remplace par la valeur calculée
        const m = t.match(/(\d+[.,]\d+)\s*€\/L/i);
        if (m) {
          const val = parseFloat(m[1].replace(",", "."));
          if (Number.isFinite(val) && val > 5) {
            n.textContent = t.replace(m[0], fmt(bottle.value) + " 💧GUARD");
          }
        }
      }
    };
    const obs = new MutationObserver(() => guard());
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    guard();
    return () => obs.disconnect();
  }, [tap.value, bottle.value]);
  return null;
}

export interface NutritionalInterpretation {
  label: string;
  className: string;
}

export const interpretNitrates = (value: number): NutritionalInterpretation => {
  if (value < 5) return { label: "(très faible)", className: "value-good" };
  if (value <= 10) return { label: "(faible)", className: "value-warn" };
  return { label: "(élevé)", className: "value-bad" };
};

export const interpretResiduSec = (value: number): NutritionalInterpretation => {
  if (value < 150) return { label: "(trop faible)", className: "value-bad" };
  if (value <= 500) return { label: "(idéal)", className: "value-good" };
  if (value <= 1500) return { label: "(élevé)", className: "value-warn" };
  return { label: "(trop élevé)", className: "value-bad" };
};

export const interpretCalcium = (value: number): NutritionalInterpretation => {
  if (value < 50) return { label: "(faible)", className: "value-bad" };
  if (value <= 150) return { label: "(moyen)", className: "value-warn" };
  if (value <= 300) return { label: "(riche)", className: "value-good" };
  return { label: "(très riche)", className: "value-good" };
};

export const interpretMagnesium = (value: number): NutritionalInterpretation => {
  if (value < 20) return { label: "(faible)", className: "value-bad" };
  if (value <= 50) return { label: "(correct)", className: "value-warn" };
  return { label: "(riche)", className: "value-good" };
};

export const interpretSodium = (value: number): NutritionalInterpretation => {
  if (value < 20) return { label: "(faible)", className: "value-good" };
  if (value <= 100) return { label: "(modéré)", className: "value-warn" };
  return { label: "(trop salé)", className: "value-bad" };
};

export const interpretPH = (value: number): NutritionalInterpretation => {
  if (value < 6.5) return { label: "(acide)", className: "value-bad" };
  if (value <= 8.5) return { label: "(idéal)", className: "value-good" };
  return { label: "(basique)", className: "value-warn" };
};

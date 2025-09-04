import { Composition } from "@/utils/rankingV2";

export const BOTTLES: Array<{id:string; name:string; brand?:string; pricePerL?:number; compos: Composition}> = [
  {
    id: "contrex",
    name: "Contrex",
    brand: "Contrex",
    pricePerL: 0.75,
    compos: {
      NO3_mg_L: 0.7,
      residu_sec_180_mg_L: 2078,
      Ca_mg_L: 468,
      Mg_mg_L: 74.5,
      Na_mg_L: 9.4
    }
  },
  {
    id: "evian",
    name: "Evian",
    brand: "Evian",
    pricePerL: 0.45,
    compos: {
      NO3_mg_L: 3.7,
      residu_sec_180_mg_L: 309,
      Ca_mg_L: 80,
      Mg_mg_L: 26,
      Na_mg_L: 6.5
    }
  },
  {
    id: "volvic",
    name: "Volvic",
    brand: "Volvic",
    pricePerL: 0.42,
    compos: {
      NO3_mg_L: 6.3,
      residu_sec_180_mg_L: 130,
      Ca_mg_L: 11.5,
      Mg_mg_L: 8,
      Na_mg_L: 11.6
    }
  },
  {
    id: "perrier",
    name: "Perrier",
    brand: "Perrier",
    pricePerL: 0.55,
    compos: {
      NO3_mg_L: 18,
      residu_sec_180_mg_L: 475,
      Ca_mg_L: 150,
      Mg_mg_L: 3.4,
      Na_mg_L: 9.6
    }
  }
];
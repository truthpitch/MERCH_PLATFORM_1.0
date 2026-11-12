import type { ProductCategory } from "@/types";

export interface SizeChart {
  title: string;
  note: string;
  columns: string[];
  rows: { size: string; values: [number, number][] }[]; // [inches, cm]
}

const TEES: SizeChart = {
  title: "Tees",
  note: "Boxy fit. Measured flat across the chest, 2.5cm below the armpit. Between sizes? Size down for a regular fit.",
  columns: ["Chest width", "Body length", "Sleeve"],
  rows: [
    { size: "XS", values: [[19.5, 49.5], [26.5, 67], [8, 20]] },
    { size: "S", values: [[20.5, 52], [27.5, 70], [8.25, 21]] },
    { size: "M", values: [[21.5, 54.5], [28.5, 72.5], [8.5, 21.5]] },
    { size: "L", values: [[22.5, 57], [29.5, 75], [8.75, 22]] },
    { size: "XL", values: [[24, 61], [30.5, 77.5], [9, 23]] },
    { size: "XXL", values: [[25.5, 65], [31.5, 80], [9.25, 23.5]] },
  ],
};

const FLEECE: SizeChart = {
  title: "Hoodies & crews",
  note: "Relaxed fit with room to layer. Measured flat across the chest.",
  columns: ["Chest width", "Body length", "Sleeve"],
  rows: [
    { size: "XS", values: [[21, 53.5], [26, 66], [23.5, 60]] },
    { size: "S", values: [[22, 56], [27, 68.5], [24, 61]] },
    { size: "M", values: [[23, 58.5], [28, 71], [24.5, 62]] },
    { size: "L", values: [[24, 61], [29, 73.5], [25, 63.5]] },
    { size: "XL", values: [[25.5, 65], [30, 76], [25.5, 65]] },
    { size: "XXL", values: [[27, 68.5], [31, 79], [26, 66]] },
  ],
};

export function getSizeChart(category: ProductCategory): SizeChart | null {
  if (category === "tees") return TEES;
  if (category === "hoodies") return FLEECE;
  return null;
}

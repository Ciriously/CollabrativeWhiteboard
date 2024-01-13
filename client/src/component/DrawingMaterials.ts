// DrawingMaterials.ts

export interface Brush {
  color: string;
  size: number;
}

export const defaultBrush: Brush = {
  color: "black",
  size: 5,
};

export const eraserBrush: Brush = {
  color: "white",
  size: 20,
};

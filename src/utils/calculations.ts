export const calculateShellArea = (
  insulatedDiameter: string,
  heightLength: string,
  thickness: string
): number => {
  const dia = parseFloat(insulatedDiameter) || 0;
  const height = parseFloat(heightLength) || 0;
  const thk = parseFloat(thickness) || 0;

  if (dia === 0 || height === 0) return 0;

  // Shell Area = π × (Insulated Diameter + 2 × Thickness(mm) / 1000) × Height/Length
  const effectiveDia = dia + (2 * thk) / 1000;
  return Math.PI * effectiveDia * height;
};

export const calculateDishArea = (
  insulatedDiameter: string,
  thickness: string,
  dishFactor: string,
  dishEndNos: string
): number => {
  const dia = parseFloat(insulatedDiameter) || 0;
  const thk = parseFloat(thickness) || 0;
  const factor = parseFloat(dishFactor) || 1.27;
  const nos = parseFloat(dishEndNos) || 0;

  if (dia === 0 || nos === 0) return 0;

  // Dish Area = π/4 × (Insulated Diameter + 2 × Thickness(mm) / 1000)² × Factor × No. of Dish Ends
  const effectiveDia = dia + (2 * thk) / 1000;
  return (Math.PI / 4) * Math.pow(effectiveDia, 2) * factor * nos;
};

export const calculateTotalArea = (
  shellArea: number,
  dishArea: number,
  otherArea: string
): number => {
  const other = parseFloat(otherArea) || 0;
  return shellArea + dishArea + other;
};

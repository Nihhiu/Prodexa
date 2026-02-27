const BELOW_DEFAULT_OFFSET = 0.05;
const MIN_EFFECTIVE_SCALE = 0.7;

export const getEffectiveFontScale = (selectedScale: number): number => {
  if (selectedScale >= 1) {
    return selectedScale;
  }

  const adjusted = selectedScale - BELOW_DEFAULT_OFFSET;
  return Math.max(MIN_EFFECTIVE_SCALE, Math.round(adjusted * 100) / 100);
};

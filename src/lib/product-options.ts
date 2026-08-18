export function isMeaningfulOptionValue(value?: string) {
  return Boolean(value && value.trim() && value !== "Unique");
}

export function formatProductSelections(options: {
  size?: string;
  shoeSize?: string;
  color?: string;
}) {
  const parts: string[] = [];

  if (isMeaningfulOptionValue(options.color)) {
    parts.push(`Couleur : ${options.color}`);
  }

  if (isMeaningfulOptionValue(options.size)) {
    parts.push(`Taille : ${options.size}`);
  }

  if (isMeaningfulOptionValue(options.shoeSize)) {
    parts.push(`Pointure : ${options.shoeSize}`);
  }

  return parts.length > 0 ? parts.join(" / ") : "Option unique";
}

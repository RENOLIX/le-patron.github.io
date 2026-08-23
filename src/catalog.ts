export type CatalogMenu = { name: string; items: string[] };

export const defaultMenus: CatalogMenu[] = [
  { name: "Homme", items: ["Chemisier", "Pantalon", "Pull", "Veste", "Survêtement"] },
  { name: "Femme", items: ["Abaya", "Hidjab", "Robe", "Chemisier", "Pantalon", "Jupe", "Veste", "Burkini"] },
  { name: "Enfants", items: ["Garçons · Pull", "Garçons · Pantalon", "Garçons · Survêtement", "Garçons · Veste", "Filles · Chemisier", "Filles · Jupe", "Filles · Robe", "Filles · Pantalon", "Filles · Veste"] },
  { name: "Bébé", items: [] },
  { name: "Bleu de travail", items: [] },
  { name: "Tenue médicale", items: [] },
];

export const menus: CatalogMenu[] = defaultMenus.map(menu => ({ ...menu, items: [...menu.items] }));
export const catalogOptions: Record<string, string[]> = Object.fromEntries(menus.map(menu => [menu.name, menu.items]));

export function setCatalogMenus(next: CatalogMenu[]) {
  menus.splice(0, menus.length, ...next.map(menu => ({ ...menu, items: [...menu.items] })));
  Object.keys(catalogOptions).forEach(key => delete catalogOptions[key]);
  menus.forEach(menu => { catalogOptions[menu.name] = menu.items; });
}

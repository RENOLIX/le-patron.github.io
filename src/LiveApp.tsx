import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import App, { products } from "./App";
import { db } from "./lib/firebase";
import { setCatalogMenus } from "./catalog";
import ScrollReveal from "./ScrollReveal";

export default function LiveApp() {
  const [, refresh] = useState(0);

  useEffect(() => onSnapshot(collection(db, "products"), snapshot => {
    const categoryConfig = snapshot.docs.some(entry => entry.id === "_category_config");
    if (categoryConfig) {
      const liveMenus = snapshot.docs
        .filter(entry => entry.data().kind === "category")
        .map(entry => {
          const data = entry.data();
          return { name: String(data.name || "Catégorie"), items: Array.isArray(data.items) ? data.items.map(String) : [], order: Number(data.order || 0) };
        })
        .sort((a, b) => a.order - b.order)
        .map(({ name, items }) => ({ name, items }));
      setCatalogMenus(liveMenus);
    }
    const live = snapshot.docs
      .map((entry, index) => {
        const data = entry.data() as Record<string, unknown>;
        if (data.kind === "category" || entry.id === "_category_config") return null;
        if (data.active === false || ["robe-amandine", "abaya-noura", "pantalon-adam", "veste-alba", "survetement-sami", "jupe-lina", "bleu-atelier", "blouse-sana"].includes(String(data.slug || entry.id))) return null;
        const category = [data.category, data.subcategory].filter(Boolean).join(" · ");
        return {
          id: index + 1,
          slug: String(data.slug || entry.id),
          name: String(data.name || "Patron sans nom"),
          category: category || "Collection",
          price: Number(data.price || 0),
          shade: String(data.shade || "plum"),
          image: data.image ? String(data.image) : undefined,
          images: Array.isArray(data.images) ? data.images.map(String) : undefined,
          label: data.label ? String(data.label) : undefined,
          description: String(data.description || ""),
          sizes: Array.isArray(data.sizes) ? data.sizes.map(String) : [],
        };
      })
      .filter(Boolean);
    products.splice(0, products.length, ...(live as typeof products));
    refresh(value => value + 1);
  }, () => undefined), []);

  return <ScrollReveal><App /></ScrollReveal>;
}

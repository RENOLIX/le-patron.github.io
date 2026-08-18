import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import App, { products } from "./App";
import { db } from "./lib/firebase";

export default function LiveApp() {
  const [, refresh] = useState(0);

  useEffect(() => onSnapshot(collection(db, "products"), snapshot => {
    const live = snapshot.docs
      .map((entry, index) => {
        const data = entry.data() as Record<string, unknown>;
        if (data.active === false) return null;
        const category = [data.category, data.subcategory].filter(Boolean).join(" · ");
        return {
          id: index + 1,
          slug: String(data.slug || entry.id),
          name: String(data.name || "Patron sans nom"),
          category: category || "Collection",
          price: Number(data.price || 0),
          shade: String(data.shade || "plum"),
          image: data.image ? String(data.image) : undefined,
          label: data.label ? String(data.label) : undefined,
          description: String(data.description || ""),
          sizes: Array.isArray(data.sizes) ? data.sizes.map(String) : [],
        };
      })
      .filter(Boolean);
    if (live.length) {
      products.splice(0, products.length, ...(live as typeof products));
      refresh(value => value + 1);
    }
  }, () => undefined), []);

  return <App />;
}

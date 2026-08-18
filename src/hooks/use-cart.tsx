import { useStore } from "@/lib/shop-store";

export function useCart() {
  const {
    items,
    totalPrice,
    cartCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  } = useStore();

  return {
    items,
    totalPrice,
    cartCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}

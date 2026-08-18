import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "@/components/providers/auth";
import { seedProducts } from "@/data/seed";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type {
  CartItem,
  Order,
  OrderDraft,
  OrderStatus,
  Product,
  ProductDraft,
} from "@/types";

const PRODUCTS_KEY = "maison-products-v2";
const ORDERS_KEY = "maison-orders-v2";
const CART_KEY = "maison-cart-v2";

interface StoreContextValue {
  products: Product[];
  activeProducts: Product[];
  orders: Order[];
  items: CartItem[];
  totalPrice: number;
  cartCount: number;
  createProduct: (draft: ProductDraft) => Promise<Product>;
  updateProduct: (id: string, draft: ProductDraft) => Promise<Product | null>;
  removeProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  createOrder: (draft: OrderDraft) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  addItem: (item: CartItem) => void;
  removeItem: (
    productId: string,
    size: string,
    color: string,
    shoeSize?: string,
  ) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    shoeSize: string | undefined,
    quantity: number,
  ) => void;
  clearCart: () => void;
  resetCatalog: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function readStorage<T>(key: string, fallback: () => T): T {
  if (typeof window === "undefined") {
    return fallback();
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback();
  } catch {
    return fallback();
  }
}

function usePersistentState<T>(key: string, fallback: () => T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateProductId(name: string) {
  return `${slugify(name)}-${Date.now().toString().slice(-4)}`;
}

function generateOrderNumber() {
  return `MSN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

function normalizeProductDraft(draft: ProductDraft) {
  return {
    ...draft,
    comparePrice:
      draft.comparePrice && draft.comparePrice > draft.price
        ? draft.comparePrice
        : undefined,
  };
}

function productToRow(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    compare_price: product.comparePrice ?? null,
    category: product.category,
    images: product.images,
    sizes: product.sizes,
    shoe_sizes: product.shoeSizes,
    colors: product.colors,
    stock: product.stock,
    featured: product.featured,
    active: product.active,
  };
}

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    comparePrice: row.compare_price ? Number(row.compare_price) : undefined,
    category: String(row.category ?? "femme") as Product["category"],
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    sizes: Array.isArray(row.sizes) ? row.sizes.map(String) : [],
    shoeSizes: Array.isArray(row.shoe_sizes) ? row.shoe_sizes.map(String) : [],
    colors: Array.isArray(row.colors) ? row.colors.map(String) : [],
    stock: Number(row.stock ?? 0),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
  };
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number ?? ""),
    customerName: String(row.customer_name ?? ""),
    customerEmail: String(row.customer_email ?? ""),
    customerPhone: String(row.customer_phone ?? ""),
    items: Array.isArray(row.items)
      ? (row.items as Order["items"])
      : [],
    subtotal: Number(row.subtotal ?? 0),
    shipping: Number(row.shipping ?? 0),
    total: Number(row.total ?? 0),
    status: String(row.status ?? "pending") as OrderStatus,
    shippingAddress: (row.shipping_address ?? {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    }) as Order["shippingAddress"],
    paymentMethod: String(row.payment_method ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export function StoreProvider({ children }: PropsWithChildren) {
  const { canManageOrders, canManageProducts, canUpdateOrders } = useAuth();
  const [products, setProducts] = usePersistentState<Product[]>(PRODUCTS_KEY, () => seedProducts);
  const [orders, setOrders] = usePersistentState<Order[]>(ORDERS_KEY, () => []);
  const [items, setItems] = usePersistentState<CartItem[]>(CART_KEY, () => []);
  const [seedAttempted, setSeedAttempted] = useState(false);

  useEffect(() => {
    const validIds = new Set(products.map((product) => product.id));

    setItems((currentItems) => {
      const nextItems = currentItems.filter((item) => validIds.has(item.productId));
      return nextItems.length === currentItems.length ? currentItems : nextItems;
    });
  }, [products, setItems]);

  const activeProducts = products.filter((product) => product.active);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const fetchProducts = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase products fetch error:", error.message);
      return;
    }

    setProducts((data ?? []).map((row) => rowToProduct(row as Record<string, unknown>)));
  }, [setProducts]);

  const fetchOrders = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase || !canManageOrders) {
      if (hasSupabaseConfig) {
        setOrders([]);
      }
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase orders fetch error:", error.message);
      return;
    }

    setOrders((data ?? []).map((row) => rowToOrder(row as Record<string, unknown>)));
  }, [canManageOrders, setOrders]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return;
    }

    const client = supabase;
    void fetchProducts();

    const channel = client
      .channel("products-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          void fetchProducts();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [fetchProducts]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return;
    }

    const client = supabase;
    void fetchOrders();

    if (!canManageOrders) {
      return;
    }

    const channel = client
      .channel("orders-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void fetchOrders();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [canManageOrders, fetchOrders]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase || !canManageProducts || seedAttempted || products.length > 0) {
      return;
    }

    const client = supabase;

    const seedRemote = async () => {
      setSeedAttempted(true);

      const { data, error } = await client
        .from("products")
        .select("id")
        .limit(1);

      if (error || (data?.length ?? 0) > 0) {
        return;
      }

      const { error: insertError } = await client
        .from("products")
        .insert(seedProducts.map((product) => productToRow(product)));

      if (insertError) {
        console.error("Supabase seed error:", insertError.message);
        return;
      }

      await fetchProducts();
    };

    void seedRemote();
  }, [canManageProducts, fetchProducts, products.length, seedAttempted]);

  const createProduct = async (draft: ProductDraft) => {
    const normalizedDraft = normalizeProductDraft(draft);
    const product: Product = {
      ...normalizedDraft,
      id: generateProductId(draft.name),
    };

    if (hasSupabaseConfig && !canManageProducts) {
      throw new Error("Acces refuse.");
    }

    if (!hasSupabaseConfig || !supabase) {
      setProducts((currentProducts) => [product, ...currentProducts]);
      return product;
    }

    const { data, error } = await supabase
      .from("products")
      .insert(productToRow(product))
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const createdProduct = rowToProduct(data as Record<string, unknown>);
    setProducts((currentProducts) => [createdProduct, ...currentProducts.filter((entry) => entry.id !== createdProduct.id)]);
    return createdProduct;
  };

  const updateProduct = async (id: string, draft: ProductDraft) => {
    const existing = products.find((product) => product.id === id);
    if (!existing) {
      return null;
    }

    const nextProduct: Product = {
      ...existing,
      ...normalizeProductDraft(draft),
    };

    if (hasSupabaseConfig && !canManageProducts) {
      throw new Error("Acces refuse.");
    }

    if (!hasSupabaseConfig || !supabase) {
      setProducts((currentProducts) =>
        currentProducts.map((product) => (product.id === id ? nextProduct : product)),
      );

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === id
            ? {
                ...item,
                productName: nextProduct.name,
                price: nextProduct.price,
                image: nextProduct.images[0] ?? "",
              }
            : item,
        ),
      );

      return nextProduct;
    }

    const { data, error } = await supabase
      .from("products")
      .update(productToRow(nextProduct))
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const updatedProduct = rowToProduct(data as Record<string, unknown>);

    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === id ? updatedProduct : product)),
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === id
          ? {
              ...item,
              productName: updatedProduct.name,
              price: updatedProduct.price,
              image: updatedProduct.images[0] ?? "",
            }
          : item,
      ),
    );

    return updatedProduct;
  };

  const removeProduct = async (id: string) => {
    if (hasSupabaseConfig && !canManageProducts) {
      throw new Error("Acces refuse.");
    }

    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    }

    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  const createOrder = async (draft: OrderDraft) => {
    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      customerName: draft.customerName,
      customerEmail: draft.customerEmail,
      customerPhone: draft.customerPhone,
      items: draft.items,
      subtotal: draft.subtotal,
      shipping: draft.shipping,
      total: draft.total,
      status: "pending",
      shippingAddress: draft.shippingAddress,
      paymentMethod: draft.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: order.orderNumber,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          status: order.status,
          shipping_address: order.shippingAddress,
          payment_method: order.paymentMethod,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return rowToOrder(data as Record<string, unknown>);
    }

    setOrders((currentOrders) => [order, ...currentOrders]);
    return order;
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    if (hasSupabaseConfig && !canUpdateOrders) {
      throw new Error("Acces refuse.");
    }

    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  };

  const addItem = (nextItem: CartItem) => {
    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) =>
          item.productId === nextItem.productId &&
          item.size === nextItem.size &&
          item.color === nextItem.color &&
          (item.shoeSize ?? "") === (nextItem.shoeSize ?? ""),
      );

      if (existing) {
        return currentItems.map((item) =>
          item.productId === nextItem.productId &&
          item.size === nextItem.size &&
          item.color === nextItem.color &&
          (item.shoeSize ?? "") === (nextItem.shoeSize ?? "")
            ? { ...item, quantity: item.quantity + nextItem.quantity }
            : item,
        );
      }

      return [...currentItems, nextItem];
    });
  };

  const removeItem = (
    productId: string,
    size: string,
    color: string,
    shoeSize?: string,
  ) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.size === size &&
            item.color === color &&
            (item.shoeSize ?? "") === (shoeSize ?? "")
          ),
      ),
    );
  };

  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    shoeSize: string | undefined,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeItem(productId, size, color, shoeSize);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color &&
        (item.shoeSize ?? "") === (shoeSize ?? "")
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const resetCatalog = async () => {
    if (hasSupabaseConfig && !canManageProducts) {
      throw new Error("Acces refuse.");
    }

    if (hasSupabaseConfig && supabase) {
      const { error: deleteError } = await supabase.from("products").delete().neq("id", "");

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      const { error: insertError } = await supabase
        .from("products")
        .insert(seedProducts.map((product) => productToRow(product)));

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    setProducts(seedProducts);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        activeProducts,
        orders,
        items,
        totalPrice,
        cartCount,
        createProduct,
        updateProduct,
        removeProduct,
        getProductById,
        createOrder,
        updateOrderStatus,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        resetCatalog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}

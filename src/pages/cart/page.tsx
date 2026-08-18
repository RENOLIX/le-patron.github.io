import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatProductSelections } from "@/lib/product-options";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        <h1 className="font-serif text-3xl font-bold mb-10">Mon Panier</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Decouvrez notre collection et trouvez ce qui vous plait.
            </p>
            <Button size="lg" onClick={() => navigate("/shop")}>
              Continuer les achats
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.productId}-${item.size}-${item.color}-${item.shoeSize ?? ""}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="flex gap-5 pb-6 border-b border-border"
                >
                  <div className="w-24 h-32 shrink-0 bg-muted overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm tracking-wide truncate">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatProductSelections(item)}
                    </p>
                    <p className="text-sm font-semibold mt-2">
                      {item.price.toLocaleString("fr-DZ")} DZD
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.shoeSize,
                            item.quantity - 1,
                          )
                        }
                        className="h-7 w-7 border border-border flex items-center justify-center hover:border-foreground transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.shoeSize,
                            item.quantity + 1,
                          )
                        }
                        className="h-7 w-7 border border-border flex items-center justify-center hover:border-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color, item.shoeSize)
                        }
                        className="ml-auto text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-muted p-6 sticky top-24">
                <h2 className="font-serif text-xl font-bold mb-6">Recapitulatif</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{totalPrice.toLocaleString("fr-DZ")} DZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-green-600 font-medium">Gratuite</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Paiement a la livraison</p>
                  <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{totalPrice.toLocaleString("fr-DZ")} DZD</span>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={() => navigate("/checkout")}>
                  Commander
                </Button>
                <Link
                  to="/shop"
                  className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-4 tracking-wide"
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

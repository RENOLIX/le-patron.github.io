import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useShop } from "@/hooks/use-shop";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useShop();
  const { addItem } = useCart();
  const product = id ? getProductById(id) : undefined;

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedShoeSize, setSelectedShoeSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedSize(product.sizes[0] ?? "");
    setSelectedShoeSize(product.shoeSizes[0] ?? "");
    setSelectedColor(product.colors[0] ?? "");
    setActiveImg(0);
  }, [product]);

  if (!product || !product.active) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground px-4">
          Produit introuvable
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) {
      toast.error("Veuillez choisir une taille");
      return;
    }

    if (!selectedShoeSize && product.shoeSizes.length > 0) {
      toast.error("Veuillez choisir une pointure");
      return;
    }

    if (!selectedColor && product.colors.length > 0) {
      toast.error("Veuillez choisir une couleur");
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      size: selectedSize || "Unique",
      shoeSize: selectedShoeSize || undefined,
      color: selectedColor || "Unique",
      quantity: 1,
    });

    setAdded(true);
    toast.success(`${product.name} ajoute au panier`);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={product.images[activeImg] ?? product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 ? (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    className={cn(
                      "w-16 aspect-[3/4] overflow-hidden border-2 transition-colors",
                      activeImg === index ? "border-foreground" : "border-transparent",
                    )}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="py-4">
            <h1 className="font-serif text-3xl font-bold mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold">
                {product.price.toLocaleString("fr-DZ")} DZD
              </span>
              {product.comparePrice && product.comparePrice > product.price ? (
                <span className="text-lg text-muted-foreground line-through">
                  {product.comparePrice.toLocaleString("fr-DZ")} DZD
                </span>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {product.colors.length > 0 ? (
              <div className="mb-6">
                <p className="text-xs font-medium tracking-widest uppercase mb-3">
                  Couleur : <span className="text-muted-foreground">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-4 py-2 text-xs border transition-colors",
                        selectedColor === color
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes.length > 0 ? (
              <div className="mb-6">
                <p className="text-xs font-medium tracking-widest uppercase mb-3">Taille</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-12 h-12 text-sm border transition-colors",
                        selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.shoeSizes.length > 0 ? (
              <div className="mb-8">
                <p className="text-xs font-medium tracking-widest uppercase mb-3">Pointure</p>
                <div className="flex flex-wrap gap-2">
                  {product.shoeSizes.map((shoeSize) => (
                    <button
                      key={shoeSize}
                      type="button"
                      onClick={() => setSelectedShoeSize(shoeSize)}
                      className={cn(
                        "min-w-12 h-12 px-3 text-sm border transition-colors",
                        selectedShoeSize === shoeSize
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {shoeSize}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              {added ? (
                <>
                  <Check className="h-4 w-4 mr-2" /> Ajoute !
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" /> Ajouter au panier
                </>
              )}
            </Button>

            <div className="mt-6 pt-6 border-t border-border space-y-2 text-xs text-muted-foreground">
              <p>Livraison locale rapide a Alger</p>
              <p>Paiement a la livraison</p>
              <p>Stock disponible : {product.stock} unite(s)</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

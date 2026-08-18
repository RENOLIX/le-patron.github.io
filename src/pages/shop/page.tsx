import { motion } from "motion/react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useShop } from "@/hooks/use-shop";

export default function ShopPage() {
  const { activeProducts } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-wide">
            La boutique
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {activeProducts.length} modele(s) disponible(s)
          </p>
        </div>

        {activeProducts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="font-serif text-xl mb-2">Aucun article trouve</p>
            <p className="text-sm">Les nouveautes seront ajoutees bientot.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

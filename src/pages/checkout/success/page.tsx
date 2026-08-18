import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle, ShoppingBag } from "lucide-react";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl border border-border bg-white px-6 py-10 md:px-10 md:py-12"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Merci
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Merci pour votre commande
          </h1>
          <p className="text-muted-foreground text-sm mb-2">
            Votre commande a bien ete enregistree et transmise a notre equipe.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Nous vous contacterons rapidement pour confirmer la livraison et finaliser
            l'expedition.
          </p>

          <div className="border border-border bg-muted/40 px-4 py-4 text-left mb-8">
            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Prochaine etape</p>
                <p>Garde ton telephone disponible pour la confirmation de commande.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop">
              <Button size="lg">Continuer les achats</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" size="lg">
                Retour a l'accueil
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

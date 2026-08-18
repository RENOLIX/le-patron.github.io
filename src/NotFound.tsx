import { Link } from "react-router-dom";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">
            404
          </p>
          <h1 className="font-serif text-4xl font-bold mb-4">Page introuvable</h1>
          <p className="text-sm text-muted-foreground mb-8">
            La page demandée n'existe pas ou a été déplacée.
          </p>
          <Link
            to="/"
            className="inline-flex border border-foreground px-6 py-3 text-xs tracking-widest uppercase"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

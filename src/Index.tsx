import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";
import DoorIntro from "@/components/shop/DoorIntro";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useShop } from "@/hooks/use-shop";
import { claimInitialHomeIntro } from "@/lib/initial-route";
import heroDesktop from "@/assets/mina-hero-desktop.jpg";
import heroMobile from "@/assets/mina-hero-mobile.jpg";
import signatureShowcase from "@/assets/mina-signature-showcase.jpg";

const COMMITMENTS = [
  {
    title: "Paiement a la livraison",
    desc: "Commandez en quelques minutes et reglez directement a la reception.",
    icon: Truck,
  },
  {
    title: "Pieces selectionnees",
    desc: "Des coupes actuelles, des matieres agreables et des prix penses pour l'Algerie.",
    icon: Sparkles,
  },
  {
    title: "Commande en toute confiance",
    desc: "Suivi simple, confirmation rapide et service client disponible avant et apres achat.",
    icon: ShieldCheck,
  },
];

export default function Index() {
  const { activeProducts } = useShop();
  const [email, setEmail] = useState("");
  const featured = activeProducts.filter((product) => product.featured).slice(0, 4);
  const [shouldPlayDoorIntro] = useState(() => claimInitialHomeIntro());

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DoorIntro enabled={shouldPlayDoorIntro} />
      <Header />

      <section className="relative h-[88svh] min-h-[720px] overflow-hidden md:h-[82vh] md:min-h-[620px]">
        <picture className="block h-full w-full">
          <source media="(max-width: 767px)" srcSet={heroMobile} />
          <img
            src={heroDesktop}
            alt="Collection Mina Boutique"
            className="h-full w-full object-cover object-center md:object-center"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,12,18,0.1)_0%,rgba(18,12,18,0.5)_100%)] md:bg-[linear-gradient(90deg,rgba(18,12,18,0.7)_0%,rgba(18,12,18,0.38)_42%,rgba(18,12,18,0.1)_100%)]" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-4 pb-10 sm:px-6 md:items-center md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="max-w-xl text-white md:max-w-2xl"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3 text-white/80">
              <span className="font-brand text-3xl leading-none text-white md:text-4xl">
                Mina
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em] md:text-xs md:tracking-[0.42em]">
                Boutique a Alger
              </span>
            </div>
            <h1 className="mb-5 font-serif text-4xl font-bold leading-none sm:text-5xl md:mb-6 md:text-7xl">
              Des silhouettes sobres,
              <br />
              pensees pour durer.
            </h1>
            <p className="mb-7 max-w-lg text-sm leading-relaxed text-white/80 md:mb-8 md:max-w-xl md:text-base">
              Decouvrez une selection de robes et de pieces feminines avec
              livraison locale et paiement a la livraison.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white px-7 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-white/90 md:px-8 md:py-4 md:text-xs"
            >
              Decouvrir la boutique <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="order-2 space-y-5 md:order-1">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
                La signature Mina
              </p>
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                Une boutique pensee autour de la robe feminine
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Mina Boutique selectionne des coupes elegantes, des matieres
              fluides et des details soignes pour accompagner vos sorties, vos
              fetes et vos moments du quotidien avec une allure simple et
              raffinee.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Robes longues", "Modeles de soiree", "Nouvelles arrivees"].map((item) => (
                <span
                  key={item}
                  className="border border-border bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
            >
              Voir la collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="order-1 md:order-2">
            <div className="overflow-hidden bg-muted shadow-[0_28px_70px_-56px_rgba(95,37,59,0.55)]">
              <img
                src={signatureShowcase}
                alt="Selection signature Mina Boutique"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
          {COMMITMENTS.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-border bg-white/70">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-serif text-2xl font-semibold">
                  {item.title}
                </h3>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Selection du moment
            </p>
            <h2 className="font-serif text-3xl font-bold">Produits vedettes</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Voir toute la boutique
          </Link>
        </motion.div>

        {featured.length === 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="mb-3 aspect-[3/4] w-full" />
                <Skeleton className="mb-2 h-3 w-16" />
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {featured.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="marble-bg px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Newsletter
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">
              Restez informe des nouvelles sorties
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Recevez les nouveautes, les retours en stock et les offres privees.
            </p>
            <form
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (!email.trim()) {
                  toast.error("Entrez votre adresse email.");
                  return;
                }
                toast.success("Merci, vous etes inscrit a la newsletter.");
                setEmail("");
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="votre@email.com"
                className="flex-1 border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-background transition-colors hover:opacity-90"
              >
                S&apos;abonner
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="bg-foreground px-4 py-20 text-center text-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
        >
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-white/50">
            Livraison locale
          </p>
          <h2 className="mb-4 font-serif text-3xl font-bold md:text-5xl">
            Commandez simplement, recevez rapidement
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-white/70">
            Livraison dans plusieurs wilayas, confirmation rapide et paiement a
            la livraison.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-white px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-foreground"
          >
            Commander maintenant <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

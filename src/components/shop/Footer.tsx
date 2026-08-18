import { Link } from "react-router-dom";
import {
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import BrandLogo from "@/components/shop/BrandLogo";

const LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/shop" },
  { label: "A propos", href: "/about" },
  { label: "Panier", href: "/cart" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-white to-[#fff3f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <BrandLogo
              className="mb-5 h-[88px] w-[220px]"
              imageClassName="object-[center_34%] scale-100"
            />
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              <span className="font-brand text-[1.65rem] leading-none text-primary">
                Mina
              </span>{" "}
              Boutique propose une selection de robes et de pieces feminines au
              style elegant, facile a porter et pense pour vos sorties comme
              pour le quotidien. Livraison rapide, paiement a la livraison et
              experience simple jusqu'a la reception.
            </p>
          </div>

          <div>
            <p className="mb-4 font-serif text-xl font-semibold">Navigation</p>
            <div className="grid gap-3 text-sm text-muted-foreground">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 font-serif text-xl font-semibold">Infos utiles</p>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Hydra, Alger
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> 0772379907
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> djemaabdellah5@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> Livraison 2 a 5 jours
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Paiement a la livraison
              </p>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs uppercase tracking-[0.22em] text-muted-foreground sm:flex-row">
          <p>© 2026 Mina Boutique</p>
          <p>Rose, blanc, livraison locale et paiement simple</p>
        </div>
      </div>
    </footer>
  );
}

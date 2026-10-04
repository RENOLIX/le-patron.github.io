import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { CartLine } from "../App";
import { db } from "../lib/firebase";
import { defaultShipping } from "../lib/default-shipping";

type Rate = { code: string; name: string; home: number; office: number; active: boolean };
const money = (value: number) => value.toLocaleString("fr-DZ") + " DA";
export default function Checkout({ cart, clear }: { cart: CartLine[]; clear: () => void }) {
  const [rates, setRates] = useState<Rate[]>(defaultShipping.map(([code, name, home, office]) => ({ code, name, home, office, active: true })));
  const [wilaya, setWilaya] = useState("16");
  const [method, setMethod] = useState<"domicile" | "bureau">("domicile");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ratesReady, setRatesReady] = useState(false);
  const locked = useRef(false);
  useEffect(() => onSnapshot(collection(db, "shipping"), snapshot => {
    const updates = new Map(snapshot.docs.map(entry => {
      const data = entry.data();
      return [String(data.code || entry.id).padStart(2, "0"), data];
    }));
    setRates(defaultShipping.map(([code, name, home, office]) => {
      const data = updates.get(code);
      return { code, name, home: data ? Number(data.home ?? home) : home, office: data ? Number(data.office ?? office) : office, active: data?.active !== false };
    }));
    setRatesReady(true);
    setError("");
  }, () => { setError("Impossible de vérifier les tarifs de livraison. Rechargez la page avant de commander."); }), []);
  const selected = rates.find(rate => rate.code === wilaya)!;
  // Changing wilaya must never leave an unavailable office selected.
  const effectiveMethod = method === "bureau" && selected.office > 0 ? "bureau" : "domicile";
  const shipping = effectiveMethod === "bureau" ? selected.office : selected.home;
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.qty, 0);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || !ratesReady || !selected.active || !cart.length) return;
    const form = new FormData(event.currentTarget);
    locked.current = true;
    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "orders"), {
        firstName: String(form.get("prenom") || "").trim(), lastName: String(form.get("nom") || "").trim(),
        phone: String(form.get("telephone") || "").trim(), wilaya: `${selected.code} · ${selected.name}`,
        address: String(form.get("adresse") || "").trim(), delivery: effectiveMethod, shipping, subtotal,
        total: subtotal + shipping, status: "Nouvelle",
        items: cart.map(line => ({ productId: String(line.product.id), name: line.product.name, size: line.size, qty: line.qty, price: line.product.price, image: line.product.images?.[0] || line.product.image || "", service: line.service || "Imprimé par taille", fabricWidth: line.fabricWidth || "", tableLength: line.tableLength || "" })),
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      clear();
      setSent(true);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      setError("La commande n’a pas pu être enregistrée. Votre panier est conservé. Veuillez réessayer.");
    } finally { locked.current = false; setSaving(false); }
  }
  if (sent) return <section className="thank-you"><Check size={42} /><p className="eyebrow">COMMANDE ENREGISTRÉE</p><h1>Merci pour votre commande.</h1><p>Notre équipe vous contactera rapidement pour la confirmer.</p><Link className="button" to="/collections/nos-patrons">Continuer mes achats <ArrowRight size={17} /></Link></section>;
  if (!cart.length) return <section className="checkout empty-checkout"><h1>Votre panier est vide.</h1><Link className="button" to="/collections/nos-patrons">Découvrir les patrons</Link></section>;
  return <section className="checkout">
    <div className="checkout-head"><p className="eyebrow">FINALISER LA COMMANDE</p><h1>Vos informations</h1><Link to="/collections/nos-patrons"><ArrowLeft size={15} /> Continuer les achats</Link></div>
    <form onSubmit={submit} className="checkout-layout"><div className="form-card"><h2>Livraison</h2><div className="form-grid">
      <label>Prénom<input required name="prenom" autoComplete="given-name" placeholder="Votre prénom" /></label><label>Nom<input required name="nom" autoComplete="family-name" placeholder="Votre nom" /></label>
      <label>Téléphone<input required name="telephone" type="tel" autoComplete="tel" placeholder="05 / 06 / 07 XX XX XX XX" /></label>
      <label>Wilaya<select value={wilaya} onChange={event => { setWilaya(event.target.value); setMethod("domicile"); }}>{rates.map(rate => <option key={rate.code} value={rate.code} disabled={!rate.active}>{rate.code} · {rate.name}{!rate.active ? " · Indisponible" : ""}</option>)}</select></label>
      <label className="wide">Adresse complète<input required name="adresse" autoComplete="street-address" placeholder="Commune, quartier, rue, numéro…" /></label>
    </div><h3>Mode de livraison</h3><div className="delivery-options">
      <button type="button" className={effectiveMethod === "domicile" ? "chosen" : ""} onClick={() => setMethod("domicile")}><b>À domicile</b><span>Livré directement à votre adresse</span><strong>{money(selected.home)}</strong></button>
      <button type="button" disabled={selected.office <= 0} className={effectiveMethod === "bureau" ? "chosen" : ""} onClick={() => setMethod("bureau")}><b>Au bureau</b><span>{selected.office <= 0 ? "Indisponible dans cette wilaya" : "Récupération au bureau de livraison"}</span><strong>{selected.office > 0 ? money(selected.office) : "—"}</strong></button>
    </div><div className="checkout-confirm-total"><span>Total à payer</span><b>{money(subtotal + shipping)}</b></div>
      {!selected.active && <p className="form-error" role="alert">Livraison indisponible dans cette wilaya.</p>}{error && <p className="form-error" role="alert">{error}</p>}
      <button className="button checkout-submit" type="submit" disabled={saving || !ratesReady || !selected.active}>{saving ? "Enregistrement…" : "Confirmer la commande"} <ArrowRight size={17} /></button>
    </div><aside className="summary"><p className="eyebrow">RÉSUMÉ DE COMMANDE</p>{cart.map((line, index) => <div className="summary-line" key={index}><span>{line.product.name} <small>×{line.qty} · {line.size}</small></span><b>{money(line.product.price * line.qty)}</b></div>)}<div className="summary-total"><span>Sous-total</span><b>{money(subtotal)}</b><span>Livraison · {selected.name}</span><b>{money(shipping)}</b><strong>Total</strong><strong>{money(subtotal + shipping)}</strong></div><p><Check size={14} /> Paiement à la livraison</p></aside></form>
  </section>;
}

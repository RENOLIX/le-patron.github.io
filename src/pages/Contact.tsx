import { useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowRight, Check } from "lucide-react";
import { db } from "../lib/firebase";

export default function Contact() {
  const [sent, setSent] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const locked = useRef(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    const element = event.currentTarget, form = new FormData(element);
    locked.current = true; setSaving(true); setError(""); setSent(false);
    try {
      await addDoc(collection(db, "messages"), { name: String(form.get("nom") || "").trim(), phone: String(form.get("telephone") || "").trim(), message: String(form.get("message") || "").trim(), createdAt: serverTimestamp() });
      setSent(true); element.reset();
    } catch { setError("Votre message n’a pas pu être envoyé. Veuillez réessayer."); }
    finally { locked.current = false; setSaving(false); }
  }
  return <section className="contact-page"><div><p className="eyebrow">PARLONS DE VOTRE PROJET</p><h1>Contactez-nous.</h1><p>Une question sur un patron, une taille ou votre commande ? Notre équipe vous répond avec plaisir.</p><a href="https://wa.me/213775263366">WhatsApp · 0775 26 33 66</a></div><form onSubmit={submit}><h2>Envoyez-nous un message</h2><label>Nom complet<input required name="nom" autoComplete="name" placeholder="Votre nom" /></label><label>Téléphone<input required name="telephone" type="tel" autoComplete="tel" placeholder="Votre numéro" /></label><label>Votre message<textarea required name="message" placeholder="Comment pouvons-nous vous aider ?" /></label><button className="button" disabled={saving}>{saving ? "Envoi…" : "Envoyer le message"} <ArrowRight size={17} /></button>{sent && <p className="sent" role="status"><Check size={16} /> Votre message a bien été envoyé.</p>}{error && <p className="form-error" role="alert">{error}</p>}</form></section>;
}

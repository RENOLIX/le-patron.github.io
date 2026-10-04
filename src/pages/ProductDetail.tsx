import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import type { Product } from "../App";

type Props = {
  products: Product[];
  ready: boolean;
  error: string;
  add: (product: Product, size: string, service: string, fabricWidth?: string, tableLength?: string) => void;
};

export default function ProductDetail({ products, ready, error, add }: Props) {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const id = params.get("id");
  const matches = products.filter(product => product.slug === slug);
  // Stable Firestore IDs distinguish even two products with the same name.
  const product = id ? products.find(product => String(product.id) === id) : matches.length === 1 ? matches[0] : undefined;
  const [sizes, setSizes] = useState<string[]>([]);
  const [service, setService] = useState("");
  const [fabricWidth, setFabricWidth] = useState("");
  const [tableLength, setTableLength] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  if (!ready) return <section className="product-page" aria-busy="true"><div className="product-placeholder" aria-label="Ouverture du patron" /></section>;
  if (error || !product) return <section className="notfound"><h1>{error || (matches.length > 1 ? "Choisissez ce patron depuis la boutique." : "Ce patron n’existe pas.")}</h1><Link to="/collections/nos-patrons">Retour à la boutique</Link></section>;

  const gallery = [...new Set((product.images?.length ? product.images : [product.image]).filter((image): image is string => !!image?.trim()))];
  const currentImage = gallery[activeImage] || gallery[0];
  const order = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"];
  const orderedSizes = [...new Set(product.sizes)].sort((a, b) => {
    const ai = order.indexOf(a), bi = order.indexOf(b);
    if (ai >= 0 || bi >= 0) return (ai < 0 ? 100 : ai) - (bi < 0 ? 100 : bi);
    return a.localeCompare(b, "fr", { numeric: true });
  });
  function addSelection() {
    if (!sizes.length) return setNotice("Veuillez choisir au moins une taille.");
    if (!service) return setNotice("Veuillez choisir un format.");
    if (service === "Placement sur mesure" && (![fabricWidth, tableLength].every(value => Number.isFinite(Number(value)) && Number(value) > 0))) return setNotice("Renseignez une largeur et une longueur supérieures à zéro.");
    sizes.forEach(size => add(product!, size, service, service === "Placement sur mesure" ? fabricWidth : undefined, service === "Placement sur mesure" ? tableLength : undefined));
    setSizes([]);
    setNotice("");
  }
  return <section className="product-page">
    <Link className="back" to="/collections/nos-patrons"><ArrowLeft size={16} /> Retour aux patrons</Link>
    <div className="product-layout">
      <div className="gallery">
        <div className="product-image-frame">
          {currentImage && !failedImages.includes(currentImage) ? <img key={currentImage} src={currentImage} alt={product.name} onError={() => setFailedImages(images => [...images, currentImage])} /> : <p role="status">{currentImage ? "Photo indisponible pour le moment." : "Photo à venir."}</p>}
        </div>
        {gallery.length > 1 && <div className="product-thumbnails">{gallery.map((image, index) => <button key={image} type="button" className={index === activeImage ? "selected" : ""} onClick={() => setActiveImage(index)} aria-label={`Voir la photo ${index + 1}`} aria-pressed={index === activeImage}><img src={image} alt={`${product.name} — photo ${index + 1}`} /></button>)}</div>}
      </div>
      <div className="details">
        <p className="eyebrow">{product.category.toUpperCase()}</p><h1>{product.name}</h1>
        <p className="price">{product.price.toLocaleString("fr-DZ")} DA <small>par taille</small></p><div className="rule" />
        <p className="description">{product.description}</p><div className="includes"><Check size={17} /><span>Patron et instructions détaillées incluses</span></div>
        <div className="sizes"><p>CHOISISSEZ UNE OU PLUSIEURS TAILLES</p><div>{orderedSizes.map(size => <button type="button" key={size} aria-pressed={sizes.includes(size)} className={`size-choice ${sizes.includes(size) ? "selected" : ""}`} onClick={() => setSizes(current => current.includes(size) ? current.filter(value => value !== size) : [...current, size])}>{size}</button>)}</div></div>
        <div className="service-choice"><p>CHOISISSEZ VOTRE FORMAT</p><div>{["Imprimé par taille", "Placement sur mesure"].map(format => <button type="button" key={format} aria-pressed={service === format} className={service === format ? "selected" : ""} onClick={() => setService(format)}><b>{format}</b><span>{format === "Imprimé par taille" ? "Sur papier traceur, livré chez vous." : "Adapté à votre table et votre tissu."}</span></button>)}</div>
          {service === "Placement sur mesure" && <div className="measurements"><label>Largeur du tissu (cm)<input type="number" min="1" value={fabricWidth} onChange={event => setFabricWidth(event.target.value)} placeholder="Ex. 140" /></label><label>Longueur de la table (cm)<input type="number" min="1" value={tableLength} onChange={event => setTableLength(event.target.value)} placeholder="Ex. 180" /></label></div>}
        </div>
        {notice && <p className="form-error" role="alert">{notice}</p>}
        <button className="btn-creuse product-add" type="button" onClick={addSelection}>Ajouter {sizes.length ? `${sizes.length} taille${sizes.length > 1 ? "s" : ""}` : "au panier"} <ShoppingBag size={17} /></button>
        <p className="delivery"><Check size={14} /> Prix calculé pour chaque taille sélectionnée.</p>
      </div>
    </div>
    <section className="product-info"><div><h3>Ce que vous recevez</h3><p>Le patron sélectionné, les marges de couture indiquées et un guide de montage clair.</p></div><div><h3>Besoin d’aide ?</h3><p>Écrivez-nous au <a href="https://wa.me/213775263366">0775 26 33 66</a>.</p></div><div><h3>Pour qui ?</h3><p>Pour les débutantes et les mains expertes, selon votre rythme.</p></div></section>
  </section>;
}

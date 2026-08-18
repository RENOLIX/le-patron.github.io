import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { useShop } from "@/hooks/use-shop";
import { formatProductSelections } from "@/lib/product-options";
import {
  WILAYA_SHIPPING_RATES,
  getDeliveryMethodLabel,
  getWilayaLabel,
} from "@/lib/shipping";

const schema = z.object({
  firstName: z.string().min(2, "Prenom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(9, "Numero invalide"),
  wilaya: z.string().min(1, "Veuillez choisir une wilaya"),
  address: z.string().min(5, "Adresse requise"),
  deliveryMethod: z.enum(["domicile", "bureau"], {
    message: "Veuillez choisir un mode de livraison",
  }),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { createOrder } = useShop();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryMethod: "domicile",
      wilaya: "",
    },
  });

  const selectedWilayaCode = watch("wilaya");
  const selectedDeliveryMethod = watch("deliveryMethod");
  const selectedWilaya =
    WILAYA_SHIPPING_RATES.find((wilaya) => wilaya.code === selectedWilayaCode) ?? null;
  const shippingPrice = selectedWilaya ? selectedWilaya[selectedDeliveryMethod] : 0;
  const totalWithShipping = totalPrice + shippingPrice;

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const onSubmit = async (data: FormData) => {
    const wilaya =
      WILAYA_SHIPPING_RATES.find((entry) => entry.code === data.wilaya) ?? null;

    if (!wilaya) {
      toast.error("Veuillez choisir une wilaya valide.");
      return;
    }

    const deliveryPrice = wilaya[data.deliveryMethod];

    setLoading(true);

    try {
      await createOrder({
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        customerPhone: data.phone,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          shoeSize: item.shoeSize,
          color: item.color,
        })),
        subtotal: totalPrice,
        shipping: deliveryPrice,
        total: totalPrice + deliveryPrice,
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: getWilayaLabel(wilaya),
          postalCode: wilaya.code,
          country: "Algerie",
          wilayaCode: wilaya.code,
          deliveryMethod: data.deliveryMethod,
        },
        paymentMethod: "Paiement a la livraison",
      });

      clearCart();
      navigate("/checkout/success");
    } catch {
      toast.error("Une erreur est survenue, veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        <h1 className="font-serif text-3xl font-bold mb-10">Passer la commande</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-5">
            <h2 className="text-xs font-semibold tracking-widest uppercase border-b border-border pb-3">
              Informations de livraison
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Prenom</Label>
                <Input placeholder="Mohamed" {...register("firstName")} />
                {errors.firstName ? (
                  <p className="text-xs text-red-600">{errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label>Nom</Label>
                <Input placeholder="Benali" {...register("lastName")} />
                {errors.lastName ? (
                  <p className="text-xs text-red-600">{errors.lastName.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input placeholder="exemple@gmail.com" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label>Numero de telephone</Label>
              <Input placeholder="0550 000 000" {...register("phone")} />
              {errors.phone ? (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label>Wilaya</Label>
              <select
                {...register("wilaya")}
                className="w-full border border-input rounded-none px-3 py-2 text-sm bg-background focus:outline-none focus:border-foreground transition-colors"
              >
                <option value="">-- Choisir votre wilaya --</option>
                {WILAYA_SHIPPING_RATES.map((wilaya) => (
                  <option key={wilaya.code} value={wilaya.code}>
                    {getWilayaLabel(wilaya)}
                  </option>
                ))}
              </select>
              {errors.wilaya ? (
                <p className="text-xs text-red-600">{errors.wilaya.message}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label>Mode de livraison</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {([
                  {
                    value: "domicile",
                    title: "Livraison a domicile",
                    icon: Home,
                  },
                  {
                    value: "bureau",
                    title: "Livraison bureau",
                    icon: Truck,
                  },
                ] as const).map(({ value, title, icon: Icon }) => {
                  const currentPrice = selectedWilaya ? selectedWilaya[value] : null;
                  const active = selectedDeliveryMethod === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("deliveryMethod", value, { shouldValidate: true })}
                      className={`border px-4 py-4 text-left transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:border-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 border flex items-center justify-center ${
                            active ? "border-white/30" : "border-border"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{title}</p>
                          <p
                            className={`text-xs ${
                              active ? "text-background/70" : "text-muted-foreground"
                            }`}
                          >
                            {selectedWilaya
                              ? `${currentPrice?.toLocaleString("fr-DZ")} DZD`
                              : "Choisissez une wilaya"}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          active ? "text-background/70" : "text-muted-foreground"
                        }`}
                      >
                        {value === "domicile"
                          ? "Reception directe a l'adresse indiquee."
                          : "Retrait en bureau de livraison selon la wilaya choisie."}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.deliveryMethod ? (
                <p className="text-xs text-red-600">{errors.deliveryMethod.message}</p>
              ) : null}
            </div>

            <input type="hidden" {...register("deliveryMethod")} />

            <div className="space-y-1">
              <Label>Adresse complete</Label>
              <textarea
                {...register("address")}
                rows={3}
                placeholder="Rue, quartier, immeuble, numero d'appartement ou point de retrait souhaite..."
                className="w-full border border-input rounded-none px-3 py-2 text-sm bg-background focus:outline-none focus:border-foreground transition-colors resize-none"
              />
              {errors.address ? (
                <p className="text-xs text-red-600">{errors.address.message}</p>
              ) : null}
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <h2 className="text-xs font-semibold tracking-widest uppercase pt-2">
                Mode de paiement
              </h2>
              <div className="border-2 border-foreground p-4 bg-foreground text-background">
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold tracking-wide">
                    Paiement a la livraison (Cash)
                  </span>
                </div>
                <p className="text-xs text-background/70 ml-8">
                  Payez en especes directement a la reception de votre commande.
                </p>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Traitement...
                </>
              ) : (
                `Confirmer - ${totalWithShipping.toLocaleString("fr-DZ")} DZD`
              )}
            </Button>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-widest uppercase border-b border-border pb-3 mb-6">
              Votre commande
            </h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${item.shoeSize ?? ""}`}
                  className="flex gap-4"
                >
                  <div className="w-16 h-20 bg-muted shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatProductSelections(item)}
                    </p>
                    <p className="text-xs text-muted-foreground">Qte : {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0 whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString("fr-DZ")} DZD
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Sous-total</span>
                <span>{totalPrice.toLocaleString("fr-DZ")} DZD</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Livraison</span>
                <span>
                  {selectedWilaya
                    ? `${shippingPrice.toLocaleString("fr-DZ")} DZD`
                    : "Choisissez une wilaya"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Mode</span>
                <span>
                  {selectedWilaya
                    ? getDeliveryMethodLabel(selectedDeliveryMethod)
                    : "Choisissez une wilaya"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Paiement</span>
                <span>A la livraison</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{totalWithShipping.toLocaleString("fr-DZ")} DZD</span>
              </div>
            </div>

            <div className="mt-6 p-4 marble-bg text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-[11px] tracking-widest uppercase mb-2">
                Infos livraison
              </p>
              <p>Delai estime : 2 a 5 jours ouvrables</p>
              <p>
                {selectedWilaya
                  ? `Tarif calcule pour ${getWilayaLabel(selectedWilaya)}`
                  : "Le tarif se calcule selon la wilaya choisie"}
              </p>
              <p>Choix disponible entre domicile et bureau</p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

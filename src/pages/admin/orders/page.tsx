import { useState } from "react";
import { Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import BrandLogo from "@/components/shop/BrandLogo";
import { useAuth } from "@/components/providers/auth";
import { useShop } from "@/hooks/use-shop";
import type { Order, OrderStatus } from "@/types";
import { getDeliveryMethodLabel } from "@/lib/shipping";
import { formatProductSelections } from "@/lib/product-options";
import { cn } from "@/lib/utils";

const STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "processing", label: "En traitement", color: "bg-blue-100 text-blue-800" },
  { value: "shipped", label: "Expedie", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Livre", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Annule", color: "bg-red-100 text-red-800" },
];

function formatPrice(value: number) {
  return `${value.toLocaleString("fr-DZ")} DZD`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPrintableOrderHtml(order: Order) {
  const deliveryLabel = order.shippingAddress.deliveryMethod
    ? getDeliveryMethodLabel(order.shippingAddress.deliveryMethod)
    : "Non precisee";

  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${escapeHtml(item.size)}</td>
          <td>${escapeHtml(item.shoeSize ?? "-")}</td>
          <td>${escapeHtml(item.color)}</td>
          <td>${item.quantity}</td>
          <td>${formatPrice(item.price)}</td>
          <td>${formatPrice(item.price * item.quantity)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Bordereau ${escapeHtml(order.orderNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 32px; }
      .wrap { max-width: 920px; margin: 0 auto; }
      .head { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 28px; letter-spacing: 0.1em; }
      h2 { font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.12em; }
      .muted { color: #666; }
      .brand-script { font-family: "Brush Script MT", "Segoe Script", cursive; font-size: 44px; letter-spacing: 0; color: #d85b92; }
      .brand-sub { font-size: 13px; text-transform: uppercase; letter-spacing: 0.35em; margin-left: 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
      .box { border: 1px solid #ddd; padding: 18px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
      th { background: #f5f5f5; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
      .totals { margin-left: auto; width: 320px; }
      .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
      .totals-row.total { font-weight: bold; font-size: 16px; border-bottom: 2px solid #111; }
      .footer { margin-top: 32px; font-size: 12px; color: #555; }
      @media print { body { padding: 0; } .wrap { padding: 24px; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">
        <div>
          <h1><span class="brand-script">Mina</span><span class="brand-sub">Boutique</span></h1>
          <p class="muted">Bordereau de commande / livraison</p>
        </div>
        <div>
          <p><strong>Commande :</strong> ${escapeHtml(order.orderNumber)}</p>
          <p><strong>Date :</strong> ${escapeHtml(formatDate(order.createdAt))}</p>
          <p><strong>Statut :</strong> ${escapeHtml(order.status)}</p>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <h2>Client</h2>
          <p>${escapeHtml(order.customerName)}</p>
          <p>${escapeHtml(order.customerEmail)}</p>
          <p>${escapeHtml(order.customerPhone)}</p>
        </div>
        <div class="box">
          <h2>Livraison</h2>
          <p>${escapeHtml(order.shippingAddress.firstName)} ${escapeHtml(order.shippingAddress.lastName)}</p>
          <p>${escapeHtml(order.shippingAddress.address)}</p>
          <p>${escapeHtml(order.shippingAddress.postalCode)} ${escapeHtml(order.shippingAddress.city)}</p>
          <p>${escapeHtml(order.shippingAddress.country)}</p>
          <p><strong>Mode :</strong> ${escapeHtml(deliveryLabel)}</p>
          <p><strong>Paiement :</strong> ${escapeHtml(order.paymentMethod)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Taille</th>
            <th>Pointure</th>
            <th>Couleur</th>
            <th>Qte</th>
            <th>Prix</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Sous-total</span><span>${formatPrice(order.subtotal)}</span></div>
        <div class="totals-row"><span>Livraison</span><span>${formatPrice(order.shipping)}</span></div>
        <div class="totals-row total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
      </div>

      <div class="footer">
        <p>Document genere depuis le panneau d'administration Mina Boutique.</p>
      </div>
    </div>
  </body>
</html>`;
}

function printOrder(order: Order) {
  const popup = window.open("", "_blank", "width=980,height=760");

  if (!popup) {
    toast.error("Autorise les popups pour imprimer le bordereau.");
    return;
  }

  popup.document.open();
  popup.document.write(buildPrintableOrderHtml(order));
  popup.document.close();
  popup.focus();

  const triggerPrint = () => {
    popup.print();
    popup.onafterprint = () => popup.close();
  };

  popup.onload = () => {
    window.setTimeout(triggerPrint, 180);
  };
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const current = STATUSES.find((entry) => entry.value === status);

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2 py-1",
        current?.color ?? "bg-muted text-muted-foreground",
      )}
    >
      {current?.label ?? status}
    </span>
  );
}

function StatusSelect({
  orderId,
  status,
  disabled = false,
  onStatusChange,
}: {
  orderId: string;
  status: OrderStatus;
  disabled?: boolean;
  onStatusChange: (id: string, nextStatus: OrderStatus) => Promise<void>;
}) {
  return (
    <select
      value={status}
      disabled={disabled}
      onChange={async (event) => {
        try {
          await onStatusChange(orderId, event.target.value as OrderStatus);
          toast.success("Statut mis a jour");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Mise a jour impossible");
        }
      }}
      className="border border-input bg-background px-2 py-2 text-xs w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {STATUSES.map((entry) => (
        <option key={entry.value} value={entry.value}>
          {entry.label}
        </option>
      ))}
    </select>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="pt-3 grid grid-cols-1 xl:grid-cols-2 gap-6 text-sm">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-muted-foreground">
          Articles
        </p>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={`${item.productName}-${index}`} className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatProductSelections(item)} x{item.quantity}
                </p>
              </div>
              <span className="font-medium shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Livraison</span>
            <span>{formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-muted-foreground">
          Livraison
        </p>
        <div className="space-y-1 text-sm">
          <p>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-muted-foreground">{order.shippingAddress.address}</p>
          <p className="text-muted-foreground">
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
          </p>
          <p className="text-muted-foreground">{order.shippingAddress.country}</p>
          <p className="pt-2 text-muted-foreground">
            Mode :{" "}
            {order.shippingAddress.deliveryMethod
              ? getDeliveryMethodLabel(order.shippingAddress.deliveryMethod)
              : "Non precise"}
          </p>
          <p className="text-muted-foreground">Paiement : {order.paymentMethod}</p>
          <p className="text-muted-foreground">Telephone : {order.customerPhone}</p>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="button"
            onClick={() => printOrder(order)}
            className="inline-flex items-center gap-2 border border-border bg-white/75 px-4 py-2 text-xs uppercase tracking-[0.18em]"
          >
            <Printer className="h-4 w-4" /> Imprimer le bordereau
          </button>
          <StatusBadge status={order.status} />
        </div>
      </div>
    </div>
  );
}

function MobileOrderCard({
  order,
  canUpdateOrders,
  onStatusChange,
}: {
  order: Order;
  canUpdateOrders: boolean;
  onStatusChange: (id: string, nextStatus: OrderStatus) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-[24px] border border-border bg-white/85 p-4 shadow-[0_20px_60px_-54px_rgba(219,97,149,0.7)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-medium">{order.orderNumber}</p>
          <p className="font-medium text-sm mt-2">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
          <p className="text-xs text-muted-foreground mt-2">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Total
          </p>
          <p className="font-semibold">{formatPrice(order.total)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Livraison
          </p>
          <p className="font-semibold">{formatPrice(order.shipping)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-4">
        {canUpdateOrders ? (
          <StatusSelect
            orderId={order.id}
            status={order.status}
            onStatusChange={onStatusChange}
          />
        ) : (
          <div className="flex items-center justify-between rounded-[18px] border border-border bg-[#fff8fb] px-4 py-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Statut
            </span>
            <StatusBadge status={order.status} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-white/75 text-xs uppercase tracking-[0.18em]"
          >
            <Eye className="h-4 w-4" /> {open ? "Masquer" : "Details"}
          </button>
          <button
            type="button"
            onClick={() => printOrder(order)}
            className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-white/75 text-xs uppercase tracking-[0.18em]"
          >
            <Printer className="h-4 w-4" /> Imprimer
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-5 pt-4 border-t border-border">
          <OrderDetails order={order} />
        </div>
      ) : null}
    </article>
  );
}

function DesktopOrderRow({
  order,
  canUpdateOrders,
  onStatusChange,
}: {
  order: Order;
  canUpdateOrders: boolean;
  onStatusChange: (id: string, nextStatus: OrderStatus) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => setOpen((current) => !current)}
      >
        <td className="px-4 py-3 font-mono text-xs font-medium">{order.orderNumber}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-sm">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
          {formatDate(order.createdAt)}
        </td>
        <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
        <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
          {canUpdateOrders ? (
            <StatusSelect
              orderId={order.id}
              status={order.status}
              onStatusChange={onStatusChange}
            />
          ) : (
            <StatusBadge status={order.status} />
          )}
        </td>
      </tr>
      {open ? (
        <tr>
          <td colSpan={5} className="px-4 pb-4 bg-muted/30 border-b border-border">
            <OrderDetails order={order} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default function AdminOrdersPage() {
  const { canManageOrders, canUpdateOrders } = useAuth();
  const { orders, updateOrderStatus } = useShop();

  if (!canManageOrders) {
    return null;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 rounded-[28px] border border-border bg-white/80 p-5 shadow-[0_24px_70px_-52px_rgba(219,97,149,0.5)]">
        <div className="space-y-3">
          <BrandLogo className="h-12 w-[150px]" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Mina admin
            </p>
            <h1 className="font-serif text-2xl font-bold md:text-3xl">Commandes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {orders.length} commande(s) a suivre
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border bg-white/70 py-16 text-center md:py-24">
          <p className="font-serif text-xl mb-2">Aucune commande</p>
          <p className="text-sm text-muted-foreground">
            Les commandes passees sur la boutique apparaitront ici.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                canUpdateOrders={canUpdateOrders}
                onStatusChange={updateOrderStatus}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[28px] border border-border bg-white/80 shadow-[0_24px_70px_-54px_rgba(219,97,149,0.55)] md:block">
            <table className="w-full text-sm">
              <thead className="bg-[#fff4f8]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                    N° commande
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <DesktopOrderRow
                    key={order.id}
                    order={order}
                    canUpdateOrders={canUpdateOrders}
                    onStatusChange={updateOrderStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

import { Link, Navigate } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BrandLogo from "@/components/shop/BrandLogo";
import { useAuth } from "@/components/providers/auth";
import { useShop } from "@/hooks/use-shop";
import { Button } from "@/components/ui/button";

export default function AdminProductsPage() {
  const { canManageProducts } = useAuth();
  const { products, removeProduct } = useShop();

  if (!canManageProducts) {
    return <Navigate to="/admin/orders" replace />;
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer "${name}" ?`)) {
      return;
    }

    try {
      await removeProduct(id);
      toast.success("Produit supprime");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible");
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-border bg-white/80 p-5 shadow-[0_24px_70px_-52px_rgba(219,97,149,0.5)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <BrandLogo className="h-12 w-[150px]" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Mina admin
            </p>
            <h1 className="font-serif text-2xl font-bold md:text-3xl">Produits</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} article(s) dans la boutique
            </p>
          </div>
        </div>
        <Link to="/admin/products/new" className="sm:shrink-0">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border bg-white/70 py-16 text-center md:py-24">
          <p className="font-serif text-xl mb-2">Aucun produit</p>
          <p className="text-sm text-muted-foreground mb-6">
            Commencez par ajouter votre premier article.
          </p>
          <Link to="/admin/products/new">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" /> Creer un produit
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-[24px] border border-border bg-white/85 p-4 shadow-[0_20px_60px_-54px_rgba(219,97,149,0.7)]"
              >
                <div className="flex gap-4">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-24 object-cover bg-muted shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-24 bg-muted shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                      </div>
                      <span
                        className={
                          product.active
                            ? "text-[10px] font-bold tracking-widest uppercase text-green-600"
                            : "text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
                        }
                      >
                        {product.active ? "Actif" : "Inactif"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Prix
                        </p>
                        <p className="font-semibold">{product.price.toLocaleString("fr-DZ")} DZD</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Stock
                        </p>
                        <p className="font-semibold">{product.stock}</p>
                      </div>
                    </div>

                    {product.featured ? (
                      <p className="text-[11px] text-amber-600 font-medium mt-3">Produit vedette</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Link
                    to={`/shop/product/${product.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-white/75 text-xs uppercase tracking-[0.18em]"
                  >
                    <Eye className="h-4 w-4" /> Voir
                  </Link>
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-white/75 text-xs uppercase tracking-[0.18em]"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 text-xs uppercase tracking-[0.18em]"
                    onClick={() => void handleDelete(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4" /> Suppr
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[28px] border border-border bg-white/80 shadow-[0_24px_70px_-54px_rgba(219,97,149,0.55)] md:block">
            <table className="w-full text-sm">
              <thead className="bg-[#fff4f8]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                    Produit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                    Prix
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase hidden lg:table-cell">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase hidden xl:table-cell">
                    Statut
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-[#fff7fa]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-12 object-cover bg-muted shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-12 bg-muted shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          {product.featured ? (
                            <span className="text-[10px] text-amber-600 font-medium">
                              Produit vedette
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {product.price.toLocaleString("fr-DZ")} DZD
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span
                        className={
                          product.active
                            ? "text-[10px] font-bold tracking-widest uppercase text-green-600"
                            : "text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
                        }
                      >
                        {product.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/shop/product/${product.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center hover:bg-[#fff0f6]"
                          title="Voir"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center hover:bg-[#fff0f6]"
                          title="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center text-red-600 hover:bg-red-50"
                          onClick={() => void handleDelete(product.id, product.name)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

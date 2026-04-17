"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────
interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; price: number;
  discountPrice: number | null; stock: number; images: string[];
  isTrending: boolean; categoryId: string;
  category: { id: string; name: string };
}

interface FormState {
  name: string; description: string; price: string;
  discountPrice: string; stock: string; categoryId: string; isTrending: boolean;
}

const EMPTY_FORM: FormState = {
  name: "", description: "", price: "", discountPrice: "",
  stock: "0", categoryId: "", isTrending: false,
};

// ── Modal ──────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form,        setForm]        = useState<FormState>(EMPTY_FORM);
  const [images,      setImages]      = useState<File[]>([]);
  const [previews,    setPreviews]    = useState<string[]>([]);
  const [isSaving,    setIsSaving]    = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const [pRes, cRes] = await Promise.all([
      api.get("/api/products"),
      api.get("/api/categories"),
    ]);
    setProducts(pRes.data.data.products ?? []);
    setCategories(cRes.data.data.categories ?? []);
  };

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setPreviews([]);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: "",
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() ?? "",
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      isTrending: product.isTrending,
    });
    setImages([]);
    setPreviews(product.images);
    setShowModal(true);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5);
    setImages(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Name, price and category are required");
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",        form.name);
      fd.append("description", form.description);
      fd.append("price",       form.price);
      if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
      fd.append("stock",       form.stock);
      fd.append("categoryId",  form.categoryId);
      fd.append("isTrending",  String(form.isTrending));
      images.forEach((img) => fd.append("images", img));

      if (editProduct) {
        await api.put(`/api/products/${editProduct.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated!");
      } else {
        await api.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created!");
      }

      setShowModal(false);
      await fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Trending</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{product.category.name}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">${product.price}</span>
                      {product.discountPrice && (
                        <span className="text-xs text-rose-500 ml-1">${product.discountPrice}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        product.stock === 0 ? "bg-red-100 text-red-700"
                        : product.stock <= 5 ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {product.isTrending
                        ? <span className="text-xs font-bold text-rose-500">🔥 Yes</span>
                        : <span className="text-xs text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors" aria-label="Edit product">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40" aria-label="Delete product">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="font-semibold">No products yet</p>
                <p className="text-sm mt-1">Click &quot;Add Product&quot; to create your first product</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title={editProduct ? "Edit Product" : "Add Product"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Product Name *", key: "name", type: "text", span: 2 },
                { label: "Price *", key: "price", type: "number" },
                { label: "Discount Price", key: "discountPrice", type: "number" },
                { label: "Stock *", key: "stock", type: "number" },
              ].map(({ label, key, type, span }) => (
                <div key={key} className={span === 2 ? "col-span-2" : ""}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof FormState] as string}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    min={type === "number" ? "0" : undefined}
                    step={key === "price" || key === "discountPrice" ? "0.01" : undefined}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Trending */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isTrending}
                onChange={(e) => setForm((prev) => ({ ...prev, isTrending: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm font-semibold text-gray-700">Mark as Trending 🔥</span>
            </label>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Images {editProduct ? "(upload to replace existing)" : "(max 5)"}
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <p className="text-sm text-gray-500">Click to upload images</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 5MB each</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {previews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={src} alt={`Preview ${i + 1}`} fill sizes="64px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60">
                {isSaving ? "Saving..." : editProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
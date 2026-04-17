"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Category {
  id: string; name: string; slug: string; image: string | null;
  _count?: { products: number };
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
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

export default function AdminCategoriesPage() {
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [editCategory,  setEditCategory]  = useState<Category | null>(null);
  const [name,          setName]          = useState("");
  const [image,         setImage]         = useState<File | null>(null);
  const [preview,       setPreview]       = useState<string>("");
  const [isSaving,      setIsSaving]      = useState(false);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    const res = await api.get("/api/categories");
    setCategories(res.data.data.categories ?? []);
  };

  useEffect(() => {
    fetchCategories().finally(() => setIsLoading(false));
  }, []);

  const openCreate = () => {
    setEditCategory(null);
    setName("");
    setImage(null);
    setPreview("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setName(cat.name);
    setImage(null);
    setPreview(cat.image ?? "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (image) fd.append("image", image);

      if (editCategory) {
        await api.put(`/api/categories/${editCategory.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated!");
      } else {
        await api.post("/api/categories", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category created!");
      }

      setShowModal(false);
      await fetchCategories();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-gray-50">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900 text-sm truncate">{cat.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <button onClick={() => openEdit(cat)}
                    className="text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors disabled:opacity-40">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <p className="font-semibold">No categories yet</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title={editCategory ? "Edit Category" : "Add Category"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shoes"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image</label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-gray-400 transition-colors">
                {preview ? (
                  <div className="relative w-20 h-20 mx-auto rounded-lg overflow-hidden">
                    <Image src={preview} alt="Preview" fill sizes="80px" className="object-cover" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60">
                {isSaving ? "Saving..." : editCategory ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
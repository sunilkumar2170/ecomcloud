'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import Modal from '../../../components/Modal';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { Product } from '../../../types';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '', category_id: '' };

export default function ProductsPage() {
  const { tenantId } = useAuth();
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', tenantId],
    queryFn: () => productsApi.list(tenantId!),
    enabled: !!tenantId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', tenantId],
    queryFn: () => productsApi.categories(tenantId!),
    enabled: !!tenantId,
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(tenantId!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsApi.update(tenantId!, editing!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(tenantId!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const openCreate = () => { setForm(emptyForm); setError(''); setModal('create'); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock), image_url: p.image_url || '', category_id: p.category_id || '' }); setError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); setForm(emptyForm); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 };
    if (modal === 'create') createMutation.mutate(payload);
    else updateMutation.mutate(payload);
  };

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-36 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="card p-12 text-center">
          <Package size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No products yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first product to get started</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p: Product) => (
          <div key={p.id} className="card overflow-hidden flex flex-col">
            {p.image_url
              ? <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />
              : <div className="w-full h-40 bg-gray-100 flex items-center justify-center"><Package size={32} className="text-gray-300" /></div>
            }
            <div className="p-4 flex flex-col flex-1">
              <div className="flex-1">
                {p.categories && <span className="text-xs text-brand-600 font-medium">{p.categories.name}</span>}
                <h3 className="font-semibold text-gray-900 mt-1 truncate">{p.name}</h3>
                {p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{fmt(p.price)}</p>
                  <p className={`text-xs mt-0.5 ${p.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>{p.stock} in stock</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => confirm('Delete this product?') && deleteMutation.mutate(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'Add Product' : 'Edit Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($) *</label>
              <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={set('price')} required />
            </div>
            <div>
              <label className="label">Stock</label>
              <input type="number" min="0" className="input" value={form.stock} onChange={set('stock')} />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category_id} onChange={set('category_id')}>
              <option value="">No category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input" value={form.image_url} onChange={set('image_url')} placeholder="https://..." />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending || updateMutation.isPending ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

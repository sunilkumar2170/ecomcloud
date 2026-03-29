'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import Modal from '../../../components/Modal';
import { ShoppingCart, Eye } from 'lucide-react';
import { Order } from '../../../types';

const STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

function Badge({ status }: { status: string }) {
  return <span className={`badge-${status}`}>{status}</span>;
}

export default function OrdersPage() {
  const { tenantId, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const tid = tenantId || 'all';

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', tid],
    queryFn: () => ordersApi.list(tid),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(tid, id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); setSelected(null); },
  });

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const filtered = filterStatus === 'all' ? orders : orders.filter((o: Order) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filterStatus === s ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ShoppingCart size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">No orders found</p>
                  </td>
                </tr>
              )}
              {filtered.map((o: Order) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4 text-gray-700 max-w-[180px] truncate">{o.customer_email}</td>
                  <td className="px-6 py-4 text-gray-500">{o.line_items?.length ?? 0} item{o.line_items?.length !== 1 ? 's' : ''}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{fmt(o.total)}</td>
                  <td className="px-6 py-4"><Badge status={o.status} /></td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelected(o)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Order Details">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-mono text-gray-700 break-all">{selected.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Customer</p>
                <p className="text-gray-700">{selected.customer_email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="text-gray-700">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Status</p>
                <Badge status={selected.status} />
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Line Items</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs text-gray-500">Product</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selected.line_items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-gray-700">{item.name}</td>
                        <td className="px-4 py-2 text-right text-gray-500">×{item.quantity}</td>
                        <td className="px-4 py-2 text-right font-medium">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Total</td>
                      <td className="px-4 py-2 text-right font-bold text-gray-900">${selected.total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatusMutation.mutate({ id: selected.id, status: s })}
                    disabled={selected.status === s || updateStatusMutation.isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors disabled:opacity-40 ${selected.status === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

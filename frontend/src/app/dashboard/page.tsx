'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import StatCard from '../../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Package, Store, Users, AlertTriangle } from 'lucide-react';

function Badge({ status }: { status: string }) {
  return <span className={`badge-${status}`}>{status}</span>;
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['overview'],
    queryFn: dashboardApi.overview,
  });

  const { data: chart = [] } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: dashboardApi.revenueChart,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: dashboardApi.recentOrders,
  });

  const fmt = (n: number) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loadingOverview) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(overview?.total_revenue)} icon={<DollarSign size={20} />} color="green" />
        <StatCard label="Total Orders" value={overview?.total_orders ?? 0} icon={<ShoppingBag size={20} />} color="blue" />
        <StatCard label="Products" value={overview?.total_products ?? 0} icon={<Package size={20} />} color="purple" />
        {isAdmin
          ? <StatCard label="Active Stores" value={overview?.total_tenants ?? 0} icon={<Store size={20} />} color="orange" />
          : <StatCard label="Low Stock Alerts" value={overview?.low_stock_alerts ?? 0} icon={<AlertTriangle size={20} />} color="red" sub="Items with stock < 5" />
        }
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chart} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
              {recentOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4 text-gray-700">{o.customer_email}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{fmt(o.total)}</td>
                  <td className="px-6 py-4"><Badge status={o.status} /></td>
                  <td className="px-6 py-4 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

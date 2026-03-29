'use client';
import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Store, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { Tenant } from '../../../types';

export default function TenantsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) router.push('/dashboard');
  }, [isAdmin]);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsApi.list,
    enabled: isAdmin,
  });

  const list = Array.isArray(tenants) ? tenants : [tenants];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <p className="text-gray-500 text-sm mt-1">{list.length} active store{list.length !== 1 ? 's' : ''}</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((t: Tenant) => (
          <TenantCard key={t.id} tenant={t} />
        ))}
      </div>
    </div>
  );
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  const { data: stats } = useQuery({
    queryKey: ['tenant-stats', tenant.id],
    queryFn: () => tenantsApi.stats(tenant.id),
  });

  const fmt = (n: number) => `$${(n || 0).toFixed(2)}`;

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
          <Store size={20} className="text-brand-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
          <p className="text-xs text-gray-400">{new Date(tenant.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg mx-auto mb-1">
              <TrendingUp size={14} className="text-green-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">{fmt(stats.total_revenue)}</p>
            <p className="text-xs text-gray-400">Revenue</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg mx-auto mb-1">
              <ShoppingCart size={14} className="text-blue-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">{stats.order_count}</p>
            <p className="text-xs text-gray-400">Orders</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-50 rounded-lg mx-auto mb-1">
              <Package size={14} className="text-purple-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">{stats.product_count}</p>
            <p className="text-xs text-gray-400">Products</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-mono break-all">{tenant.id}</p>
      </div>
    </div>
  );
}

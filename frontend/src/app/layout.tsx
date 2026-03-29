import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../lib/query-provider';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
  title: 'EcomCloud',
  description: 'Multi-Tenant E-Commerce Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StockFlow MVP',
  description: 'Multi-tenant SaaS inventory management engine',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 m-0 p-0">
        {children}
      </body>
    </html>
  );
}
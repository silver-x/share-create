import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WalletProvider from '@/components/WalletProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '分享创建 - 让分享更有价值',
  description: '在这里，分享你的创意，发现更多精彩',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <WalletProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </WalletProvider>
      </body>
    </html>
  );
}

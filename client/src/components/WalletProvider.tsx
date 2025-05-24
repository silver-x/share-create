'use client';

import { WalletKitProvider } from '@mysten/wallet-kit';
import { ReactNode } from 'react';

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WalletKitProvider
      preferredWallets={['Sui Wallet', 'Ethos Wallet']}
    >
      {children}
    </WalletKitProvider>
  );
} 
import { JsonRpcProvider, Connection } from '@mysten/sui';

const connection = new Connection({
  fullnode: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.mainnet.sui.io',
});

export const provider = new JsonRpcProvider(connection);

export const formatSuiAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getShareUrl = (txId: string) => {
  return `https://suiexplorer.com/txblock/${txId}`;
}; 
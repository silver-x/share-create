import { useWalletKit } from '@mysten/wallet-kit';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { message } from 'antd';

export default function SuiWalletLogin() {
  const { currentAccount, signMessage } = useWalletKit();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!currentAccount) {
      message.error('请先连接SUI钱包');
      return;
    }

    try {
      setLoading(true);
      const message = 'Welcome to Share Create! Please sign this message to login.';
      const signature = await signMessage({
        message: new TextEncoder().encode(message),
      });

      const response = await fetch('/auth/sui-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: currentAccount.address,
          message,
          signature: signature,
        }),
      });

      const data = await response.json();
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        message.success('登录成功');
        router.push('/');
      } else {
        message.error('登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading || !currentAccount}
      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      {loading ? '登录中...' : currentAccount ? '使用SUI钱包登录' : '请先连接SUI钱包'}
    </button>
  );
} 
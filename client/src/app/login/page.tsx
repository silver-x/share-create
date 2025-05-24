'use client';

import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faCheckCircle, faWallet } from '@fortawesome/free-solid-svg-icons';
import { useWalletKit, ConnectButton } from '@mysten/wallet-kit';
import { SuiAddress } from '@mysten/sui.js';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { userApi } from '@/api';
import { LoginDto, RegisterDto, User } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

// 添加格式化钱包地址的函数
const formatWalletAddress = (address: string | undefined) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 添加类型断言函数
const getWalletAddress = (account: any): string | undefined => {
  if (!account) return undefined;
  if (Array.isArray(account)) return undefined;
  return account.address;
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { currentAccount, signPersonalMessage, connect, disconnect, wallets } = useWalletKit();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginDto | RegisterDto>({
    username: '',
    password: '',
    confirmPassword: '',
  });

  // 使用useMemo处理钱包地址
  const formattedAddress = useMemo(() => {
    if (!currentAccount || Array.isArray(currentAccount)) return '';
    const address = currentAccount.address as unknown as string;
    return formatWalletAddress(address);
  }, [currentAccount]);

  // 根据URL参数设置初始状态
  useEffect(() => {
    const mode = searchParams?.get('mode');
    setIsLogin(mode !== 'register');
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.username.trim() || !formData.password.trim()) {
      setError(t('login.errors.emptyFields'));
      return;
    }

    if (!isLogin && formData.password !== (formData as RegisterDto).confirmPassword) {
      setError(t('login.errors.passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      const response = isLogin
        ? await userApi.login(formData as LoginDto)
        : await userApi.register(formData as RegisterDto);

      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        
        try {
          const userResponse = await userApi.getProfile();
          if (!userResponse.data) {
            throw new Error(t('login.errors.getUserInfoFailed'));
          }

          const userData = userResponse.data;
          const event = new CustomEvent('userStateChanged', { 
            detail: { user: userData }
          });
          window.dispatchEvent(event);
          
          setSuccess(isLogin ? t('login.success.login') : t('login.success.register'));
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const from = searchParams?.get('from') || '/';
          router.push(from);
        } catch (err) {
          console.error('获取用户信息失败:', err);
          localStorage.removeItem('token');
          throw new Error(t('login.errors.getUserInfoFailed'));
        }
      } else {
        throw new Error(isLogin ? t('login.errors.loginFailed') : t('login.errors.registerFailed'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || (isLogin ? t('login.errors.loginFailed') : t('login.errors.registerFailed')));
      console.error(isLogin ? '登录失败:' : '注册失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuiLogin = async () => {
    console.log('开始SUI钱包登录流程');
    console.log('当前钱包状态:', currentAccount);
    console.log('可用钱包列表:', wallets);

    if (wallets.length === 0) {
      setError('未检测到SUI钱包扩展，请先安装SUI钱包');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let address = null;
      if (!currentAccount) {
        console.log('未检测到钱包，尝试连接...');
        const wallet = wallets[0];
        console.log('尝试连接钱包:', wallet.name);
        await connect(wallet.name);
        console.log('钱包连接请求已发送 -> ' + JSON.stringify(wallet));
        address = wallet.accounts;
        // 等待钱包连接完成
        await new Promise(resolve => setTimeout(resolve, 1000));
      }else{
        address = currentAccount.address
      }

      console.log('开始签名流程');
      const message = 'Welcome to Share Create! Please sign this message to login.';
      console.log('准备签名消息:', message);
      
      const signature = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });
      console.log('签名成功:', signature);

      console.log('发送登录请求到服务器 => ' + JSON.stringify(address));
      if (!address) {
        throw new Error('钱包地址未获取到');
      }
      const response = await userApi.suiLogin({
        address: address,
        message,
        signature: signature.toString(),
      });

      console.log('服务器响应:', response);

      if (response.data?.data?.token) {
        console.log('登录成功，保存token和用户信息');
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        const event = new CustomEvent('userStateChanged', { 
          detail: { user: response.data.data.user }
        });
        window.dispatchEvent(event);
        
        setSuccess(t('login.success.login'));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const from = searchParams?.get('from') || '/';
        router.push(from);
      } else {
        throw new Error(t('login.errors.loginFailed'));
      }
    } catch (error) {
      console.error('SUI钱包登录失败:', error);
      setError(t('login.errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSuiRegister = async () => {
    console.log('开始SUI钱包注册流程');
    console.log('当前钱包状态:', currentAccount);
    console.log('可用钱包列表:', wallets);

    if (wallets.length === 0) {
      setError('未检测到SUI钱包扩展，请先安装SUI钱包');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!currentAccount) {
        console.log('未检测到钱包，尝试连接...');
        const wallet = wallets[0];
        console.log('尝试连接钱包:', wallet.name);
        await connect(wallet.name);
        console.log('钱包连接请求已发送');
        // 等待钱包连接完成
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('开始签名流程');
      const message = 'Welcome to Share Create! Please sign this message to register.';
      console.log('准备签名消息:', message);
      
      const signature = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });
      console.log('签名成功:', signature);

      console.log('发送注册请求到服务器');
      const response = await fetch('/api/auth/sui-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: currentAccount?.address,
          message,
          signature: signature,
        }),
      });

      const data = await response.json();
      console.log('服务器响应:', data);

      if (data.data?.token) {
        console.log('注册成功，保存token和用户信息');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        const event = new CustomEvent('userStateChanged', { 
          detail: { user: data.data.user }
        });
        window.dispatchEvent(event);
        
        setSuccess(t('login.success.register'));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const from = searchParams?.get('from') || '/';
        router.push(from);
      } else {
        throw new Error(t('login.errors.registerFailed'));
      }
    } catch (error) {
      console.error('SUI钱包注册失败:', error);
      setError(t('login.errors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setError(null);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
    });
    router.push(newMode ? '/login' : '/login?mode=register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {isLogin ? t('login.welcome') : t('login.createAccount')}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {isLogin ? t('login.loginDesc') : t('login.registerDesc')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 用户名 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={t('login.usernamePlaceholder')}
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={t('login.passwordPlaceholder')}
                  />
                </div>
              </div>

              {/* 密码确认（仅注册时显示） */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={(formData as RegisterDto).confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder={t('login.confirmPasswordPlaceholder')}
                    />
                  </div>
                </div>
              )}

              {/* 登录/注册按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? t('login.loading') : (isLogin ? t('login.login') : t('login.register'))}
              </button>
            </form>

            {/* 切换登录/注册模式 */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isLogin ? t('login.noAccount') : t('login.haveAccount')}
              </button>
            </div>

            {/* SUI钱包登录/注册 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('login.or')}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* <ConnectButton /> */}
                {formattedAddress && (
                  <div className="text-center text-sm text-gray-600 mb-2 flex flex-col items-center gap-2">
                    <span>{formattedAddress}</span>
                    <button
                      type="button"
                      onClick={disconnect}
                      className="mt-1 px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700 border border-gray-300"
                    >
                      {t('login.disconnectWallet') || '断开连接'}
                    </button>
                  </div>
                )}
                <button
                  onClick={isLogin ? handleSuiLogin : handleSuiRegister}
                  disabled={loading}
                  className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faWallet} className="mr-2 w-4 h-4" />
                  {loading ? t('login.loading') : currentAccount ? 
                    (isLogin ? t('login.loginWithSui') : t('login.registerWithSui')) : 
                    t('login.connectWallet')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
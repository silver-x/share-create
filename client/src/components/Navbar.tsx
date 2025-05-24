'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell, faSignOutAlt, faShareAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { userApi } from '@/api';
import { User } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

// 默认头像配置
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  // 获取默认头像
  const getDefaultAvatar = (username: string) => {
    return `${DEFAULT_AVATAR}${encodeURIComponent(username || 'default')}`;
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const response = await userApi.getProfile();
      if (response.data) {
        setUser(response.data);
      } else {
        console.error('获取用户信息失败: 响应数据格式错误');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // 添加用户状态变化事件监听器
    const handleUserStateChange = (event: CustomEvent<{ user: User }>) => {
      console.log('收到的事件数据:', event.detail); // 调试日志
      if (event.detail && event.detail.user) {
        setUser(event.detail.user);
        setLoading(false);
      } else {
        console.error('事件数据格式错误:', event.detail);
        checkAuth(); // 如果事件数据有问题，重新检查认证状态
      }
    };

    // 添加storage事件监听器，用于处理其他标签页的登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('userStateChanged', handleUserStateChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userStateChanged', handleUserStateChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleRegisterClick = () => {
    router.push('/login?mode=register');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">{t('nav.siteName')}</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link 
                href="/shares" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/shares') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t('nav.shareList')}
              </Link>
              {user && (
                <Link 
                  href="/create" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/create') 
                      ? 'border-blue-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {t('nav.createShare')}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 语言切换按钮 - 始终显示 */}
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <FontAwesomeIcon icon={faGlobe} className="w-5 h-5" />
              <span className="ml-1 text-sm">{language === 'zh' ? 'EN' : '中'}</span>
            </button>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
                      {t('nav.publishShare')}
                    </Link>

                    <Link
                      href="/notifications"
                      className="relative p-2 text-gray-600 hover:text-gray-900"
                    >
                      <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                      {/* 如果有未读通知，显示红点 */}
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                      >
                        <img
                          src={user?.avatar || getDefaultAvatar(user?.username)}
                          alt={user?.username || '用户头像'}
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="text-sm font-medium">{user?.username}</span>
                      </button>

                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-2 text-gray-500" />
                              {t('nav.profile')}
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-2 text-gray-500" />
                              {t('nav.logout')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLoginClick}
                      className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg shadow-sm hover:shadow"
                    >
                      {t('nav.login')}
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className="text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-colors px-4 py-2 rounded-lg shadow-sm hover:shadow"
                    >
                      {t('nav.register')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 
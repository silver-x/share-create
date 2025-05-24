'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('home.welcome.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('home.welcome.subtitle')}
          </p>
        </div>

        {/* 功能模块网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 创建分享 */}
          <Link href="/create" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faPlus} className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('home.features.create.title')}
                </h2>
                <p className="text-gray-600">
                  {t('home.features.create.description')}
                </p>
              </div>
            </div>
          </Link>

          {/* 浏览分享 */}
          <Link href="/shares" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faList} className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('home.features.browse.title')}
                </h2>
                <p className="text-gray-600">
                  {t('home.features.browse.description')}
                </p>
              </div>
            </div>
          </Link>

          {/* 个人中心 */}
          <Link href="/profile" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('home.features.profile.title')}
                </h2>
                <p className="text-gray-600">
                  {t('home.features.profile.description')}
                </p>
              </div>
            </div>
          </Link>

          {/* 消息通知 */}
          <Link href="/notifications" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FontAwesomeIcon icon={faBell} className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('home.features.notifications.title')}
                </h2>
                <p className="text-gray-600">
                  {t('home.features.notifications.description')}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
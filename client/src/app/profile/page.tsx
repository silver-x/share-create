'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faEdit, faTrash, faClock } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { userApi, shareApi } from '@/api';
import { User, Share } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Profile() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getProfile();
      if (response?.data) {
        setUser(response.data);
        fetchUserShares();
      }
    } catch (err) {
      console.error('获取个人资料失败:', err);
      setError(t('profile.error.load'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShares = async () => {
    if (!user?.id) return;
    
    try {
      const response = await shareApi.getList({ search: `user:${user.id}` });
      const items = response?.data || [];
      setShares(items);
    } catch (err) {
      console.error('获取分享列表失败:', err);
      setError(t('profile.error.load'));
      setShares([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleViewShare = (shareId: string) => {
    router.push(`/shares/${shareId}`);
  };

  const handleEditShare = (shareId: string) => {
    router.push(`/shares/${shareId}/edit`);
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      await shareApi.delete(shareId);
      setShares(shares.filter(share => share.id !== shareId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('删除分享失败:', err);
      setError(t('profile.error.delete'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
            {error || t('profile.error.load')}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* 个人资料 */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.username}
                className="w-20 h-20 rounded-full"
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              {/* <button
                onClick={() => router.push('/profile/edit')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {t('profile.edit')}
              </button> */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('profile.logout')}
              </button>
            </div>
          </div>

          {/* 我的分享 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('profile.myShares')}
            </h2>
            
            {shares.length > 0 ? (
              <div className="space-y-6">
                {shares.map((share) => (
                  <div 
                    key={share.id} 
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 
                          className="text-lg font-medium text-gray-800 mb-2 hover:text-blue-600 cursor-pointer"
                          onClick={() => handleViewShare(share.id)}
                        >
                          {share.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-1" />
                          <span>{new Date(share.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditShare(share.id)}
                          className="p-2 text-gray-600 hover:text-blue-600"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(share.id)}
                          className="p-2 text-gray-600 hover:text-red-600"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{share.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('profile.noShares')}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 删除确认对话框 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('profile.deleteConfirm.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('profile.deleteConfirm.message')}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('profile.deleteConfirm.cancel')}
              </button>
              <button
                onClick={() => handleDeleteShare(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {t('profile.deleteConfirm.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 
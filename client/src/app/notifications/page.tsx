'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHeart, faComment, faCog, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { notificationApi } from '@/api';
import { Notification } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationApi.getList();
      if (response?.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('获取通知失败:', err);
      setError(t('notification.error.load'));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('标记全部已读失败:', err);
      setError(t('notification.error.markRead'));
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('标记已读失败:', err);
      setError(t('notification.error.markRead'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('删除通知失败:', err);
      setError(t('notification.error.delete'));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <FontAwesomeIcon icon={faHeart} className="text-red-500" />;
      case 'comment':
        return <FontAwesomeIcon icon={faComment} className="text-blue-500" />;
      case 'system':
        return <FontAwesomeIcon icon={faCog} className="text-gray-500" />;
      default:
        return <FontAwesomeIcon icon={faBell} className="text-gray-500" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('notification.timeAgo').replace('{time}', `${diffInSeconds}秒`);
    } else if (diffInSeconds < 3600) {
      return t('notification.timeAgo').replace('{time}', `${Math.floor(diffInSeconds / 60)}分钟`);
    } else if (diffInSeconds < 86400) {
      return t('notification.timeAgo').replace('{time}', `${Math.floor(diffInSeconds / 3600)}小时`);
    } else {
      return t('notification.timeAgo').replace('{time}', `${Math.floor(diffInSeconds / 86400)}天`);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('notification.title')}</h1>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('notification.markAllRead')}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t('notification.all')}
            </button>
            <button
              onClick={() => setActiveTab('like')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'like'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t('notification.like')}
            </button>
            <button
              onClick={() => setActiveTab('comment')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'comment'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t('notification.comment')}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'system'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t('notification.system')}
            </button>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faBell} className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">{t('notification.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <p className="text-gray-900">{notification.content}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="p-2 text-gray-600 hover:text-blue-600"
                          title={t('notification.markRead')}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title={t('notification.delete')}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 
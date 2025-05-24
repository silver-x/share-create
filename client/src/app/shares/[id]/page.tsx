'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faShare, faUser, faClock, faReply } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { shareApi, commentApi, likeApi } from '@/api';
import { Share, Comment } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageParams {
  id: string;
}

// 默认头像配置
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

export default function ShareDetail({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { t } = useLanguage();
  const [share, setShare] = useState<Share | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取默认头像
  const getDefaultAvatar = (username: string) => {
    return `${DEFAULT_AVATAR}${encodeURIComponent(username || 'default')}`;
  };

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchShareDetail();
      fetchComments();
      checkLikeStatus();
    }
  }, [resolvedParams?.id]);

  const fetchShareDetail = async () => {
    if (!resolvedParams?.id) return;
    try {
      const response = await shareApi.getById(resolvedParams.id);
      console.log("response?.data => " + JSON.stringify(response?.data));
      setShare(response?.data);
    } catch (err) {
      console.error('获取分享详情失败:', err);
      setError(t('shareDetail.error.load'));
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!resolvedParams?.id) return;
    try {
      const response = await commentApi.getByShareId(resolvedParams.id);
      if (response?.data) {
        setComments(response.data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('获取评论失败:', err);
      setComments([]);
    }
  };

  const checkLikeStatus = async () => {
    if (!resolvedParams?.id) return;
    try {
      const response = await likeApi.check(resolvedParams.id);
      setLiked(response?.data?.data?.liked || false);
    } catch (err) {
      console.error('检查点赞状态失败:', err);
      setLiked(false);
    }
  };

  const handleLike = async () => {
    if (!resolvedParams?.id) return;
    try {
      if (liked) {
        await shareApi.unlike(resolvedParams.id);
        setShare(prev => prev ? { ...prev, likes: prev.likes - 1 } : null);
      } else {
        await shareApi.like(resolvedParams.id);
        setShare(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
      setLiked(!liked);
    } catch (err) {
      console.error('操作失败:', err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !resolvedParams?.id) return;

    try {
      const response = await commentApi.create(resolvedParams.id, {
        content: comment
      });
      if (response?.data?.data) {
        const newComment = response.data.data;
        setComments(prevComments => [newComment, ...prevComments]);
        setComment('');
        setReplyTo(null);
        // 更新分享的评论数
        setShare(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
      }
    } catch (err) {
      console.error('发表评论失败:', err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: share?.title || t('shareDetail.title'),
        text: share?.content || '',
        url: window.location.href
      });
    } catch (err) {
      console.log('分享失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
            {error || t('shareDetail.error.load')}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 分享内容 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <img
              src={share?.user?.avatar || getDefaultAvatar(share?.user?.username)}
              alt={`${share?.user?.username || t('shareDetail.author')}的头像`}
              className="w-12 h-12 rounded-full"
            />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{share?.user?.username || t('shareDetail.author')}</h2>
              <div className="flex items-center text-sm text-gray-500">
                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-1" />
                <span>{share?.createdAt ? new Date(share.createdAt).toLocaleString() : t('shareDetail.publishTime')}</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{share?.title || t('share.title')}</h1>
          
          <div className="prose max-w-none mb-6">
            <p className="text-gray-600 whitespace-pre-wrap">{share?.content || t('share.content')}</p>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
              <span>{share?.likes || 0}</span>
            </button>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faComment} className="w-5 h-5" />
              {/* <span>{share?.comments || 0}</span> */}
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 hover:text-blue-500"
            >
              <FontAwesomeIcon icon={faShare} className="w-5 h-5" />
              <span>{t('share.view')}</span>
            </button>
          </div>
        </div>

        {/* 评论区 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('shareDetail.comments.title')} ({comments.length})</h3>
          
          {/* 评论输入框 */}
          <form onSubmit={handleComment} className="mb-8">
            <div className="flex items-start space-x-4">
              <img
                src={share?.user?.avatar || getDefaultAvatar(share?.user?.username)}
                alt={t('shareDetail.author')}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                {replyTo && (
                  <div className="mb-2 text-sm text-gray-500">
                    {t('shareDetail.comments.reply')} <span className="font-medium">{t('shareDetail.author')}</span>
                    <button 
                      onClick={() => setReplyTo(null)}
                      className="ml-2 text-blue-500 hover:text-blue-600"
                    >
                      {t('shareDetail.comments.cancel')}
                    </button>
                  </div>
                )}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={replyTo ? t('shareDetail.comments.placeholder') : t('shareDetail.comments.placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {replyTo ? t('shareDetail.comments.submit') : t('shareDetail.comments.submit')}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* 评论列表 */}
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex space-x-4">
                <img
                  src={comment?.author?.avatar || getDefaultAvatar(comment?.author?.username)}
                  alt={`${comment?.author?.username || t('shareDetail.author')}的头像`}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{comment?.author?.username || t('shareDetail.author')}</h4>
                    <span className="text-sm text-gray-500">
                      {comment?.createdAt ? new Date(comment.createdAt).toLocaleString() : t('shareDetail.publishTime')}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">{comment?.content || t('share.content')}</p>
                  {/* <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <button 
                      onClick={() => setReplyTo(comment.id)}
                      className="flex items-center space-x-1 hover:text-blue-500"
                    >
                      <FontAwesomeIcon icon={faReply} className="w-4 h-4" />
                      <span>{t('shareDetail.comments.reply')}</span>
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
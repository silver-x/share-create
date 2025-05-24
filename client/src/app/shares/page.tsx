'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSort, faThumbsUp, faComment } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { shareApi } from '@/api';
import { Share } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Shares() {
  const router = useRouter();
  const { t } = useLanguage();
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');

  useEffect(() => {
    fetchShares();
  }, [page, search, sort]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shareApi.getList({
        page,
        limit: 10,
        search,
        sort,
      });

      // 兼容处理：检查数据结构
      const data = response.data;
      if (data) {
        // 如果返回的是数组，直接使用
        if (Array.isArray(data)) {
          setShares(data);
          setTotalPages(Math.ceil(data.length / 10));
        }
        // 如果返回的是分页对象
        else if (data.items && Array.isArray(data.items)) {
          setShares(data.items);
          setTotalPages(data.totalPages || Math.ceil(data.total / 10));
        }
        // 如果返回的是单个对象，转换为数组
        else if (typeof data === 'object') {
          setShares([data]);
          setTotalPages(1);
        }
        // 如果数据结构完全不符合预期
        else {
          setShares([]);
          setTotalPages(1);
        }
      } else {
        setShares([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('获取分享列表失败:', err);
      setError('获取分享列表失败，请稍后重试');
      setShares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchShares();
  };

  const handleSort = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和排序 */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <form onSubmit={handleSearch} className="w-full sm:w-96">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('share.search.placeholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                    fetchShares();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {t('share.search.clear')}
                </button>
              )}
            </div>
          </form>

          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faSort} className="text-gray-400" />
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="latest">{t('share.search.filters.sort.latest')}</option>
              <option value="popular">{t('share.search.filters.sort.popular')}</option>
              <option value="comments">{t('share.search.filters.sort.comments')}</option>
            </select>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 分享列表 */}
            {shares.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/shares/${share.id}`)}
                  >
                    {share.coverImage && (
                      <img
                        src={share.coverImage}
                        alt={share.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {share.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {share.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
                            {share.likes || 0}
                          </span>
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faComment} className="mr-1" />
                            {share.comments || 0}
                          </span>
                        </div>
                        <span>{new Date(share.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('share.search.noResults')}</p>
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="px-3 py-1 text-gray-700">
                    {t('common.pageInfo', { current: page, total: totalPages })}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
} 
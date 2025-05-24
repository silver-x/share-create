'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faListUl, faLink, faImage, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { shareApi, userApi } from '@/api';
import { CreateShareDto } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateShare() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateShareDto>({
    title: '',
    content: '',
  });
  const { t } = useLanguage();

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?from=/create');
        return;
      }

      try {
        // 验证token是否有效
        await userApi.getProfile();
      } catch (err) {
        console.error('验证登录状态失败:', err);
        localStorage.removeItem('token');
        router.push('/login?from=/create');
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError(t('create.form.title.required'));
      return;
    }
    
    if (!formData.content.trim()) {
      setError(t('create.form.content.required'));
      return;
    }

    if (!formData.tags?.trim()) {
      setError(t('create.form.tags.required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await shareApi.create(formData);
      router.push('/shares');
    } catch (err) {
      setError(t('create.error.create'));
      console.error('创建分享失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {t('create.title')}
          </h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 标题输入 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('create.form.title.label')}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('create.form.title.placeholder')}
              />
            </div>

            {/* 封面图片上传 - 暂时注释掉
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">封面图片</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="text-gray-400 text-3xl" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>上传图片</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">或拖拽图片到此处</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF 最大 10MB</p>
                </div>
              </div>
            </div>
            */}

            {/* 内容输入 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                {t('create.form.content.label')}
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('create.form.content.placeholder')}
              />
            </div>

            {/* 工具栏 */}
            {/* <div className="flex items-center space-x-2 border-t border-gray-200 pt-4">
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <FontAwesomeIcon icon={faBold} />
              </button>
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <FontAwesomeIcon icon={faItalic} />
              </button>
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <FontAwesomeIcon icon={faListUl} />
              </button>
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <FontAwesomeIcon icon={faLink} />
              </button>
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <FontAwesomeIcon icon={faImage} />
              </button>
            </div> */}

            {/* 标签 */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                {t('create.form.tags.label')}
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('create.form.tags.placeholder')}
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('create.form.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('create.form.submit')}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
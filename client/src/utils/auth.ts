// 初始化认证状态
export const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // 将token添加到所有请求的header中
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      if (init) {
        init.headers = {
          ...init.headers,
          'Authorization': `Bearer ${token}`
        };
      } else {
        init = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
      }
      return originalFetch(input, init);
    };
  }
}; 
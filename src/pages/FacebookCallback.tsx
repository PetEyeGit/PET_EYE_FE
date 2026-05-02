import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export default function FacebookCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserSession } = useAuth();
  const [error, setError] = useState('');

  const hasCalled = React.useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code || hasCalled.current) return;

    hasCalled.current = true;

    const verifyFacebook = async () => {
      try {
        const apiClient = (await import('../services/apiClient')).default;
        const response = await apiClient.post<any>('/auth/facebook', { code });
        const { token: jwtToken, authenticated } = response.data.result;
        if (!authenticated) throw new Error('Facebook auth failed');
        const { authService } = await import('../services/auth.service');
        const userData = authService._decodeAndCreateUser(jwtToken);
        setUserSession(userData);
        if (userData.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'SHOP_OWNER') {
          navigate('/shop/dashboard');
        } else if (userData.role === 'STAFF') {
          navigate('/staff/dashboard');
        } else {
          navigate('/home');
        }
      } catch (err) {
        console.error(err);
        setError('Đăng nhập Facebook thất bại');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    verifyFacebook();
  }, [searchParams, navigate, setUserSession]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      {error ? (
        <div className="text-red-500 font-semibold">{error} (Đang chuyển về trang đăng nhập...)</div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Đang xử lý đăng nhập Facebook...</p>
        </div>
      )}
    </div>
  );
}

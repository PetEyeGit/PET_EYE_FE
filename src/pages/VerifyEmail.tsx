import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, RefreshCw } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // email + password passed from Register page
  const email: string = location.state?.email ?? '';
  const password: string = location.state?.password ?? '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.verifyEmail(email, code);
      toast.success('Xác thực email thành công!');
      // Auto login after verify
      if (password) {
        await login(email, password);
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 6002) setError('OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.');
      else if (code === 6003) {
        toast.success('Email đã được xác thực. Đang đăng nhập...');
        if (password) {
          await login(email, password);
          navigate('/home', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } else setError('Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification(email);
      toast.success('Đã gửi lại OTP về email của bạn');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputs.current[0]?.focus();
    } catch {
      toast.error('Gửi lại OTP thất bại. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Xác thực email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm">
            Chúng tôi đã gửi mã OTP 6 chữ số đến
            <br />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900'}
                focus:border-primary focus:ring-2 focus:ring-primary/20
                text-slate-900 dark:text-white`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 mb-4"
        >
          {loading ? 'Đang xác thực...' : 'Xác thực'}
        </button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-slate-500">
              Gửi lại OTP sau <span className="font-semibold text-primary">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-2 mx-auto text-sm font-semibold text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Đang gửi...' : 'Gửi lại OTP'}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          OTP có hiệu lực trong 10 phút
        </p>
      </motion.div>
    </div>
  );
}

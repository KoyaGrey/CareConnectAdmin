import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPendingAdmin } from '../utils/firestoreService';

function VerifyAdmin() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !token.trim()) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    let cancelled = false;
    verifyPendingAdmin(token.trim())
      .then(({ name }) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(`Your admin account has been verified. You can now log in.`);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
      });

    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="px-4 py-16 text-center max-w-md mx-auto">
      <h1 className="text-white text-2xl font-bold mb-6">
        {status === 'loading' && 'Verifying your email...'}
        {status === 'success' && 'Account verified'}
        {status === 'error' && 'Verification failed'}
      </h1>

      {status === 'loading' && (
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {status === 'success' && (
        <>
          <p className="text-white/90 text-lg mb-6">{message}</p>
          <Link
            to="/tab/login"
            className="inline-block bg-white text-[#143F81] font-bold text-lg px-8 py-3 rounded-xl hover:bg-gray-100"
          >
            Go to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <p className="text-white/90 text-lg mb-6">{message}</p>
          <Link
            to="/tab/login"
            className="inline-block bg-white/20 text-white font-semibold text-lg px-8 py-3 rounded-xl hover:bg-white/30"
          >
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}

export default VerifyAdmin;

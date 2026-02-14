import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPendingAdmin } from '../utils/firestoreService';

function VerifyAdmin() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const verificationStarted = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!token || !token.trim()) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return () => { isMountedRef.current = false; };
    }

    // Prevent double execution (e.g. React Strict Mode or double-mount) so we don't create two admins
    if (verificationStarted.current) {
      return () => { isMountedRef.current = false; };
    }
    verificationStarted.current = true;

    const LOADING_TIMEOUT_MS = 15000; // 15 seconds

    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;
      setStatus('error');
      setMessage('Verification is taking longer than usual. Your account may already be verified — try logging in. If not, please try the link again or contact the superadmin.');
      verificationStarted.current = false;
    }, LOADING_TIMEOUT_MS);

    verifyPendingAdmin(token.trim())
      .then(({ name }) => {
        if (!isMountedRef.current) return;
        clearTimeout(timeoutId);
        setStatus('success');
        setMessage(`Your admin account has been verified. You can now log in.`);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        clearTimeout(timeoutId);
        verificationStarted.current = false; // Allow retry on error
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
      });

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
    };
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { authApi } from '../services/api';

export const ConfirmPage: React.FC = () => {
  const { token: tokenParam } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || tokenParam;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      authApi.confirm(token)
        .then(() => {
          setStatus('success');
          setMessage('Your account has been confirmed successfully!');
        })
        .catch((error) => {
          setStatus('error');
          setMessage(error.response?.data?.error || 'Confirmation failed');
        });
    } else {
      setStatus('error');
      setMessage('Invalid confirmation link');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirming your account...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Confirmed!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => navigate('/login', { replace: true })}>
              Go to Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => navigate('/register', { replace: true })}>
              Go to Register
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};


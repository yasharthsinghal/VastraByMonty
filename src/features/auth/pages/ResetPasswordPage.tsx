import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Breadcrumb } from '../../../shared/components/ui/Breadcrumb';
import { useToast } from '../../../shared/providers/ToastProvider';
import { AlertCircle } from 'lucide-react';
import { shopifyCustomerService } from '../../../services/adapters/shopify/shopifyCustomerService';
import { shopifyAuthService } from '../services/auth.service';
import { env } from '../../../config/env';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Shopify sends the reset URL as a query parameter:
  // /reset-password?url=https%3A%2F%2F47751d.myshopify.com%2Faccount%2Freset%2FXXX%2FYYY
  const resetUrl = searchParams.get('url');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resetUrl) {
      setErrorMsg('Invalid or missing password reset link. Please request a new one.');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('Password must be at least 5 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (env.apiProvider === 'shopify') {
        const token = await shopifyCustomerService.resetPasswordByUrl(resetUrl, password);
        // Auto-login with the returned token
        shopifyAuthService.saveToken(token.accessToken, token.expiresAt, true);
      }
      success('Password Updated', 'Your password has been reset. You are now signed in.');
      navigate('/account', { replace: true });
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Failed to reset password. The link may have expired.';
      setErrorMsg(msg);
      error('Reset Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>New Password — MONTS</title>
      </Helmet>

      <div className="max-w-md mx-auto px-6 py-12 flex flex-col gap-6">
        <Breadcrumb items={[{ label: 'Reset Password' }]} />

        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary">Set New Password</h1>
          <p className="text-xs text-slate-500 mt-1">Please enter your new password below.</p>
        </div>

        {!resetUrl && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              No reset token found in URL. Please click the link in your reset email or{' '}
              <a href="/forgot-password" className="font-semibold underline">
                request a new one
              </a>
              .
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            placeholder="At least 5 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!resetUrl}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!resetUrl}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={loading}
            disabled={!resetUrl}
          >
            Save Password
          </Button>
        </form>
      </div>
    </>
  );
};

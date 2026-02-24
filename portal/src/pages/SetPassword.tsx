import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { updateTeamLeaderPassword, markPasswordSet } from '../lib/supabaseApi';

import { updateManagerUserViaRpc } from '../lib/supabaseApi';

export interface SetPasswordProps {
  userId: string;
  userName: string;
  onPasswordSet: () => void;
  isManager?: boolean;
}

const SetPassword = ({ userId, userName, onPasswordSet, isManager }: SetPasswordProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check for at least one uppercase, one lowercase, one number
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isManager) {
        await updateManagerUserViaRpc({ userId, email: '', password });
        // Optionally, mark must_set_password false for manager in DB if needed
      } else {
        await updateTeamLeaderPassword(password);
        await markPasswordSet(userId);
      }
      onPasswordSet();
    } catch (err: any) {
      setError(err?.message || 'Failed to set password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="elite-glass p-8 sm:p-12 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full bg-brand/5 border border-brand/20 flex items-center justify-center text-brand mb-6 shadow-brand">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: '#1A1208' }}>Set Your Password</h1>
          <p className="text-sm text-center" style={{ color: '#8B7D6B' }}>
            Welcome, <span className="text-brand font-semibold">{userName}</span>!
            <br />Please set a new password for your account.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-medium pl-1 block" style={{ color: '#8B7D6B' }}>New Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#B8A890' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl py-4 pl-14 pr-14 focus:ring-2 focus:ring-brand/50 outline-none transition-all font-medium"
                style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.08)', color: '#1A1208' }}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors hover:text-brand"
                style={{ color: '#B8A890' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium pl-1 block" style={{ color: '#8B7D6B' }}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#B8A890' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl py-4 pl-14 pr-14 focus:ring-2 focus:ring-brand/50 outline-none transition-all font-medium"
                style={{ background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.08)', color: '#1A1208' }}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors hover:text-brand"
                style={{ color: '#B8A890' }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-xs space-y-1 rounded-xl p-3" style={{ color: '#B8A890', background: 'rgba(26, 18, 8, 0.02)', border: '1px solid rgba(26, 18, 8, 0.04)' }}>
            <div className={password.length >= 8 ? 'text-emerald-600' : ''}>
              {password.length >= 8 ? '✓' : '○'} At least 8 characters
            </div>
            <div className={/[A-Z]/.test(password) ? 'text-emerald-600' : ''}>
              {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
            </div>
            <div className={/[a-z]/.test(password) ? 'text-emerald-600' : ''}>
              {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
            </div>
            <div className={/[0-9]/.test(password) ? 'text-emerald-600' : ''}>
              {/[0-9]/.test(password) ? '✓' : '○'} One number
            </div>
            <div className={password && confirmPassword && password === confirmPassword ? 'text-emerald-600' : ''}>
              {password && confirmPassword && password === confirmPassword ? '✓' : '○'} Passwords match
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-3 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-elite w-full py-5 rounded-2xl justify-center font-bold text-sm tracking-wide disabled:opacity-50"
          >
            {isSubmitting ? 'Setting Password...' : 'Set Password & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SetPassword;

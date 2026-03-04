import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function LoginView({ onLogin, onSignup, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#reset-password'
    });

    if (error) {
      alert(error.message);
    } else {
      setMessage('Password reset email sent. Please check your inbox.');
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    if (isSignup) {
      await onSignup(email, password);
    } else {
      await onLogin(email, password);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isSignup ? 'Sign Up' : 'Login'}
          </h2>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {!forgotPassword && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="***************"
              />
            </div>
          )}

          {!isSignup && !forgotPassword && (
            <div className="text-right">
              <button
                onClick={() => setForgotPassword(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {isSignup && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                By signing up, you get 1 free search. Upgrade to Pro for unlimited searches!
              </p>
            </div>
          )}

          <button
            onClick={forgotPassword ? handleForgotPassword : handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? 'Processing...' : forgotPassword ? 'Send Reset Email' : isSignup ? 'Sign Up' : 'Login'}
          </button>

          {message && (
            <p className="text-sm text-green-600 text-center mt-3">{message}</p>
          )}

          {forgotPassword && (
            <div className="text-center mt-3">
              <button
                onClick={() => { setForgotPassword(false); setMessage(''); }}
                className="text-sm text-gray-600 hover:underline"
              >
                Back to login
              </button>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

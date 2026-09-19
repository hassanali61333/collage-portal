'use client';

import { useState, useEffect } from 'react';
import { signup } from '../services/service.js'; 
import { useRouter } from 'next/navigation.js';
export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);



  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  setError('');
  setSuccess('');
  setLoading(true);

  // Validation
  if (
    !formData.name ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    setError('All fields are required');
    setLoading(false);
    return;
  }

  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    setLoading(false);
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  try {
    const response = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    console.log('Backend Response:', response.data);

    // Agar yahan pahunch gaye, matlab HTTP status 2xx hai (success: true)
    setSuccess(response.data.message || 'Signup successful!');

    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

  } catch (error) {
    console.error('Signup Error:', error);

    // Backend ne error status (400/409/500) ke saath message bheja
    const message =
      error.response?.data?.message ||
      'Something went wrong. Please try again.';

    setError(message);

  } finally {
    setLoading(false);
  }
};

const router = useRouter();


  return (
    <div>
      
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* --- Header --- */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-4xl mb-4 shadow-lg shadow-indigo-500/30">
              ✨
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-500 mt-2">Abdullah Model College</p>
          </div>

          {/* --- Messages --- */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <span className="text-green-500 text-xl">✅</span>
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <span className="text-red-500 text-xl">❌</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* --- Form --- */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-xl">👤</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-xl">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-xl">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                  placeholder="Minimum 6 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-xl">🔐</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                  placeholder="Re-enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-lg transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating Account...
                </span>
              ) : (
                'Create Account 🚀'
              )}
            </button>
          </form>

          {/* --- Footer --- */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
              onClick={() => router.push('/login')}
                type="button" 
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
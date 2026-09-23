'use client';

import { useState } from 'react';
import { login } from '../services/service.js';
import { useRouter } from 'next/navigation';

import { useDispatch } from "react-redux";
import { loginUser } from "../redux/authSlice.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);

      const userData = response.data.data;
      console.log(userData);
      // Redux mein complete object save
      dispatch(loginUser(userData));

      localStorage.setItem("user", JSON.stringify(userData));

      alert(response?.data?.message || "Login successful");

      if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else if (userData.isFormFill === true) {
        router.push("/userDashboard");
      } else {
        router.push("/admissionform");
      }

    } catch (error) {
      console.log('Login Error:', error);
      const message =
        error.response?.data?.message || 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-200 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-300">
        <div className="flex flex-col md:flex-row">

          {/* LEFT PANEL – black background, white text */}
          <div className="md:w-2/5 bg-neutral-900 text-white p-8 md:p-10 flex flex-col items-center justify-center text-center relative">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_30%,white,transparent_70%)]"></div>

            <div className="relative z-10">
              {/* Small logo mark */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/30">
                  <span className="text-lg">⬤</span>
                </div>
                <span className="text-sm font-semibold tracking-wider uppercase text-white/70">
                  Dopetls
                </span>
              </div>

              <h2 className="text-3xl font-extrabold mb-3 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-sm text-white/70 max-w-xs mb-8 leading-relaxed">
                To keep connected with us please login with your personal info
              </p>

              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="px-10 py-3 rounded-full border-2 border-white text-white font-semibold text-sm uppercase tracking-wide hover:bg-white hover:text-neutral-900 transition-colors duration-200"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* RIGHT PANEL – white with black text, login form */}
          <div className="md:w-3/5 bg-white p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-900">Sign In</h1>

              {/* Social icon placeholders (f, G+, in) */}
              <div className="flex justify-center gap-4 mt-5">
                <button className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition">
                  <span className="font-bold text-sm">f</span>
                </button>
                <button className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition">
                  <span className="font-bold text-sm">G+</span>
                </button>
                <button className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition">
                  <span className="font-bold text-sm">in</span>
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-4 uppercase tracking-wider">
                or use your email account
              </p>
            </div>

            {/* Error message – restyled B&W */}
            {error && (
              <div className="mb-4 p-3 bg-neutral-100 border-l-4 border-neutral-900 text-neutral-800 rounded flex items-start gap-2 text-sm">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form – same fields, same handlers, B&W styling */}
      <form onSubmit={handleSubmit} className="space-y-5 px-[5%] sm:px-[8%] md:px-[10%] lg:px-[12%] xl:px-[15%]">
              {/* Email */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg">
                  ✉️
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 transition"
                  placeholder="Email"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 transition"
                  placeholder="Password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Submit – black pill button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition duration-200 shadow-md mt-6 ${
                  loading
                    ? 'bg-neutral-400 cursor-not-allowed text-white'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Logging in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-neutral-500">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="font-semibold text-neutral-900 hover:underline transition ml-1"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { isEmailRegistered } from '../services/firestoreService';
import { Building2, LogIn, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Security Check: Validate email against registered shops & admin accounts
      const check = await isEmailRegistered(cleanEmail);
      if (!check.registered) {
        setError('This email is not registered to any shop.');
        setLoading(false);
        return;
      }

      // 2. Attempt Authentication
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        onLogin(cred.user);
      } catch (err) {
        console.error('Firebase Auth Error:', err.code, err.message);

        if (
          err.code === 'auth/unauthorized-domain' ||
          err.message?.includes('unauthorized domain') ||
          err.message?.includes('unauthorized-domain')
        ) {
          setError('Firebase Domain Authorization Error: Please add "hisabkitab.online" to Authorized Domains in your Firebase Console (Authentication -> Settings -> Authorized Domains).');
        } else if (err.code === 'auth/user-not-found') {
          try {
            const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            onLogin(cred.user);
          } catch (createErr) {
            if (
              createErr.code === 'auth/unauthorized-domain' ||
              createErr.message?.includes('unauthorized domain')
            ) {
              setError('Firebase Domain Authorization Error: Please add "hisabkitab.online" to Authorized Domains in your Firebase Console.');
            } else {
              setError('Login failed. Please check your password or credentials.');
            }
          }
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Wrong password. Please try again.');
        } else {
          setError(err.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (checkErr) {
      console.error('Email registration check failed:', checkErr);
      setError('Error verifying account credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-xl shadow-indigo-500/30 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Hissab<span className="text-indigo-600">Kitab</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Business Khata — Cloud Edition</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Sign In to Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@hissabkitab.pk"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing In...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1">First Time Login?</p>
            <p className="text-xs text-amber-700">
              Pehli baar email aur password enter karo — account automatically ban jaye ga.
            </p>
          
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Hissab Kitab SaaS Platform &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

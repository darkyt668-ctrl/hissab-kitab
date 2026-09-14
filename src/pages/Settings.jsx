import React, { useState } from 'react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  Building, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  FileJson, 
  AlertCircle,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { exportAllData, importAllData, resetToSampleData } from '../services/storage';

export default function Settings({ profile, onSaveProfile, onRefresh }) {
  const [formData, setFormData] = useState({ ...profile });
  const [savedMsg, setSavedMsg] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Password Change state
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and Confirm password do not match.' });
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPassLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setPassMsg({ type: 'error', text: 'No active user session found. Please log in again.' });
        return;
      }

      try {
        await updatePassword(currentUser, passData.newPassword);
        setPassMsg({ type: 'success', text: 'Password updated successfully!' });
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
        if (err.code === 'auth/requires-recent-login') {
          if (!passData.currentPassword) {
            setPassMsg({ type: 'error', text: 'Please enter your current password to authorize this security update.' });
            return;
          }
          const credential = EmailAuthProvider.credential(currentUser.email, passData.currentPassword);
          await reauthenticateWithCredential(currentUser, credential);
          await updatePassword(currentUser, passData.newPassword);
          setPassMsg({ type: 'success', text: 'Password updated successfully!' });
          setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          setPassMsg({ type: 'error', text: err.message || 'Failed to update password.' });
        }
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message || 'Password update failed. Please check your credentials.' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleExport = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hissab-kitab-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importAllData(event.target.result);
      if (result.success) {
        setImportStatus({ success: true, message: 'Data restored successfully!' });
        onRefresh();
      } else {
        setImportStatus({ success: false, message: 'Invalid backup JSON file: ' + result.error });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Reset all app data to sample demo data? Your custom records will be replaced.')) {
      resetToSampleData();
      onRefresh();
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-16">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Store & System Settings</h2>
        <p className="text-xs text-slate-500">Configure your business profile, invoice headers, and manage local backups.</p>
      </div>

      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Business settings saved successfully!
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-600" />
          Business Information
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Store / Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tagline / Business Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency || 'Rs.'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shop Address (Appears on Printed Invoices)
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* EasyPaisa Payment Account Settings */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                EasyPaisa Merchant Account Details
              </h4>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                For Customer Direct Payments & QR Invoicing
              </span>
            </div>
            <p className="text-xs text-emerald-800/80">
              These details will be printed on customer invoices and shown at checkout so customers can send payments directly to your EasyPaisa account.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  EasyPaisa Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={formData.easypaisaNumber || ''}
                  onChange={(e) => setFormData({ ...formData, easypaisaNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  EasyPaisa Account Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al-Rehman Store / Muhammad Usman"
                  value={formData.easypaisaTitle || ''}
                  onChange={(e) => setFormData({ ...formData, easypaisaTitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security / Change Password Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          Security & Password Change
        </h3>
        <p className="text-xs text-slate-500">
          Update your account password for security. Works for both Shop Owners and Super Admin accounts.
        </p>

        {passMsg && (
          <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            passMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  placeholder="Current password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              {passLoading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</>
              ) : (
                <><KeyRound className="w-3.5 h-3.5" /> Update Password</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-indigo-600" />
          Backup, Export & Data Recovery
        </h3>
        <p className="text-xs text-slate-500">
          Your data is securely stored in your browser's local storage. Export a backup anytime to transfer to another device or protect against browser cache clears.
        </p>

        {importStatus && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            importStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <AlertCircle className="w-4 h-4" />
            {importStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Export JSON Backup
          </button>

          <label className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 font-bold text-xs text-indigo-700 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-indigo-600" />
            Restore From JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 font-bold text-xs text-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Reset to Sample Data
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';
import { ModernAdminDashboard } from './ModernAdminDashboard';
import { useAuth } from '../../contexts/AuthContext';

export const ModernAdminLogin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@trustmission.com',
    password: 'admin123'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await adminLogin(formData.email, formData.password);
      
      if (success) {
        setIsLoggedIn(true);
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Admin login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsLoggedIn(false);
    setFormData({ email: 'admin@trustmission.com', password: 'admin123' });
    setError('');
  };

  // Show admin dashboard if logged in
  if (isLoggedIn) {
    return <ModernAdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-orange-900/20" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Trust <span className="text-red-400">MISSION</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-red-400">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Admin Panel</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-md rounded-3xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Email">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter admin email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                required
              />
            </FormField>

            <FormField label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Security Warning */}
            <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-3">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-xs text-red-300">
                    <strong>Authorized Personnel Only:</strong> This admin panel is restricted to authorized TrustMission administrators only.
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    Demo: admin@trustmission.com / admin123
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-600/20 border border-red-500/30 rounded-xl p-3 text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              loading={loading}
              className="w-full py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              Admin Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Back to main site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';
import { useAuth } from '../../contexts/AuthContext';

interface ModernAuthFormProps {
  onLogin: (email: string, password: string) => void;
  onRegisterStart: () => void;
  onEnterpriseClick: () => void;
}

export const ModernAuthForm: React.FC<ModernAuthFormProps> = ({ 
  onLogin, 
  onRegisterStart, 
  onEnterpriseClick 
}) => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) return;

    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        onLogin(formData.email, formData.password);
      } else {
        setError('Invalid credentials or account not approved yet');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
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

  if (!isLogin) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          {/* Logo */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-2">
              Trust <span className="text-purple-400">MISSION</span>
            </h1>
          </div>

          {/* 3D Purple Swirl Image */}
          <div className="mb-16 relative">
            <div className="w-80 h-80 relative flex items-center justify-center">
              <img 
                src="/a645553e8236bb3fa318f088857d823b90c63ecb (1).png" 
                alt="3D Purple Swirl" 
                className="w-full h-full object-contain"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-2xl scale-110" />
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Answer. Earn.<br />
              Recommend.
            </h2>
            <p className="text-xl text-gray-300 max-w-md mx-auto">
              Cool missions, earnings for you
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <Button 
              onClick={onRegisterStart}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl shadow-lg shadow-purple-500/25"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              onClick={onEnterpriseClick}
              variant="secondary"
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-lg shadow-blue-500/25 text-white border-0"
            >
              <Building2 className="w-5 h-5 mr-2" />
              ENTERPRISE
            </Button>
          </div>

          {/* Login Link */}
          <div className="mt-8">
            <button
              onClick={() => setIsLogin(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Trust <span className="text-purple-400">MISSION</span>
          </h1>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-md rounded-3xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Email">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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

            {/* Account Status Notice */}
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                <p className="text-xs text-blue-300">
                  <strong>Note:</strong> Only approved accounts can login. Your account must be verified and approved by our admin team.
                </p>
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
              className="w-full py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(false)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
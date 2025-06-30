import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, EyeOff, Shield, UserPlus, Key } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';
import { supabase } from '../../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  last_sign_in_at?: string;
}

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Get admin users from auth.users table
      const { data, error } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data, created_at, last_sign_in_at')
        .in('email', ['admin@trustmission.com', 'support@trustmission.com']);

      if (error) {
        console.error('Error fetching admins:', error);
        // For demo purposes, show mock admin data
        setAdmins([
          {
            id: 'admin-1',
            email: 'admin@trustmission.com',
            first_name: 'Admin',
            last_name: 'User',
            created_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: new Date().toISOString()
          }
        ]);
      } else {
        const adminUsers = data?.map(user => ({
          id: user.id,
          email: user.email,
          first_name: user.raw_user_meta_data?.first_name || 'Admin',
          last_name: user.raw_user_meta_data?.last_name || 'User',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        })) || [];
        
        setAdmins(adminUsers);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-red-600/20 rounded-lg mr-3">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Management</h2>
            <p className="text-gray-400">Manage admin users and permissions</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
          <Button onClick={fetchAdmins} variant="secondary" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Admin User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {admin.first_name} {admin.last_name}
                        </div>
                        <div className="text-sm text-gray-400">Admin User</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {admin.last_sign_in_at 
                      ? new Date(admin.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowPasswordForm(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                    {admin.email !== 'admin@trustmission.com' && (
                      <Button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this admin?')) {
                            // In a real app, this would call an API to remove the admin
                            alert('Admin removal functionality would be implemented here');
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Admin Info */}
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Current Session</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200"><strong>Logged in as:</strong> admin@trustmission.com</p>
            <p className="text-blue-200"><strong>Role:</strong> Super Administrator</p>
          </div>
          <div>
            <p className="text-blue-200"><strong>Session started:</strong> {new Date().toLocaleString()}</p>
            <p className="text-blue-200"><strong>Permissions:</strong> Full Access</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">🔒 Security Notice</h3>
        <div className="text-sm text-yellow-200 space-y-2">
          <p>• Admin accounts have full access to all platform data and settings</p>
          <p>• Only create admin accounts for trusted team members</p>
          <p>• Regularly review admin access and remove unused accounts</p>
          <p>• Use strong passwords and enable 2FA when available</p>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddForm && (
        <AddAdminModal
          onClose={() => setShowAddForm(false)}
          onSave={() => {
            fetchAdmins();
            setShowAddForm(false);
          }}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordForm && selectedAdmin && (
        <ChangePasswordModal
          admin={selectedAdmin}
          onClose={() => {
            setShowPasswordForm(false);
            setSelectedAdmin(null);
          }}
        />
      )}
    </div>
  );
};

// Add Admin Modal Component
const AddAdminModal: React.FC<{
  onClose: () => void;
  onSave: () => void;
}> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real implementation, this would create a new admin user
      // For demo purposes, we'll just show a success message
      alert(`Admin user ${formData.email} would be created in a real implementation`);
      onSave();
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin user');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add New Admin</h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                required
              />
            </FormField>

            <FormField label="Last Name" required>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                required
              />
            </FormField>
          </div>

          <FormField label="Email" required>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@trustmission.com"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
              required
            />
          </FormField>

          <FormField label="Password" required>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Strong password"
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

          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-xs text-yellow-300">
              <strong>Note:</strong> This admin will have full access to all platform features and data.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={onClose} variant="secondary" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" loading={saving}>
              Create Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Password Modal Component
const ChangePasswordModal: React.FC<{
  admin: AdminUser;
  onClose: () => void;
}> = ({ admin, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    
    try {
      // In a real implementation, this would update the admin password
      alert(`Password for ${admin.email} would be updated in a real implementation`);
      onClose();
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Admin:</strong> {admin.first_name} {admin.last_name}
          </p>
          <p className="text-sm text-gray-400">{admin.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Current Password" required>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl pr-12"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </FormField>

          <FormField label="New Password" required>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl pr-12"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm New Password" required>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl pr-12"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </FormField>

          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3">
            <p className="text-xs text-blue-300">
              <strong>Security:</strong> Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={onClose} variant="secondary" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" loading={saving}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
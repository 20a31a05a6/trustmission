import React, { useState } from 'react';
import { Button } from '../../shared/Button';
import { Input } from '../../shared/Input';
import { FormField } from '../../shared/FormField';
import { CheckCircle, X } from 'lucide-react';

interface PersonalInfoProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, onNext }) => {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    dateOfBirth: data.dateOfBirth || '',
    email: data.email || '',
    password: data.password || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet security requirements';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="First Name" required error={errors.firstName}>
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            error={!!errors.firstName}
          />
        </FormField>

        <FormField label="Last Name" required error={errors.lastName}>
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            error={!!errors.lastName}
          />
        </FormField>
      </div>

      <FormField label="Date of Birth" required error={errors.dateOfBirth}>
        <Input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          error={!!errors.dateOfBirth}
        />
      </FormField>

      <FormField label="Email Address" required error={errors.email}>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          error={!!errors.email}
        />
      </FormField>

      <FormField label="Password" required error={errors.password}>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Create a strong password"
          error={!!errors.password}
        />
        
        {/* Password Requirements */}
        {formData.password && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <div className="space-y-1">
              {[
                { key: 'length', text: 'At least 8 characters', met: passwordRequirements.length },
                { key: 'uppercase', text: 'One uppercase letter', met: passwordRequirements.uppercase },
                { key: 'lowercase', text: 'One lowercase letter', met: passwordRequirements.lowercase },
                { key: 'number', text: 'One number', met: passwordRequirements.number },
                { key: 'special', text: 'One special character', met: passwordRequirements.special }
              ].map((req) => (
                <div key={req.key} className="flex items-center text-xs">
                  {req.met ? (
                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                  ) : (
                    <X className="w-3 h-3 text-red-500 mr-2" />
                  )}
                  <span className={req.met ? 'text-green-700' : 'text-red-700'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </FormField>

      <div className="flex justify-end">
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
};
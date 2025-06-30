import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';

export const WithdrawalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    accountHolder: user?.withdrawalDetails?.accountHolder || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    iban: user?.withdrawalDetails?.iban || '',
    bic: user?.withdrawalDetails?.bic || '',
    amount: user?.withdrawableAmount || 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    navigate('/dashboard');
    return null;
  }

  const canWithdraw = user.withdrawableAmount >= 50;

  if (!canWithdraw) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Balance</h2>
          <p className="text-gray-600 mb-6">
            You need at least €50 to request a withdrawal. Your current withdrawable amount is €{user.withdrawableAmount.toFixed(2)}.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Withdrawal Request Submitted</h2>
          <p className="text-gray-600 mb-6">
            Your withdrawal request for €{formData.amount.toFixed(2)} has been submitted and is pending admin review. 
            You will receive an email confirmation once the transfer is processed (typically 5-10 business days).
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const validateIBAN = (iban: string) => {
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    return cleanIBAN.length >= 15 && cleanIBAN.length <= 34 && /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN);
  };

  const validateBIC = (bic: string) => {
    const cleanBIC = bic.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanBIC);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Account holder name is required';
    }

    if (!formData.iban.trim()) {
      newErrors.iban = 'IBAN is required';
    } else if (!validateIBAN(formData.iban)) {
      newErrors.iban = 'Please enter a valid IBAN';
    }

    if (!formData.bic.trim()) {
      newErrors.bic = 'BIC/SWIFT code is required';
    } else if (!validateBIC(formData.bic)) {
      newErrors.bic = 'Please enter a valid BIC/SWIFT code';
    }

    if (formData.amount < 50) {
      newErrors.amount = 'Minimum withdrawal amount is €50';
    } else if (formData.amount > user.withdrawableAmount) {
      newErrors.amount = 'Amount exceeds available balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Update user with withdrawal details
      updateUser({
        withdrawalDetails: {
          accountHolder: formData.accountHolder,
          iban: formData.iban.replace(/\s/g, '').toUpperCase(),
          bic: formData.bic.replace(/\s/g, '').toUpperCase()
        }
      });

      // In a real app, this would make an API call to create the withdrawal request
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Withdrawal</h1>
            <p className="text-gray-600">Withdraw your earnings via SEPA bank transfer</p>
          </div>
        </div>

        {/* Balance Info */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Available Balance</h3>
              <p className="text-3xl font-bold text-green-600">€{user.withdrawableAmount.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Withdrawal Form */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Bank Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Account Holder Name" required error={errors.accountHolder}>
              <Input
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleInputChange}
                placeholder="Full name as it appears on your bank account"
                error={!!errors.accountHolder}
              />
            </FormField>

            <FormField label="IBAN" required error={errors.iban}>
              <Input
                name="iban"
                value={formData.iban}
                onChange={handleInputChange}
                placeholder="DE89 3704 0044 0532 0130 00"
                className="font-mono"
                error={!!errors.iban}
              />
              <p className="text-xs text-gray-500 mt-1">
                International Bank Account Number
              </p>
            </FormField>

            <FormField label="BIC/SWIFT Code" required error={errors.bic}>
              <Input
                name="bic"
                value={formData.bic}
                onChange={handleInputChange}
                placeholder="COBADEFFXXX"
                className="font-mono uppercase"
                error={!!errors.bic}
              />
              <p className="text-xs text-gray-500 mt-1">
                Bank Identifier Code
              </p>
            </FormField>

            <FormField label="Withdrawal Amount (€)" required error={errors.amount}>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="50"
                max={user.withdrawableAmount}
                step="0.01"
                error={!!errors.amount}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum €50, Maximum €{user.withdrawableAmount.toFixed(2)}
              </p>
            </FormField>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Important Information:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Processing time: 5-10 business days</li>
                <li>• No fees charged by TrustMission</li>
                <li>• Bank fees may apply depending on your bank</li>
                <li>• You'll receive email confirmation when processed</li>
                <li>• SEPA transfers only (European Union)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit Withdrawal Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
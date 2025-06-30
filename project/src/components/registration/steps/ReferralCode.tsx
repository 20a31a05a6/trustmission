import React, { useState } from 'react';
import { Button } from '../../shared/Button';
import { Input } from '../../shared/Input';
import { FormField } from '../../shared/FormField';

interface ReferralCodeProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const ReferralCode: React.FC<ReferralCodeProps> = ({ data, onNext }) => {
  const [referralCode, setReferralCode] = useState(data.referralCode || '');
  const [skipReferral, setSkipReferral] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (skipReferral) {
      onNext({ referralCode: '' });
      return;
    }

    if (!referralCode.trim()) {
      return;
    }

    onNext({ referralCode: referralCode.toUpperCase() });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Referral Code (Optional)</h3>
        <p className="text-sm text-blue-700">
          If you have a referral code from an existing member, enter it below to get connected with your referrer.
          This step is optional and you can skip it if you don't have a referral code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <input
            id="skip-referral"
            type="checkbox"
            checked={skipReferral}
            onChange={(e) => setSkipReferral(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="skip-referral" className="text-sm text-gray-700">
            I don't have a referral code (skip this step)
          </label>
        </div>

        {!skipReferral && (
          <FormField label="Referral Code">
            <Input
              value={referralCode}
              onChange={handleInputChange}
              placeholder="Enter your referral code (optional)"
              className="uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty if you don't have a referral code
            </p>
          </FormField>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">About Referral Codes</h4>
          <p className="text-sm text-gray-600">
            Referral codes help us track how users discover TrustMission and allow existing members 
            to earn rewards for successful referrals. If you don't have one, you can still proceed 
            with registration.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};
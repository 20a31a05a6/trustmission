import React, { useState } from 'react';
import { MessageCircle, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../shared/Button';
import { Input } from '../../shared/Input';
import { FormField } from '../../shared/FormField';
import { Card } from '../../shared/Card';

interface WhatsAppVerificationProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const WhatsAppVerification: React.FC<WhatsAppVerificationProps> = ({ data, onNext }) => {
  const [hasWhatsApp, setHasWhatsApp] = useState<boolean>(data.hasWhatsApp ?? true);
  const [whatsappNumber, setWhatsappNumber] = useState(data.whatsapp || '');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add + at the beginning if not present
    if (digits.length > 0 && !value.startsWith('+')) {
      return '+' + digits;
    }
    
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setWhatsappNumber(formatted);
    if (error) setError('');
  };

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  };

  const handleContinue = () => {
    if (!hasWhatsApp) {
      setError('WhatsApp is required for platform communication and support');
      return;
    }

    if (!whatsappNumber.trim()) {
      setError('Please enter your WhatsApp number');
      return;
    }

    if (!validatePhoneNumber(whatsappNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!confirmed) {
      setError('Please confirm that this number has WhatsApp installed');
      return;
    }

    onNext({ 
      hasWhatsApp, 
      whatsapp: whatsappNumber 
    });
  };

  const openWhatsAppDownload = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let url = 'https://www.whatsapp.com/download';
    
    if (/android/.test(userAgent)) {
      url = 'https://play.google.com/store/apps/details?id=com.whatsapp';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      url = 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start">
          <MessageCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900 mb-2">WhatsApp Communication</h3>
            <p className="text-sm text-green-700">
              TrustMission uses WhatsApp for platform communication, support, and mission coordination. 
              This ensures fast and reliable communication with our team.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Do you have WhatsApp installed?</h4>
          
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasWhatsApp"
                checked={hasWhatsApp === true}
                onChange={() => setHasWhatsApp(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes, I have WhatsApp</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="hasWhatsApp"
                checked={hasWhatsApp === false}
                onChange={() => setHasWhatsApp(false)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No, I don't have WhatsApp</span>
            </label>
          </div>
        </div>
      </Card>

      {hasWhatsApp === false && (
        <Card>
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
            <div>
              <h4 className="font-medium text-gray-900 mb-2">WhatsApp Required</h4>
              <p className="text-sm text-gray-600 mb-4">
                WhatsApp is required to participate in TrustMission. Please download and install WhatsApp to continue.
              </p>
              <Button onClick={openWhatsAppDownload} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Download WhatsApp
              </Button>
            </div>
          </div>
        </Card>
      )}

      {hasWhatsApp === true && (
        <div className="space-y-4">
          <FormField label="WhatsApp Number" required error={error}>
            <Input
              type="tel"
              value={whatsappNumber}
              onChange={handlePhoneChange}
              placeholder="+1234567890"
              error={!!error}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +1 for US, +49 for Germany)
            </p>
          </FormField>

          {whatsappNumber && validatePhoneNumber(whatsappNumber) && (
            <Card padding="sm">
              <div className="flex items-start space-x-3">
                <input
                  id="confirm-whatsapp"
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="confirm-whatsapp" className="text-sm text-gray-700">
                  I confirm that this phone number has WhatsApp installed and I can receive messages on it.
                </label>
              </div>
            </Card>
          )}

          {confirmed && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 text-sm">
                  Great! We'll use <strong>{whatsappNumber}</strong> to communicate with you.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={!hasWhatsApp || !whatsappNumber || !confirmed}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
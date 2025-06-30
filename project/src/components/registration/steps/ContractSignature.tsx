import React, { useState } from 'react';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { Button } from '../../shared/Button';
import { Card } from '../../shared/Card';

interface ContractSignatureProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const ContractSignature: React.FC<ContractSignatureProps> = ({ data, onNext }) => {
  const [contractRead, setContractRead] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(data.contractAccepted || false);
  const [scrolled, setScrolled] = useState(false);

  const contractText = `TRUSTMISSION PLATFORM - USER AGREEMENT

1. PLATFORM OVERVIEW
TrustMission is an educational platform that rewards users for completing learning modules and referring new members. By registering, you agree to participate in our structured learning program.

2. EARNING STRUCTURE
- Welcome Bonus: €15 upon account approval
- Quiz Completion: €7.15 per completed daily quiz (7 quizzes total)
- Referral Rewards: €20 per referred user who completes all quizzes
- Minimum withdrawal amount: €50

3. USER OBLIGATIONS
- Provide accurate personal information during registration
- Complete identity verification (KYC) with clear, valid documents
- Maintain active WhatsApp communication for platform updates
- Complete quizzes honestly and without cheating
- Use referral system responsibly and ethically

4. ACCOUNT MANAGEMENT
- All registrations require admin approval after KYC verification
- Account suspension or termination may occur for policy violations
- Earnings are tracked in real-time in your user dashboard
- Withdrawals processed via SEPA bank transfer only

5. REFERRAL PROGRAM
- Each user may refer up to the admin-defined limit
- Referral rewards unlock only after referred user completes all quizzes
- Fraudulent referral activity results in account termination

6. PRIVACY & DATA PROTECTION
- Personal data processed in accordance with GDPR
- KYC documents stored securely and encrypted
- WhatsApp number used solely for platform communication
- Data retention period: 7 years for compliance purposes

7. WITHDRAWAL TERMS
- Minimum withdrawal: €50
- Processing time: 5-10 business days
- Bank details verified before first withdrawal
- Platform reserves right to request additional verification

8. PLATFORM RULES
- One account per person/household
- No automated tools or bots permitted
- Honest participation in all learning modules required
- Respectful communication with support team mandatory

9. LIMITATION OF LIABILITY
TrustMission provides educational content and earning opportunities but does not guarantee specific income levels. Users participate at their own discretion.

10. TERMINATION
Either party may terminate this agreement with 30 days notice. Upon termination, earned but unwithdrawn funds will be processed according to standard withdrawal procedures.

By accepting this agreement, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.

Last updated: January 2024
TrustMission Platform - All Rights Reserved`;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    
    if (isScrolledToBottom && !scrolled) {
      setScrolled(true);
      setContractRead(true);
    }
  };

  const handleAcceptanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractAccepted(e.target.checked);
  };

  const handleSubmit = () => {
    if (contractAccepted && contractRead) {
      onNext({ contractAccepted: true });
    }
  };

  const downloadContract = () => {
    try {
      const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'TrustMission-User-Agreement.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading contract:', error);
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(contractText).then(() => {
        alert('Contract text copied to clipboard');
      }).catch(() => {
        alert('Unable to download. Please copy the contract text manually.');
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <FileText className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">User Agreement</h3>
            <p className="text-sm text-blue-700">
              Please read through our user agreement carefully. You must scroll to the bottom 
              and accept the terms to complete your registration.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">TrustMission User Agreement</h4>
            <Button 
              onClick={downloadContract} 
              variant="ghost" 
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div 
            className="h-64 overflow-y-auto border border-gray-200 rounded-md p-4 text-sm text-gray-700 bg-gray-50"
            onScroll={handleScroll}
          >
            <pre className="whitespace-pre-wrap font-sans">{contractText}</pre>
          </div>

          {!contractRead && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                📜 Please scroll to the bottom of the contract to continue
              </p>
            </div>
          )}

          {contractRead && (
            <div className="bg-green-50 p-3 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <p className="text-sm text-green-800">
                  Contract fully read. You may now accept the terms.
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={contractAccepted}
                onChange={handleAcceptanceChange}
                disabled={!contractRead}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <span className={`text-sm ${contractRead ? 'text-gray-700' : 'text-gray-400'}`}>
                I have read and agree to the TrustMission User Agreement. I understand the earning structure, 
                withdrawal terms, and platform rules. I confirm that all information provided during registration is accurate.
              </span>
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!contractAccepted || !contractRead}
          className={(!contractAccepted || !contractRead) ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Complete Registration
        </Button>
      </div>
    </div>
  );
};
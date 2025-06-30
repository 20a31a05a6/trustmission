import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { PersonalInfo } from './steps/PersonalInfo';
import { ReferralCode } from './steps/ReferralCode';
import { KYCVerification } from './steps/KYCVerification';
import { WhatsAppVerification } from './steps/WhatsAppVerification';
import { ContractSignature } from './steps/ContractSignature';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { useAuth } from '../../contexts/AuthContext';

interface RegistrationFlowProps {
  onBack: () => void;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: '',
    referralCode: '',
    whatsapp: '',
    hasWhatsApp: true,
    kycPhotos: {
      idFront: '',
      idBack: '',
      selfie: ''
    },
    contractAccepted: false
  });

  const { register } = useAuth();

  const steps = [
    { number: 1, title: 'Personal Information', component: PersonalInfo },
    { number: 2, title: 'Referral Code', component: ReferralCode },
    { number: 3, title: 'Identity Verification', component: KYCVerification },
    { number: 4, title: 'WhatsApp Verification', component: WhatsAppVerification },
    { number: 5, title: 'Contract Signature', component: ContractSignature }
  ];

  const handleNext = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit({ ...formData, ...stepData });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async (finalData: any) => {
    try {
      await register({
        ...finalData,
        usedReferralCode: finalData.referralCode,
        contractSigned: finalData.contractAccepted
      });
      setCompleted(true);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been created and is pending admin approval. You'll receive an email notification once your account is approved.
          </p>
          <Button onClick={onBack} className="w-full">
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registration</h1>
            <p className="text-gray-600">Step {currentStep} of {steps.length}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : step.number === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {steps[currentStep - 1].title}
          </h2>
          <CurrentStepComponent
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
          />
        </Card>
      </div>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle, Camera, Upload, MessageCircle, FileText, Download, AlertCircle, X, RotateCcw, Eye, EyeOff, Mail, Clock } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';
import { useAuth } from '../../contexts/AuthContext';

interface ModernRegistrationProps {
  onBack: () => void;
  onComplete: () => void;
}

export const ModernRegistration: React.FC<ModernRegistrationProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
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
    { number: 1, title: 'Personal Info', completed: false },
    { number: 2, title: 'Referral Code', completed: false },
    { number: 3, title: 'Identity Verification', completed: false },
    { number: 4, title: 'WhatsApp', completed: false },
    { number: 5, title: 'Contract', completed: false }
  ];

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
    setRegistrationError('');
    
    try {
      const success = await register({
        email: finalData.email,
        password: finalData.password,
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        dateOfBirth: finalData.dateOfBirth,
        whatsapp: finalData.whatsapp,
        usedReferralCode: finalData.referralCode || undefined,
        kycPhotos: finalData.kycPhotos,
        contractSigned: finalData.contractAccepted
      });

      if (success) {
        setCompleted(true);
      } else {
        // If register returns false, show a generic error
        setRegistrationError('Registration failed. Please try again or contact support if the problem persists.');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Display user-friendly error message
      if (error.message && error.message.includes('already registered')) {
        setRegistrationError(error.message);
      } else if (error.message && error.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
        setRegistrationError('This email is already registered. Please use a different email or log in.');
      } else {
        setRegistrationError('Registration failed. Please try again or contact support if the problem persists.');
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.email || !formData.password) {
          return false;
        }
        if (formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18) {
          return false;
        }
        const passwordReqs = validatePassword(formData.password);
        return Object.values(passwordReqs).every(req => req);
      case 2:
        return true; // Referral code is optional
      case 3:
        return formData.kycPhotos.idFront && formData.kycPhotos.idBack && formData.kycPhotos.selfie;
      case 4:
        return formData.hasWhatsApp && formData.whatsapp.trim() !== '';
      case 5:
        return formData.contractAccepted;
      default:
        return false;
    }
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent('TrustMission Account Activation Inquiry');
    const body = encodeURIComponent(`Hello TrustMission Team,

I have just completed my registration on the TrustMission platform and would like to inquire about my account activation status.

Registration Details:
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
- WhatsApp: ${formData.whatsapp}
- Registration Date: ${new Date().toLocaleDateString()}

Please let me know if you need any additional information to process my account activation.

Thank you for your time.

Best regards,
${formData.firstName} ${formData.lastName}`);
    
    window.open(`mailto:admin@trustmission.com?subject=${subject}&body=${body}`, '_blank');
  };

  const openWhatsAppSupport = () => {
    const message = encodeURIComponent(`Hello TrustMission Support! 

I have just completed my registration and would like to inquire about my account activation.

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Registration Date: ${new Date().toLocaleDateString()}

Please let me know the next steps for account activation.

Thank you!`);
    
    const supportNumber = '1234567890'; // Replace with actual support number
    const url = `https://wa.me/${supportNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-gray-900/50 backdrop-blur-md rounded-3xl p-8 border border-gray-800 text-center">
          {/* Success Icon */}
          <div className="flex items-center justify-center w-20 h-20 bg-green-600/20 rounded-full mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          {/* Main Message */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Registration Complete!
          </h2>
          
          <p className="text-gray-300 mb-6 text-lg">
            Thank you for joining TrustMission, {formData.firstName}!
          </p>

          {/* Status Information */}
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-blue-300">Account Pending Activation</h3>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Your account has been created and is currently pending admin approval. Our team will review your 
              KYC documents and activate your account within 24-48 hours. You'll receive an email notification 
              once your account is approved and ready to use.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Need Help or Have Questions?</h3>
            <p className="text-gray-300 text-sm mb-4">
              If you have any questions about your registration or need assistance, feel free to contact our support team:
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={openEmailClient}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl py-3"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email: admin@trustmission.com
              </Button>
              
              <Button 
                onClick={openWhatsAppSupport}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl py-3"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">What Happens Next?</h3>
            <div className="text-left space-y-2 text-sm text-purple-200">
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">1.</span>
                <span>Our admin team reviews your KYC documents</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">2.</span>
                <span>You receive email confirmation of account approval</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">3.</span>
                <span>Login to access your dashboard and start earning</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">4.</span>
                <span>Complete daily quizzes and refer friends to earn rewards</span>
              </div>
            </div>
          </div>

          {/* Return Button */}
          <Button 
            onClick={onComplete} 
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl py-3 font-semibold"
          >
            Return to Login
          </Button>

          {/* Additional Note */}
          <p className="text-xs text-gray-400 mt-4">
            Please check your email (including spam folder) for updates on your account status.
          </p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <ReferralCodeStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <KYCStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <WhatsAppStep formData={formData} setFormData={setFormData} />;
      case 5:
        return <ContractStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center mb-6 md:mb-8">
          <Button variant="ghost" onClick={handleBack} className="mr-4 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Registration</h1>
            <p className="text-gray-400 text-sm md:text-base">Step {currentStep} of 5</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm font-medium ${
                  step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : step.number === currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  step.number
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800">
            {renderStep()}
            
            {/* Registration Error */}
            {registrationError && (
              <div className="mt-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-300 mb-1">Registration Error</h3>
                    <p className="text-sm text-red-200">{registrationError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6 md:mt-8">
              <Button
                onClick={() => {
                  handleNext(formData);
                }}
                disabled={!canProceed()}
                className={`px-6 md:px-8 py-3 rounded-xl font-semibold ${
                  canProceed()
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStep === 5 ? 'Complete Registration' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Info Step Component
const PersonalInfoStep = ({ formData, setFormData }: any) => {
  const [showPassword, setShowPassword] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const passwordRequirements = validatePassword(formData.password);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="First Name" required>
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
          />
        </FormField>
        
        <FormField label="Last Name" required>
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
          />
        </FormField>
      </div>

      <FormField label="Date of Birth" required>
        <Input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
        />
        {formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 && (
          <p className="text-red-400 text-sm mt-1">You must be at least 18 years old to register</p>
        )}
      </FormField>

      <FormField label="Email Address" required>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
        />
      </FormField>

      <FormField label="Password" required>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl pr-12"
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
        
        {/* Password Requirements */}
        {formData.password && (
          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</p>
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
                    <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                  ) : (
                    <X className="w-3 h-3 text-red-400 mr-2" />
                  )}
                  <span className={req.met ? 'text-green-300' : 'text-red-300'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </FormField>
    </div>
  );
};

// Referral Code Step Component
const ReferralCodeStep = ({ formData, setFormData }: any) => {
  const [skipReferral, setSkipReferral] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({ ...prev, referralCode: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Referral Code</h2>
      
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-blue-300 mb-2">Referral Code (Optional)</h3>
        <p className="text-blue-200 text-sm">
          If you have a referral code from an existing member, enter it below to get connected with your referrer.
          This step is optional and you can skip it if you don't have a referral code.
        </p>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <input
          id="skip-referral"
          type="checkbox"
          checked={skipReferral}
          onChange={(e) => setSkipReferral(e.target.checked)}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
        />
        <label htmlFor="skip-referral" className="text-sm text-gray-300">
          I don't have a referral code (skip this step)
        </label>
      </div>

      {!skipReferral && (
        <FormField label="Referral Code">
          <Input
            value={formData.referralCode}
            onChange={handleInputChange}
            placeholder="Enter your referral code (optional)"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl uppercase"
          />
          <p className="text-xs text-gray-400 mt-1">
            Leave empty if you don't have a referral code
          </p>
        </FormField>
      )}

      <div className="bg-gray-800/50 p-4 rounded-xl">
        <h4 className="font-medium text-gray-200 mb-2">About Referral Codes</h4>
        <p className="text-sm text-gray-400">
          Referral codes help us track how users discover TrustMission and allow existing members 
          to earn rewards for successful referrals. If you don't have one, you can still proceed 
          with registration.
        </p>
      </div>
    </div>
  );
};

// KYC Step Component
const KYCStep = ({ formData, setFormData }: any) => {
  const [currentCapture, setCurrentCapture] = useState<string | null>(null);
  const [confirmingPhoto, setConfirmingPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const photoSteps = [
    { key: 'idFront', title: 'ID Card - Front Side', description: 'Take a clear photo of the front of your ID card' },
    { key: 'idBack', title: 'ID Card - Back Side', description: 'Take a clear photo of the back of your ID card' },
    { key: 'selfie', title: 'Selfie Photo', description: 'Take a clear selfie photo of yourself' }
  ];

  const startCamera = async (photoType: string) => {
    setCameraError(null);
    try {
      const constraints = {
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: photoType === 'selfie' ? 'user' : 'environment' 
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCurrentCapture(photoType);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera access denied or not available. Please use the upload option instead.');
      setCurrentCapture(null);
    }
  };

  const startFileUpload = (photoType: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.dataset.photoType = photoType;
      fileInputRef.current.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && currentCapture) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setConfirmingPhoto(photoData);
      }
    }
  };

  const confirmPhoto = () => {
    if (confirmingPhoto && currentCapture) {
      setFormData((prev: any) => ({
        ...prev,
        kycPhotos: { ...prev.kycPhotos, [currentCapture]: confirmingPhoto }
      }));
      stopCamera();
      setConfirmingPhoto(null);
      setCurrentCapture(null);
    }
  };

  const retakePhoto = () => {
    setConfirmingPhoto(null);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const photoType = event.target.dataset.photoType;
    
    if (file && photoType) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setUploadingFile(photoType);

      try {
        const compressedImage = await compressImage(file);
        setFormData((prev: any) => ({
          ...prev,
          kycPhotos: { ...prev.kycPhotos, [photoType]: compressedImage }
        }));
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
      } finally {
        setUploadingFile(null);
      }
    }
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
      delete event.target.dataset.photoType;
    }
  };

  const removePhoto = (photoType: string) => {
    setFormData((prev: any) => {
      const newKycPhotos = { ...prev.kycPhotos };
      delete newKycPhotos[photoType];
      return { ...prev, kycPhotos: newKycPhotos };
    });
  };

  const allPhotosCompleted = formData.kycPhotos.idFront && formData.kycPhotos.idBack && formData.kycPhotos.selfie;

  // Camera capture view
  if (currentCapture && !cameraError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            {photoSteps.find(step => step.key === currentCapture)?.title}
          </h3>
          <p className="text-gray-300">
            {photoSteps.find(step => step.key === currentCapture)?.description}
          </p>
        </div>

        {confirmingPhoto ? (
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-center space-y-4">
              <img 
                src={confirmingPhoto} 
                alt="Captured photo" 
                className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-600"
              />
              <div>
                <h4 className="font-medium text-white mb-2">Is this photo clear and readable?</h4>
                <p className="text-sm text-gray-300 mb-4">
                  Make sure all text is clearly visible and the image is not blurry
                </p>
                <div className="flex justify-center gap-3">
                  <Button onClick={retakePhoto} variant="secondary" className="bg-gray-700 hover:bg-gray-600">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button onClick={confirmPhoto} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="text-center space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-600"
              />
              <div className="flex justify-center gap-3">
                <Button onClick={() => { stopCamera(); setCurrentCapture(null); }} variant="secondary" className="bg-gray-700 hover:bg-gray-600">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={capturePhoto} className="bg-purple-600 hover:bg-purple-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Identity Verification</h2>
      
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-blue-300 mb-2">Identity Verification Required</h3>
        <p className="text-blue-200 text-sm">
          Please provide clear photos of your ID card and a selfie for verification. 
          This helps us maintain a secure platform for all users.
        </p>
      </div>

      {cameraError && (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-300 mb-1">Camera Access Issue</h3>
              <p className="text-sm text-yellow-200">{cameraError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {photoSteps.map((step) => (
          <div key={step.key} className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white">{step.title}</h4>
                <p className="text-sm text-gray-300">{step.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {formData.kycPhotos[step.key] ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <Button 
                      onClick={() => removePhoto(step.key)} 
                      size="sm" 
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : uploadingFile === step.key ? (
                  <div className="flex items-center text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                    <span className="text-sm">Processing...</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => startCamera(step.key)} 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={uploadingFile !== null}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                    <Button 
                      onClick={() => startFileUpload(step.key)} 
                      size="sm" 
                      variant="secondary" 
                      className="bg-gray-700 hover:bg-gray-600"
                      disabled={uploadingFile !== null}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {formData.kycPhotos[step.key] && (
              <div className="mt-3">
                <img 
                  src={formData.kycPhotos[step.key]} 
                  alt={step.title}
                  className="w-32 h-24 object-cover rounded border-2 border-green-400/50"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {allPhotosCompleted && (
        <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-300 font-medium">All verification photos completed!</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

// WhatsApp Step Component
const WhatsAppStep = ({ formData, setFormData }: any) => {
  const [confirmed, setConfirmed] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 0 && !value.startsWith('+')) {
      return '+' + digits;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev: any) => ({ ...prev, whatsapp: formatted }));
  };

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
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
      <h2 className="text-2xl font-bold mb-6 text-white">WhatsApp Verification</h2>
      
      <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-start">
          <MessageCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-300 mb-2">WhatsApp Required</h3>
            <p className="text-green-200 text-sm">
              We use WhatsApp for platform communication and support. Please confirm you have WhatsApp and provide your number.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-white font-medium mb-3">Do you have WhatsApp?</p>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasWhatsApp"
                checked={formData.hasWhatsApp === true}
                onChange={() => setFormData((prev: any) => ({ ...prev, hasWhatsApp: true }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-300">Yes, I have WhatsApp</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="hasWhatsApp"
                checked={formData.hasWhatsApp === false}
                onChange={() => setFormData((prev: any) => ({ ...prev, hasWhatsApp: false }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-300">No, I don't have WhatsApp</span>
            </label>
          </div>
        </div>

        {formData.hasWhatsApp === false && (
          <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div>
              <h4 className="font-medium text-red-300 mb-2">WhatsApp Required</h4>
              <p className="text-sm text-red-200 mb-4">
                WhatsApp is required to participate in TrustMission. Please download and install WhatsApp to continue.
              </p>
              <Button onClick={openWhatsAppDownload} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download WhatsApp
              </Button>
            </div>
          </div>
        )}

        {formData.hasWhatsApp === true && (
          <div className="space-y-4">
            <FormField label="WhatsApp Number" required>
              <Input
                type="tel"
                value={formData.whatsapp}
                onChange={handlePhoneChange}
                placeholder="+1234567890"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                Include country code (e.g., +1 for US, +49 for Germany)
              </p>
            </FormField>

            {formData.whatsapp && validatePhoneNumber(formData.whatsapp) && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <input
                    id="confirm-whatsapp"
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800"
                  />
                  <label htmlFor="confirm-whatsapp" className="text-sm text-gray-300">
                    I confirm that this phone number has WhatsApp installed and I can receive messages on it.
                  </label>
                </div>
              </div>
            )}

            {confirmed && (
              <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-green-300 text-sm">
                    Great! We'll use <strong>{formData.whatsapp}</strong> to communicate with you.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Contract Step Component
const ContractStep = ({ formData, setFormData }: any) => {
  const [contractRead, setContractRead] = useState(false);
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
      navigator.clipboard.writeText(contractText).then(() => {
        alert('Contract text copied to clipboard');
      }).catch(() => {
        alert('Unable to download. Please copy the contract text manually.');
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Electronic Contract Signature</h2>
      
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start">
          <FileText className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-300 mb-2">User Agreement</h3>
            <p className="text-sm text-blue-200">
              Please read through our user agreement carefully. You must scroll to the bottom 
              and accept the terms to complete your registration.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white">TrustMission User Agreement</h4>
          <Button 
            onClick={downloadContract} 
            variant="ghost" 
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        <div 
          className="h-64 overflow-y-auto border border-gray-600 rounded-lg p-4 text-sm text-gray-300 bg-gray-900/50"
          onScroll={handleScroll}
        >
          <pre className="whitespace-pre-wrap font-sans">{contractText}</pre>
        </div>

        {!contractRead && (
          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-300">
              📜 Please scroll to the bottom of the contract to continue
            </p>
          </div>
        )}

        {contractRead && (
          <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 mt-4">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <p className="text-sm text-green-300">
                Contract fully read. You may now accept the terms.
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-600 pt-4 mt-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.contractAccepted}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, contractAccepted: e.target.checked }))}
              disabled={!contractRead}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-800 disabled:opacity-50"
            />
            <span className={`text-sm ${contractRead ? 'text-gray-300' : 'text-gray-500'}`}>
              I have read and agree to the TrustMission User Agreement. I understand the earning structure, 
              withdrawal terms, and platform rules. I confirm that all information provided during registration is accurate.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
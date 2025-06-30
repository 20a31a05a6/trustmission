import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, X, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../../shared/Button';
import { Card } from '../../shared/Card';

interface KYCVerificationProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

interface PhotoCapture {
  idFront?: string;
  idBack?: string;
  selfie?: string;
}

export const KYCVerification: React.FC<KYCVerificationProps> = ({ data, onNext }) => {
  const [photos, setPhotos] = useState<PhotoCapture>(data.kycPhotos || {});
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
      setPhotos(prev => ({ ...prev, [currentCapture]: confirmingPhoto }));
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
        setPhotos(prev => ({ ...prev, [photoType]: compressedImage }));
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
    setPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[photoType as keyof PhotoCapture];
      return newPhotos;
    });
  };

  const handleSubmit = () => {
    if (photos.idFront && photos.idBack && photos.selfie) {
      onNext({ kycPhotos: photos });
    }
  };

  const allPhotosCompleted = photos.idFront && photos.idBack && photos.selfie;

  // Camera capture view
  if (currentCapture && !cameraError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {photoSteps.find(step => step.key === currentCapture)?.title}
          </h3>
          <p className="text-gray-600">
            {photoSteps.find(step => step.key === currentCapture)?.description}
          </p>
        </div>

        {confirmingPhoto ? (
          <Card>
            <div className="text-center space-y-4">
              <img 
                src={confirmingPhoto} 
                alt="Captured photo" 
                className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
              />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Is this photo clear and readable?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Make sure all text is clearly visible and the image is not blurry
                </p>
                <div className="flex justify-center gap-3">
                  <Button onClick={retakePhoto} variant="secondary">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button onClick={confirmPhoto} variant="success">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
              />
              <div className="flex justify-center gap-3">
                <Button onClick={() => { stopCamera(); setCurrentCapture(null); }} variant="secondary">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={capturePhoto}>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>
          </Card>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Identity Verification Required</h3>
        <p className="text-sm text-blue-700">
          Please provide clear photos of your ID card and a selfie for verification. 
          This helps us maintain a secure platform for all users.
        </p>
      </div>

      {cameraError && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900 mb-1">Camera Access Issue</h3>
              <p className="text-sm text-yellow-700">{cameraError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {photoSteps.map((step) => (
          <Card key={step.key} padding="sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {photos[step.key as keyof PhotoCapture] ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <Button 
                      onClick={() => removePhoto(step.key)} 
                      size="sm" 
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : uploadingFile === step.key ? (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm">Processing...</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => startCamera(step.key)} 
                      size="sm"
                      disabled={uploadingFile !== null}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                    <Button 
                      onClick={() => startFileUpload(step.key)} 
                      size="sm" 
                      variant="secondary"
                      disabled={uploadingFile !== null}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {photos[step.key as keyof PhotoCapture] && (
              <div className="mt-3">
                <img 
                  src={photos[step.key as keyof PhotoCapture]} 
                  alt={step.title}
                  className="w-32 h-24 object-cover rounded border-2 border-green-200"
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {allPhotosCompleted && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">All verification photos completed!</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!allPhotosCompleted || uploadingFile !== null}
          className={(!allPhotosCompleted || uploadingFile !== null) ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Continue
        </Button>
      </div>

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
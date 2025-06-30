export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  whatsapp: string;
  referralCode: string;
  usedReferralCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  kycPhotos: {
    idFront?: string;
    idBack?: string;
    selfie?: string;
  };
  contractSigned: boolean;
  welcomeBonus: number;
  quizEarnings: number;
  referralEarnings: number;
  totalBalance: number;
  withdrawableAmount: number;
  completedQuizzes: number[];
  referredUsers: string[];
  withdrawalDetails?: {
    accountHolder: string;
    iban: string;
    bic: string;
  };
  createdAt: string;
  maxReferrals?: number;
  customBalance?: number;
  balanceAdjustments?: BalanceAdjustment[];
  missionsCompleted?: boolean;
}

export interface BalanceAdjustment {
  id: string;
  amount: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
  type: 'credit' | 'debit';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  reward: number;
  unlockDay: number;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankDetails: {
    accountHolder: string;
    iban: string;
    bic: string;
  };
  requestedAt: string;
}

export interface AdminSettings {
  maxReferrals: number;
  minWithdrawal: number;
  quizReward: number;
  referralReward: number;
  welcomeBonus: number;
  completionMessage: string;
  appointmentEnabled: boolean;
  supportWhatsAppNumber: string;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userWhatsapp: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export type UserRole = 'user' | 'admin';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
}
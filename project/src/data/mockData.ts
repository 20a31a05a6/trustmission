import { User, Quiz, WithdrawalRequest, AdminSettings, Appointment } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    email: 'john@example.com',
    whatsapp: '+1234567890',
    referralCode: 'JOHN2024',
    status: 'approved',
    kycPhotos: {
      idFront: 'mock-id-front.jpg',
      idBack: 'mock-id-back.jpg',
      selfie: 'mock-selfie.jpg'
    },
    contractSigned: true,
    welcomeBonus: 15,
    quizEarnings: 50.05,
    referralEarnings: 40,
    totalBalance: 105.05,
    withdrawableAmount: 105.05,
    completedQuizzes: [1, 2, 3, 4, 5, 6, 7],
    referredUsers: ['2', '3'],
    withdrawalDetails: {
      accountHolder: 'John Doe',
      iban: 'DE89370400440532013000',
      bic: 'COBADEFFXXX'
    },
    createdAt: '2024-01-15T10:00:00Z',
    maxReferrals: 3,
    missionsCompleted: true,
    balanceAdjustments: [
      {
        id: 'adj1',
        amount: 10,
        reason: 'Bonus for excellent performance',
        adjustedBy: 'admin',
        adjustedAt: '2024-01-20T10:00:00Z',
        type: 'credit'
      }
    ]
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1992-08-22',
    email: 'jane@example.com',
    whatsapp: '+1234567891',
    referralCode: 'JANE2024',
    usedReferralCode: 'JOHN2024',
    status: 'approved',
    kycPhotos: {
      idFront: 'mock-id-front-2.jpg',
      idBack: 'mock-id-back-2.jpg',
      selfie: 'mock-selfie-2.jpg'
    },
    contractSigned: true,
    welcomeBonus: 15,
    quizEarnings: 21.45,
    referralEarnings: 0,
    totalBalance: 36.45,
    withdrawableAmount: 36.45,
    completedQuizzes: [1, 2, 3],
    referredUsers: [],
    createdAt: '2024-01-18T14:30:00Z',
    maxReferrals: 5,
    missionsCompleted: false
  },
  {
    id: '3',
    firstName: 'Alex',
    lastName: 'Johnson',
    dateOfBirth: '1988-03-10',
    email: 'alex@example.com',
    whatsapp: '+1234567892',
    referralCode: 'ALEX2024',
    usedReferralCode: 'JOHN2024',
    status: 'pending',
    kycPhotos: {
      idFront: 'mock-id-front-3.jpg',
      idBack: 'mock-id-back-3.jpg',
      selfie: 'mock-selfie-3.jpg'
    },
    contractSigned: true,
    welcomeBonus: 0,
    quizEarnings: 0,
    referralEarnings: 0,
    totalBalance: 0,
    withdrawableAmount: 0,
    completedQuizzes: [],
    referredUsers: [],
    createdAt: '2024-01-22T09:15:00Z',
    maxReferrals: 3,
    missionsCompleted: false
  }
];

export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'Digital Marketing Basics',
    description: 'Learn the fundamentals of digital marketing',
    reward: 7.15,
    unlockDay: 1,
    questions: [
      {
        id: 'q1',
        question: 'What does SEO stand for?',
        options: ['Search Engine Optimization', 'Social Engine Optimization', 'Search Engine Operation', 'Social Engine Operation'],
        correctAnswer: 0
      },
      {
        id: 'q2',
        question: 'Which platform is best for B2B marketing?',
        options: ['Instagram', 'TikTok', 'LinkedIn', 'Snapchat'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 2,
    title: 'Social Media Strategy',
    description: 'Master social media marketing techniques',
    reward: 7.15,
    unlockDay: 2,
    questions: [
      {
        id: 'q1',
        question: 'What is the best time to post on social media?',
        options: ['Early morning', 'During lunch hours', 'Evening', 'It depends on your audience'],
        correctAnswer: 3
      }
    ]
  },
  {
    id: 3,
    title: 'Content Creation',
    description: 'Create engaging content for your audience',
    reward: 7.15,
    unlockDay: 3,
    questions: [
      {
        id: 'q1',
        question: 'What makes content viral?',
        options: ['Luck', 'Timing and relevance', 'Expensive production', 'Celebrity endorsement'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 4,
    title: 'Email Marketing',
    description: 'Build effective email campaigns',
    reward: 7.15,
    unlockDay: 4,
    questions: [
      {
        id: 'q1',
        question: 'What is a good email open rate?',
        options: ['5-10%', '15-25%', '30-40%', '50-60%'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 5,
    title: 'Analytics & Metrics',
    description: 'Understand marketing analytics',
    reward: 7.15,
    unlockDay: 5,
    questions: [
      {
        id: 'q1',
        question: 'What is CTR?',
        options: ['Click Through Rate', 'Cost Through Rate', 'Customer Through Rate', 'Content Through Rate'],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 6,
    title: 'Paid Advertising',
    description: 'Learn about paid marketing channels',
    reward: 7.15,
    unlockDay: 6,
    questions: [
      {
        id: 'q1',
        question: 'What is CPC?',
        options: ['Cost Per Click', 'Cost Per Customer', 'Cost Per Campaign', 'Cost Per Conversion'],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 7,
    title: 'Marketing Automation',
    description: 'Automate your marketing processes',
    reward: 7.15,
    unlockDay: 7,
    questions: [
      {
        id: 'q1',
        question: 'What is a marketing funnel?',
        options: ['A tool for cooking', 'A customer journey visualization', 'A type of advertisement', 'A social media feature'],
        correctAnswer: 1
      }
    ]
  }
];

export const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: 'w1',
    userId: '1',
    amount: 90.75,
    status: 'pending',
    bankDetails: {
      accountHolder: 'John Doe',
      iban: 'DE89370400440532013000',
      bic: 'COBADEFFXXX'
    },
    requestedAt: '2024-01-20T10:00:00Z'
  }
];

export const adminSettings: AdminSettings = {
  maxReferrals: 3,
  minWithdrawal: 50,
  quizReward: 7.15,
  referralReward: 20,
  welcomeBonus: 15,
  completionMessage: "🎉 Congratulations! You've completed all 7 missions and earned your full rewards. To continue your journey with TrustMission and unlock additional earning opportunities, please book an appointment with our team.",
  appointmentEnabled: true,
  supportWhatsAppNumber: '+1234567890'
};

export const mockAppointments: Appointment[] = [
  {
    id: 'app1',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userWhatsapp: '+1234567890',
    preferredDate: '2024-02-01',
    preferredTime: '14:00',
    message: 'I would like to discuss additional earning opportunities after completing all missions.',
    status: 'pending',
    createdAt: '2024-01-25T10:00:00Z'
  }
];
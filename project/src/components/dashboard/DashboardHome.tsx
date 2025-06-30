import React from 'react';
import { EarningsOverview } from './EarningsOverview';
import { QuizProgress } from './QuizProgress';
import { ReferralSection } from './ReferralSection';

export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-8">
      <EarningsOverview />
      <div className="grid lg:grid-cols-2 gap-8">
        <QuizProgress />
        <ReferralSection />
      </div>
    </div>
  );
};
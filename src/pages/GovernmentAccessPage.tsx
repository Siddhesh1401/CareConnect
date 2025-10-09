import React from 'react';
import { GovernmentAccessRequestForm } from '../components/GovernmentAccessRequestForm';

const GovernmentAccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <GovernmentAccessRequestForm />
      </div>
    </div>
  );
};

export default GovernmentAccessPage;
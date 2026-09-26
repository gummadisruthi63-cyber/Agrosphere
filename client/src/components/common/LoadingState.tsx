import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading details...' }) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-slate-500">
      <div className="relative">
        <div className="w-10 h-10 border-3 border-emerald-100 rounded-full"></div>
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

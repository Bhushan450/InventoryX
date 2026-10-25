import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase().trim();

  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';

  if (['SUCCESS', 'PAID', 'COMPLETED', 'RECEIVED'].includes(normalized)) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['PENDING', 'PENDING_PAYMENT', 'PLANNED'].includes(normalized)) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['FAILED', 'CANCELLED'].includes(normalized)) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['ORDERED', 'READY'].includes(normalized)) {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  const formatText = (str: string) => {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75" />
      {formatText(normalized)}
    </span>
  );
};

export default StatusBadge;

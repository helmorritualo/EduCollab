import React from 'react';
import { DashboardWidget } from './DashboardLayout';

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  icon, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="flex items-center p-3 rounded-lg border hover:shadow-sm transition-shadow">
      {icon && (
        <div className={`mr-3 p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

interface StatsWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ title, children, className }) => {
  return (
    <DashboardWidget title={title} className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </DashboardWidget>
  );
};

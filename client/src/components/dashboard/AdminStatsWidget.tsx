import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatsWidget, StatItem } from './StatsWidget';
import { useAuth } from '../../contexts/AuthContext';

// Mock API function - you'll need to implement these endpoints on the server
const adminAPI = {
  getSystemStats: async () => {
    const response = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return await response.json();
  }
};

export const AdminStatsWidget: React.FC = () => {
  const { user, isAdmin } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminAPI.getSystemStats,
    enabled: !!user && isAdmin,
    // For demo, use placeholder data if endpoint doesn't exist yet
    placeholderData: {
      totalUsers: 125,
      totalGroups: 18,
      totalTasks: 87,
      pendingTasks: 32,
      completedTasks: 55,
      totalTeachers: 15,
      totalStudents: 110
    }
  });

  if (isLoading || !stats) {
    return (
      <StatsWidget title="System Statistics">
        <div className="animate-pulse space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </StatsWidget>
    );
  }

  return (
    <StatsWidget title="System Statistics">
      <StatItem 
        label="Total Users" 
        value={stats.totalUsers} 
        color="blue"
        icon={<i className="fa fa-users"></i>}
      />
      <StatItem 
        label="Teachers" 
        value={stats.totalTeachers} 
        color="purple"
        icon={<i className="fa fa-chalkboard-teacher"></i>}
      />
      <StatItem 
        label="Students" 
        value={stats.totalStudents} 
        color="green"
        icon={<i className="fa fa-user-graduate"></i>}
      />
      <StatItem 
        label="Groups" 
        value={stats.totalGroups} 
        color="yellow"
        icon={<i className="fa fa-users-cog"></i>}
      />
      <StatItem 
        label="Total Tasks" 
        value={stats.totalTasks} 
        color="red"
        icon={<i className="fa fa-tasks"></i>}
      />
      <StatItem 
        label="Task Completion Rate" 
        value={`${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`} 
        color="green"
        icon={<i className="fa fa-chart-line"></i>}
      />
    </StatsWidget>
  );
};

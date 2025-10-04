import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  UserCheck, 
  Calendar, 
  FileText, 
  Activity, 
  Zap, 
  Globe
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalVolunteers: number;
  activeNGOs: number;
  pendingNGOs: number;
  totalNGOs: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
}

interface PendingNGO {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  submittedDate: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVolunteers: 0,
    activeNGOs: 0,
    pendingNGOs: 0,
    totalNGOs: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [pendingNGORequests, setPendingNGORequests] = useState<PendingNGO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
        setRecentUsers(response.data.data.recentUsers);
        setPendingNGORequests(response.data.data.pendingNGORequests);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const platformStats = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      change: '+12%',
      icon: Users, 
      color: 'from-primary-500 to-primary-600',
      textColor: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    { 
      label: 'Active NGOs', 
      value: stats.activeNGOs.toString(), 
      change: '+8%',
      icon: Building, 
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Pending NGO Requests', 
      value: stats.pendingNGOs.toString(), 
      change: '-3%',
      icon: AlertTriangle, 
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'Total Volunteers', 
      value: stats.totalVolunteers.toLocaleString(), 
      change: '+25%',
      icon: UserCheck, 
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];



  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-primary-600 rounded-lg p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                  <p className="text-primary-100 text-lg">System overview and administrative controls</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>System Status: Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/admin/ngo-requests">
                <Button className="bg-primary-500 text-white hover:bg-primary-700 border border-primary-600">
                  <AlertTriangle className="mr-2 w-4 h-4" />
                  Review NGO Requests
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button className="bg-primary-500 text-white hover:bg-primary-700 border border-primary-600">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  View Analytics
                </Button>
              </Link>
              <Link to="/admin/activity">
                <Button className="bg-primary-500 text-white hover:bg-primary-700 border border-primary-600">
                  <Activity className="mr-2 w-4 h-4" />
                  Activity Log
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden bg-white border border-primary-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-lg ${stat.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} vs last month
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                
                {/* Progress bar */}
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending NGO Requests */}
          <div>
            <Card className="p-8 h-full bg-white border border-primary-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <span>Pending NGO Requests</span>
                </h2>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {stats.pendingNGOs} Pending
                </div>
              </div>
              
              <div className="space-y-4">
                {pendingNGORequests.map((request, index) => (
                  <div key={request.id} className="group bg-orange-50 rounded-lg p-6 border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{request.organizationName}</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span>Contact: {request.contactPerson}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link to="/admin/ngo-requests">
                  <Button variant="outline" className="w-full bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Requests
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Users */}
          <div>
            <Card className="p-8 h-full bg-white border border-primary-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-primary-50">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <span>Recent Users</span>
                </h2>
                <Link to="/admin/users">
                  <Button variant="outline" size="sm" className="bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100">
                    <Users className="mr-2 w-4 h-4" />
                    Manage All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div key={user.id} className="group flex items-center space-x-4 p-4 rounded-lg bg-primary-50 border border-primary-200 hover:shadow-sm transition-all duration-300">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      user.role === 'volunteer' 
                        ? 'bg-primary-100' 
                        : 'bg-green-100'
                    }`}>
                      {user.role === 'volunteer' ? (
                        <Users className="w-6 h-6 text-primary-600" />
                      ) : (
                        <Building className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-1">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                          user.role === 'volunteer' 
                            ? 'bg-primary-100 text-primary-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role === 'volunteer' ? 'Volunteer' : 'NGO Admin'}
                        </span>
                        <span className="text-gray-500">
                          Joined {new Date(user.joinedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="border-primary-200 text-primary-600 hover:bg-primary-50">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* System Overview */}
          <div>
            <Card className="p-8 h-full bg-white border border-primary-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-green-50">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span>System Overview</span>
                </h2>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Users</span>
                    <span className="text-lg font-bold text-primary-600">{stats.totalUsers}</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active NGOs</span>
                    <span className="text-lg font-bold text-green-600">{stats.activeNGOs}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Volunteers</span>
                    <span className="text-lg font-bold text-purple-600">{stats.totalVolunteers}</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <Card className="p-8 bg-white border border-primary-200 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span>System Performance</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center space-x-2">
                <Shield className="w-8 h-8" />
                <span>98.5%</span>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">System Uptime</div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
              </div>
            </div>
            <div className="text-center p-6 bg-primary-50 rounded-lg border border-primary-200">
              <div className="text-4xl font-bold text-primary-600 mb-2 flex items-center justify-center space-x-2">
                <Zap className="w-8 h-8" />
                <span>1.2s</span>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-4xl font-bold text-purple-600 mb-2 flex items-center justify-center space-x-2">
                <Users className="w-8 h-8" />
                <span>245</span>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">Active Sessions</div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Administrative Actions */}
        <Card className="p-8 bg-white border border-primary-200 shadow-sm">
          <h3 className="text-2xl font-bold mb-8 text-gray-900 flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary-50">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <span>Quick Actions</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Link to="/admin/ngo-requests" className="group">
              <div className="p-6 rounded-lg bg-orange-50 border border-orange-200 hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">NGO Requests</span>
                <div className="text-xs text-orange-600 mt-1">{stats.pendingNGOs} Pending</div>
              </div>
            </Link>
            <Link to="/admin/users" className="group">
              <div className="p-6 rounded-lg bg-primary-50 border border-primary-200 hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Volunteer Management</span>
                <div className="text-xs text-primary-600 mt-1">{stats.totalVolunteers} Volunteers</div>
              </div>
            </Link>
            <Link to="/admin/settings" className="group">
              <div className="p-6 rounded-lg bg-green-50 border border-green-200 hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">System Settings</span>
                <div className="text-xs text-green-600 mt-1">Configure</div>
              </div>
            </Link>
            <Link to="/admin/activity" className="group">
              <div className="p-6 rounded-lg bg-purple-50 border border-purple-200 hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Activity Log</span>
                <div className="text-xs text-purple-600 mt-1">Real-time</div>
              </div>
            </Link>
            <div className="group cursor-pointer">
              <div className="p-6 rounded-lg bg-red-50 border border-red-200 hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Security</span>
                <div className="text-xs text-red-600 mt-1">Monitor</div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="p-6 rounded-lg bg-primary-50 border border-primary-200 hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Analytics</span>
                <div className="text-xs text-primary-600 mt-1">View Reports</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
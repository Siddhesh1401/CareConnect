import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Users, Crown, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo_admin';
  accountStatus: 'active' | 'suspended';
  createdAt: string;
  organizationName?: string;
  profilePicture?: string;
  points?: number;
  level?: number;
  isVerified?: boolean;
}

interface UserStats {
  total: number;
  active: number;
  suspended: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    suspended: 0
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-status`);
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, accountStatus: user.accountStatus === 'active' ? 'suspended' : 'active' }
            : user
        ));
        // Update stats
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header with Statistics */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-3xl p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Volunteer Management</h1>
                  <p className="text-blue-100">Manage volunteer accounts and activities</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-5 w-5 text-blue-200" />
                    <span className="text-blue-100 text-sm">Total Volunteers</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-200" />
                    <span className="text-blue-100 text-sm">Active</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.active}</span>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-200" />
                    <span className="text-blue-100 text-sm">Suspended</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.suspended}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-6 p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Enhanced Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card 
              key={user._id} 
              className={`relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group animate-fade-in`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/30"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="relative">
                      <img
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff&size=64`}
                        alt={user.name}
                        className="w-16 h-16 rounded-xl object-cover ring-4 ring-white/50 shadow-lg"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        user.accountStatus === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          👥 Volunteer
                        </span>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.accountStatus === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {user.accountStatus === 'active' ? '✅ Active' : '❌ Suspended'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Button variant="outline" size="sm" className="p-2 bg-white/50 border-gray-200 hover:bg-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Enhanced User Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Join Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Points:</span>
                    <span className="font-medium text-blue-600">{user.points || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium text-green-600">{user.level || 1}</span>
                  </div>
                </div>

                {/* Enhanced Action Button */}
                <Button
                  onClick={() => handleToggleStatus(user._id)}
                  variant={user.accountStatus === 'active' ? 'outline' : 'primary'}
                  size="sm"
                  className={`w-full transition-all duration-200 ${
                    user.accountStatus === 'active'
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                      : 'bg-green-600 text-white hover:bg-green-700 border-0'
                  }`}
                >
                  {user.accountStatus === 'active' ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Suspend User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate User
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
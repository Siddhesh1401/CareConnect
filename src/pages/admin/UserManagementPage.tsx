import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, CheckCircle, XCircle, Users, UserCheck, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchBar, SearchFilters } from '../../components/search/SearchBar';
import { FilterPanel } from '../../components/search/FilterPanel';
import { getProfilePictureUrl } from '../../services/api';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    suspended: 0
  });
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      // Add status filters
      if (filters.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }

      // Add role filters
      if (filters.category && filters.category.length > 0) {
        params.append('role', filters.category.join(','));
      }

      // Add date range filters
      if (filters.dateRange?.start) {
        params.append('startDate', filters.dateRange.start.toISOString().split('T')[0]);
      }
      if (filters.dateRange?.end) {
        params.append('endDate', filters.dateRange.end.toISOString().split('T')[0]);
      }

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

  const handleAvatarUpload = async (userId: string, file: File) => {
    try {
      setUploadingAvatar(userId);
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.put(`/admin/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, profilePicture: response.data.data.user.profilePicture }
            : user
        ));
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setUploadingAvatar(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header with Statistics */}
        <div className="mb-8">
          <div className="relative bg-primary-600 rounded-lg p-8 text-white overflow-hidden">
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Volunteer Management</h1>
                    <p className="text-primary-100">Manage volunteer accounts and activities</p>
                  </div>
                </div>
                <Link to="/admin/volunteers/analytics">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                    <BarChart3 className="mr-2 w-4 h-4" />
                    View Analytics
                  </Button>
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-5 w-5 text-white/80" />
                    <span className="text-white/80 text-sm">Total Volunteers</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-200" />
                    <span className="text-white/80 text-sm">Active</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.active}</span>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-200" />
                    <span className="text-white/80 text-sm">Suspended</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.suspended}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="space-y-4">
          <SearchBar
            placeholder="Search users by name, email, or organization..."
            onSearch={setSearchQuery}
            onFilter={setFilters}
            showFilters={true}
            className="w-full"
          />

          <FilterPanel
            title="User Filters"
            filters={{
              status: [
                { value: 'active', label: 'Active', count: users.filter(u => u.accountStatus === 'active').length },
                { value: 'suspended', label: 'Suspended', count: users.filter(u => u.accountStatus === 'suspended').length }
              ],
              category: [
                { value: 'volunteer', label: 'Volunteers', count: users.filter(u => u.role === 'volunteer').length },
                { value: 'ngo_admin', label: 'NGO Admins', count: users.filter(u => u.role === 'ngo_admin').length }
              ],
              priority: [
                { value: 'verified', label: 'Verified', count: users.filter(u => u.isVerified).length },
                { value: 'unverified', label: 'Unverified', count: users.filter(u => !u.isVerified).length }
              ],
              dateRange: filters.dateRange
            }}
            selectedFilters={{
              status: filters.status || [],
              category: filters.category || [],
              priority: filters.priority || [],
              dateRange: filters.dateRange
            }}
            onFilterChange={setFilters}
            onClearAll={() => setFilters({})}
            className="w-full"
          />
        </div>

        {/* Enhanced Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card 
              key={user._id} 
              className="relative overflow-hidden bg-white border border-primary-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
            >
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="relative">
                      <img
                        src={getProfilePictureUrl(user.profilePicture, user.name, 64)}
                        alt={user.name}
                        className="w-16 h-16 rounded-lg object-cover ring-4 ring-white/50 shadow-sm cursor-pointer hover:ring-primary-300 transition-all"
                        onClick={() => document.getElementById(`avatar-input-${user._id}`)?.click()}
                      />
                      <input
                        id={`avatar-input-${user._id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAvatarUpload(user._id, file);
                          }
                        }}
                      />
                      {uploadingAvatar === user._id && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        user.accountStatus === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
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
                    <Button variant="outline" size="sm" className="p-2 bg-white border-gray-200 hover:bg-primary-50">
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
                    <span className="font-medium text-primary-600">{user.points || 0}</span>
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
          <Card className="p-12 text-center bg-white border border-primary-200 shadow-sm">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
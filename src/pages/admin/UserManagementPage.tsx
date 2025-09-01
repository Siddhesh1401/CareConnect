import { useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Users, Crown, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo_admin';
  status: 'active' | 'suspended';
  joinDate: string;
  avatar: string;
  totalHours?: number;
  eventsParticipated?: number;
  ngoName?: string;
  campaignsCreated?: number;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'volunteer',
    status: 'active',
    joinDate: '2023-06-15',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    totalHours: 45,
    eventsParticipated: 8
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@greenearth.org',
    role: 'ngo_admin',
    status: 'active',
    joinDate: '2023-05-20',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    ngoName: 'Green Earth Foundation',
    campaignsCreated: 12
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'volunteer',
    status: 'suspended',
    joinDate: '2023-07-10',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    totalHours: 23,
    eventsParticipated: 4
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@helpinghands.org',
    role: 'ngo_admin',
    status: 'active',
    joinDate: '2023-04-12',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    ngoName: 'Helping Hands',
    campaignsCreated: 8
  },
  {
    id: '5',
    name: 'Eve Brown',
    email: 'eve@example.com',
    role: 'volunteer',
    status: 'active',
    joinDate: '2023-08-03',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
    totalHours: 67,
    eventsParticipated: 15
  }
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'volunteer' | 'ngo_admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    volunteers: users.filter(u => u.role === 'volunteer').length,
    ngoAdmins: users.filter(u => u.role === 'ngo_admin').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

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
                  <h1 className="text-3xl font-bold">User Management</h1>
                  <p className="text-blue-100">Manage volunteers and NGO administrators</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-200" />
                    <span className="text-blue-100 text-sm">Total Users</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-5 w-5 text-green-200" />
                    <span className="text-blue-100 text-sm">Volunteers</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.volunteers}</span>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-200" />
                    <span className="text-blue-100 text-sm">NGO Admins</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.ngoAdmins}</span>
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
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none"
                >
                  <option value="all">All Roles</option>
                  <option value="volunteer">Volunteers</option>
                  <option value="ngo_admin">NGO Admins</option>
                </select>
              </div>
              
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
          {filteredUsers.map((user) => (
            <Card 
              key={user.id} 
              className={`relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group animate-fade-in`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/30"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-xl object-cover ring-4 ring-white/50 shadow-lg"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'volunteer' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {user.role === 'volunteer' ? '👥 Volunteer' : '👑 NGO Admin'}
                        </span>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {user.status === 'active' ? '✅ Active' : '❌ Suspended'}
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
                      {new Date(user.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {user.role === 'volunteer' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Hours:</span>
                        <span className="font-medium text-blue-600">{user.totalHours}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Events:</span>
                        <span className="font-medium text-green-600">{user.eventsParticipated}</span>
                      </div>
                    </>
                  )}
                  
                  {user.role === 'ngo_admin' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Organization:</span>
                        <span className="font-medium text-purple-600 truncate max-w-[120px]">{user.ngoName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Campaigns:</span>
                        <span className="font-medium text-orange-600">{user.campaignsCreated}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Enhanced Action Button */}
                <Button
                  onClick={() => handleToggleStatus(user.id)}
                  variant={user.status === 'active' ? 'outline' : 'primary'}
                  size="sm"
                  className={`w-full transition-all duration-200 ${
                    user.status === 'active'
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                      : 'bg-green-600 text-white hover:bg-green-700 border-0'
                  }`}
                >
                  {user.status === 'active' ? (
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

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
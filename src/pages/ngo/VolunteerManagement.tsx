import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  MessageCircle,
  Download,
  UserCheck,
  Clock
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const VolunteerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const volunteers = [
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43210',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinedDate: '2024-12-15',
      totalHours: 45,
      eventsJoined: 8,
      status: 'active',
      skills: ['Event Management', 'Community Outreach'],
      lastActivity: '2025-01-22'
    },
    {
      id: '2',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@email.com',
      phone: '+91 87654 32109',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinedDate: '2024-11-20',
      totalHours: 72,
      eventsJoined: 12,
      status: 'active',
      skills: ['Teaching', 'Digital Literacy'],
      lastActivity: '2025-01-21'
    },
    {
      id: '3',
      name: 'Sneha Patel',
      email: 'sneha.patel@email.com',
      phone: '+91 76543 21098',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinedDate: '2024-10-10',
      totalHours: 28,
      eventsJoined: 5,
      status: 'inactive',
      skills: ['Healthcare', 'First Aid'],
      lastActivity: '2025-01-10'
    },
    {
      id: '4',
      name: 'Amit Singh',
      email: 'amit.singh@email.com',
      phone: '+91 65432 10987',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      joinedDate: '2024-09-05',
      totalHours: 96,
      eventsJoined: 15,
      status: 'active',
      skills: ['Environmental Conservation', 'Project Management'],
      lastActivity: '2025-01-23'
    }
  ];

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = (volunteerId: string) => {
    console.log('Sending message to volunteer:', volunteerId);
  };

  const handleGenerateCertificate = (volunteerId: string) => {
    console.log('Generating certificate for volunteer:', volunteerId);
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
            <p className="text-gray-600 mt-2">Manage and coordinate with your volunteers</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="mr-2 w-4 h-4" />
              Export Data
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Mail className="mr-2 w-4 h-4" />
              Send Broadcast
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Volunteers</p>
                <p className="text-2xl font-bold text-blue-600">{volunteers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Volunteers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {volunteers.filter(v => v.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {volunteers.reduce((sum, v) => sum + v.totalHours, 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Hours/Volunteer</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(volunteers.reduce((sum, v) => sum + v.totalHours, 0) / volunteers.length)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-blue-50 border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search volunteers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </Card>

        {/* Volunteers List */}
        <div className="grid gap-6">
          {filteredVolunteers.map((volunteer) => (
            <Card key={volunteer.id} className="p-6 bg-white border border-blue-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={volunteer.avatar}
                    alt={volunteer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{volunteer.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        volunteer.status === 'active' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {volunteer.status}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>{volunteer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span>{volunteer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Joined {new Date(volunteer.joinedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Hours:</span>
                          <span className="font-medium text-gray-900">{volunteer.totalHours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Events Joined:</span>
                          <span className="font-medium text-gray-900">{volunteer.eventsJoined}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Activity:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(volunteer.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {volunteer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(volunteer.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="mr-2 w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateCertificate(volunteer.id)}
                  >
                    <Award className="mr-2 w-4 h-4" />
                    Certificate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredVolunteers.length === 0 && (
          <Card className="p-12 text-center bg-blue-50 border border-blue-100">
            <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'No volunteers have joined your organization yet'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
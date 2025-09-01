import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Eye, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CampaignManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const campaigns = [
    {
      id: '1',
      title: 'Clean Water Initiative',
      description: 'Providing access to clean drinking water for rural communities',
      target: 500000,
      raised: 325000,
      donors: 156,
      daysLeft: 12,
      status: 'active',
      category: 'Healthcare',
      createdDate: '2024-12-01'
    },
    {
      id: '2',
      title: 'Education Support Fund',
      description: 'Supporting underprivileged children with educational resources',
      target: 300000,
      raised: 180000,
      donors: 89,
      daysLeft: 25,
      status: 'active',
      category: 'Education',
      createdDate: '2024-11-15'
    },
    {
      id: '3',
      title: 'Emergency Relief Fund',
      description: 'Disaster relief support for affected communities',
      target: 750000,
      raised: 750000,
      donors: 234,
      daysLeft: 0,
      status: 'completed',
      category: 'Disaster Relief',
      createdDate: '2024-10-01'
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
            <p className="text-gray-600 mt-2">Create and manage your fundraising campaigns</p>
          </div>
          <Link to="/ngo/campaigns/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 w-4 h-4" />
              Create Campaign
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Raised</p>
                <p className="text-2xl font-bold text-blue-600">₹12.55L</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Campaigns</p>
                <p className="text-2xl font-bold text-blue-600">2</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Donors</p>
                <p className="text-2xl font-bold text-blue-600">479</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">85%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-blue-50 border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
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
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </Card>

        {/* Campaigns List */}
        <div className="space-y-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 bg-white border border-blue-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link to={`/campaigns/${campaign.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link to={`/ngo/campaigns/${campaign.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Campaign Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    ₹{campaign.raised.toLocaleString()} raised of ₹{campaign.target.toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    {Math.round((campaign.raised / campaign.target) * 100)}% complete
                  </span>
                </div>
                
                <div className="w-full bg-blue-100 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      campaign.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((campaign.raised / campaign.target) * 100, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{campaign.donors}</div>
                    <div className="text-gray-600">Donors</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {campaign.daysLeft > 0 ? `${campaign.daysLeft} days` : 'Completed'}
                    </div>
                    <div className="text-gray-600">
                      {campaign.daysLeft > 0 ? 'Remaining' : 'Status'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Math.round(campaign.raised / campaign.donors).toLocaleString()}
                    </div>
                    <div className="text-gray-600">Avg. Donation</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <Card className="p-12 text-center bg-blue-50 border border-blue-100">
            <Target className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first campaign to start fundraising'}
            </p>
            <Link to="/ngo/campaigns/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 w-4 h-4" />
                Create Campaign
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};
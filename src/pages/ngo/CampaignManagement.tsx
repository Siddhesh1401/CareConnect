import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Search,
  Filter,
  Trash2,
  MoreVertical,
  User,
  X,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { campaignAPI, getFullImageUrl } from '../../services/api';

export const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getMyCampaigns({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      if (response.success) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await campaignAPI.getCampaignStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignAPI.deleteCampaign(campaignId);
        fetchCampaigns(); // Refresh the list
        fetchStats(); // Refresh stats
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign');
      }
    }
  };

  const handleViewDonors = async (campaign: any) => {
    setSelectedCampaign(campaign);
    setLoadingDonors(true);
    setShowDonorModal(true);
    
    try {
      const response = await campaignAPI.getCampaignDonors(campaign._id || campaign.id);
      
      if (response.success) {
        setDonors(response.data.donors || []);
      }
    } catch (error) {
      console.error('Error fetching donors:', error);
      setDonors([]);
    } finally {
      setLoadingDonors(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-soft border border-primary-100">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Campaign Management</h1>
            <p className="text-primary-600 mt-2">Create and manage your fundraising campaigns</p>
          </div>
          <div className="flex gap-3">
            <Link to="/ngo/campaigns/analytics">
              <Button variant="outline" className="border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400">
                <BarChart3 className="mr-2 w-4 h-4" />
                View Analytics
              </Button>
            </Link>
            <Link to="/ngo/campaigns/create">
              <Button className="bg-primary-600 hover:bg-primary-700 border border-primary-700">
                <Plus className="mr-2 w-4 h-4" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Total Raised</p>
                <p className="text-2xl font-bold text-primary-900">
                  ₹{(stats?.totalRaised || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg border border-primary-200">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Active Campaigns</p>
                <p className="text-2xl font-bold text-primary-900">{stats?.activeCampaigns || 0}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg border border-primary-200">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Total Donors</p>
                <p className="text-2xl font-bold text-primary-900">{stats?.totalDonors || 0}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg border border-primary-200">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-primary-200 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Completed Campaigns</p>
                <p className="text-2xl font-bold text-primary-900">{stats?.completedCampaigns || 0}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg border border-primary-200">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </div>        {/* Search and Filters */}
        <Card className="p-6 bg-primary-50 border-primary-200 shadow-soft">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="bg-white border-primary-200 focus:border-primary-300"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-primary-200 rounded-lg text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300"
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
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-6 bg-white border border-blue-100">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            filteredCampaigns.map((campaign) => (
              <Card key={campaign._id || campaign.id} className="p-6 bg-white border-primary-200 shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="flex items-start space-x-4">
                  {/* Campaign Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={getFullImageUrl(campaign.image)}
                      alt={campaign.title}
                      className="w-20 h-20 object-cover rounded-lg border border-primary-200"
                    />
                  </div>

                  {/* Campaign Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-primary-900 truncate">{campaign.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                            campaign.status === 'active' ? 'bg-primary-100 text-primary-800 border-primary-200' :
                            campaign.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                            campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-primary-600 mb-4 line-clamp-2">{campaign.description}</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        <Link to={`/campaigns/${campaign._id || campaign.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/ngo/campaigns/${campaign._id || campaign.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDonors(campaign)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Donors
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign._id || campaign.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Campaign Progress */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary-600 px-2 py-1 bg-primary-50 rounded border border-primary-100">
                          ₹{campaign.raised.toLocaleString()} raised of ₹{campaign.target.toLocaleString()}
                        </span>
                        <span className="text-primary-600 px-2 py-1 bg-primary-50 rounded border border-primary-100">
                          {Math.round((campaign.raised / campaign.target) * 100)}% complete
                        </span>
                      </div>
                      
                      <div className="w-full bg-primary-200 rounded-full h-3 border border-primary-300">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            campaign.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${Math.min((campaign.raised / campaign.target) * 100, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <div className="text-lg font-semibold text-primary-900">{campaign.donors}</div>
                          <div className="text-primary-600">Donors</div>
                        </div>
                        <div className="text-center p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <div className="text-lg font-semibold text-primary-900">
                            {campaign.daysLeft > 0 ? `${campaign.daysLeft} days` : 'Completed'}
                          </div>
                          <div className="text-primary-600">
                            {campaign.daysLeft > 0 ? 'Remaining' : 'Status'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <div className="text-lg font-semibold text-primary-900">
                            ₹{campaign.donors > 0 ? Math.round(campaign.raised / campaign.donors).toLocaleString() : '0'}
                          </div>
                          <div className="text-primary-600">Avg. Donation</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredCampaigns.length === 0 && (
          <Card className="p-12 text-center bg-primary-50 border-primary-200 shadow-soft">
            <Target className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-900 mb-2">No campaigns found</h3>
            <p className="text-primary-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first campaign to start fundraising'}
            </p>
            <Link to="/ngo/campaigns/create">
              <Button className="bg-primary-600 hover:bg-primary-700 border border-primary-700">
                <Plus className="mr-2 w-4 h-4" />
                Create Campaign
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Donor Modal */}
      {showDonorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-soft border border-primary-200">
            <div className="flex items-center justify-between p-6 border-b border-primary-100">
              <h2 className="text-xl font-semibold text-primary-900">
                Donors for {selectedCampaign?.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDonorModal(false)}
                className="text-primary-600 hover:text-primary-900 hover:bg-primary-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingDonors ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-primary-600">Loading donors...</span>
                </div>
              ) : donors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                  <p className="text-primary-600">No donors found for this campaign</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donors.map((donor, index) => (
                    <Card key={donor._id || index} className="p-4 bg-primary-50 border-primary-200 shadow-sm hover:shadow-medium transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-primary-900">{donor.name || 'Anonymous'}</p>
                            <p className="text-sm text-primary-600">{donor.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 px-2 py-1 bg-green-50 rounded border border-green-200">
                            ₹{donor.amount?.toLocaleString('en-IN') || '0'}
                          </p>
                          <p className="text-xs text-primary-500 mt-1">
                            {donor.donatedAt ? new Date(donor.donatedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {donor.message && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-primary-400 mt-0.5" />
                            <p className="text-sm text-primary-700">{donor.message}</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
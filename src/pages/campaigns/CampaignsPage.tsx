import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Heart, 
  Target, 
  Clock, 
  Users, 
  MapPin,
  TrendingUp,
  Share2,
  ArrowRight,
  Eye,
  CreditCard,
  X,
  CheckCircle,
  Flag
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ReportForm from '../../components/ReportForm';
import { campaignAPI } from '../../services/api';

interface Campaign {
  id: string;
  title: string;
  description: string;
  ngoName: string;
  ngoId: string;
  category: string;
  target: number;
  raised: number;
  donors: number;
  daysLeft: number;
  image: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  createdDate: string;
  status: 'active' | 'completed' | 'paused';
}

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedCampaignForReport, setSelectedCampaignForReport] = useState<Campaign | null>(null);
  
  // Donation modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await campaignAPI.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { value: 'education', label: 'Education' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'environment', label: 'Environment' },
          { value: 'poverty', label: 'Poverty Alleviation' },
          { value: 'disaster-relief', label: 'Disaster Relief' },
          { value: 'animal-welfare', label: 'Animal Welfare' },
          { value: 'children', label: 'Children' },
          { value: 'elderly', label: 'Elderly Care' },
          { value: 'disability', label: 'Disability Support' },
          { value: 'other', label: 'Other' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch campaigns from API
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const fetchCampaigns = async () => {
        try {
          setLoading(true);
          const response = await campaignAPI.getAllCampaigns({
            status: 'active',
            sortBy: sortBy,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            search: searchTerm || undefined
          });
          
          if (response.success) {
            setCampaigns(response.data.campaigns || []);
          }
        } catch (error) {
          console.error('Error fetching campaigns:', error);
          setCampaigns([]);
        } finally {
          setLoading(false);
        }
      };

      fetchCampaigns();
    }, 300); // Debounce API calls

    return () => clearTimeout(debounceTimer);
  }, [categoryFilter, sortBy, searchTerm]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.ngoName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || campaign.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory && campaign.status === 'active';
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'urgency':
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      case 'deadline':
        return a.daysLeft - b.daysLeft;
      case 'progress':
        return (b.raised / b.target) - (a.raised / a.target);
      case 'newest':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      default:
        return 0;
    }
  });

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSupportClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDonationModal(true);
  };

  const handleReportCampaign = (campaign: Campaign) => {
    setSelectedCampaignForReport(campaign);
    setReportModalOpen(true);
  };

  const handleDonation = async () => {
    if (!selectedCampaign || !donationAmount) return;

    setIsDonating(true);
    try {
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid donation amount');
        return;
      }

      // Here we'll call the donation API (to be implemented)
      const response = await campaignAPI.donateToCampaign(selectedCampaign.id, {
        amount,
        message: donationMessage || undefined
      });

      if (response.success) {
        setDonationSuccess(true);
        // Update the campaign data in the list
        setCampaigns(prevCampaigns => 
          prevCampaigns.map(campaign => 
            campaign.id === selectedCampaign.id 
              ? { ...campaign, raised: campaign.raised + amount, donors: campaign.donors + 1 }
              : campaign
          )
        );
        
        // Close modal after a delay
        setTimeout(() => {
          setShowDonationModal(false);
          setDonationSuccess(false);
          setDonationAmount('');
          setDonationMessage('');
          setSelectedCampaign(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed. Please try again.');
    } finally {
      setIsDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            Support Meaningful Campaigns
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover and support fundraising campaigns that are making a real difference in communities across India.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card key="active-campaigns" className="p-6 text-center bg-white border border-primary-200 shadow-soft">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <div className="text-gray-600">Active Campaigns</div>
          </Card>
          <Card key="total-raised" className="p-6 text-center bg-white border border-primary-200 shadow-soft">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ₹{campaigns.reduce((sum, c) => sum + c.raised, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Raised</div>
          </Card>
          <Card key="total-donors" className="p-6 text-center bg-white border border-primary-200 shadow-soft">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {campaigns.reduce((sum, c) => sum + c.donors, 0)}
            </div>
            <div className="text-gray-600">Total Donors</div>
          </Card>
          <Card key="urgent-campaigns" className="p-6 text-center bg-white border border-primary-200 shadow-soft">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {campaigns.filter(c => c.urgency === 'high').length}
            </div>
            <div className="text-gray-600">Urgent Campaigns</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 bg-white border border-primary-200 shadow-soft">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns, NGOs, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-soft"
              disabled={loadingCategories}
            >
              <option value="all">
                {loadingCategories ? 'Loading categories...' : 'All Categories'}
              </option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-soft"
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="deadline">Sort by Deadline</option>
              <option value="progress">Sort by Progress</option>
              <option value="newest">Sort by Newest</option>
            </select>
          </div>
        </Card>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-medium transition-shadow bg-white border border-primary-200 shadow-soft">
              <div className="relative">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(campaign.urgency)}`}>
                    {campaign.urgency.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium">
                    {campaign.daysLeft} days left
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                    {campaign.category}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {campaign.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {campaign.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="mr-4">{campaign.location}</span>
                  <Users className="w-4 h-4 mr-1" />
                  <span>by {campaign.ngoName}</span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">
                      ₹{campaign.raised.toLocaleString()} raised
                    </span>
                    <span className="text-gray-600">
                      ₹{campaign.target.toLocaleString()} goal
                    </span>
                  </div>
                  <div className="w-full bg-primary-100 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(campaign.raised, campaign.target)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{campaign.donors} donors</span>
                    <span>{Math.round(getProgressPercentage(campaign.raised, campaign.target))}% funded</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link 
                    to={`/campaigns/${campaign.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full border-primary-200 hover:border-primary-300 hover:bg-primary-50">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                    onClick={() => handleSupportClick(campaign)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Support
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 px-3"
                    onClick={() => handleReportCampaign(campaign)}
                    title="Report this campaign"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedCampaigns.length === 0 && (
          <Card className="p-12 text-center bg-white border border-primary-200 shadow-soft">
            <Target className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new campaigns.
            </p>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="p-8 text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white mt-12 shadow-medium">
          <h2 className="text-2xl font-bold mb-4">Want to make a bigger impact?</h2>
          <p className="text-primary-100 mb-6">
            Join our volunteer community and contribute your time and skills to these amazing causes.
          </p>
          <Link to="/events">
            <Button className="bg-white text-primary-600 hover:bg-gray-100">
              <ArrowRight className="w-4 h-4 mr-2" />
              Explore Volunteer Opportunities
            </Button>
          </Link>
        </Card>
      </div>

      {/* Donation Modal */}
      {showDonationModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-primary-200 shadow-medium">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Support This Campaign</h3>
              <button
                onClick={() => {
                  setShowDonationModal(false);
                  setSelectedCampaign(null);
                  setDonationAmount('');
                  setDonationMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-primary-50 p-3 rounded-lg mb-4 border border-primary-200">
                <h4 className="font-medium text-primary-900">{selectedCampaign.title}</h4>
                <p className="text-sm text-gray-600">by {selectedCampaign.ngoName}</p>
              </div>
            </div>

            {donationSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-primary-900 mb-2">Thank You!</h4>
                <p className="text-gray-600">Your donation has been processed successfully.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-soft"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    placeholder="Leave a message for the NGO..."
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-soft"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDonationModal(false);
                      setSelectedCampaign(null);
                      setDonationAmount('');
                      setDonationMessage('');
                    }}
                    className="flex-1 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
                    disabled={isDonating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDonation}
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                    disabled={isDonating || !donationAmount}
                  >
                    {isDonating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Donate ₹{donationAmount || '0'}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {selectedCampaignForReport && (
        <ReportForm
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setSelectedCampaignForReport(null);
          }}
          type="campaign"
          targetId={selectedCampaignForReport.id}
          targetName={selectedCampaignForReport.title}
        />
      )}
    </div>
  );
};

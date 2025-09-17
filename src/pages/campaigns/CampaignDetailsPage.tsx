import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Target, 
  Users, 
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  CreditCard,
  X
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { campaignAPI, getFullImageUrl } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Campaign {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
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
  updates: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    image?: string;
  }>;
}

export const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await campaignAPI.getCampaignById(id);
        
        if (response.success) {
          setCampaign(response.data);
        } else {
          console.error('Failed to fetch campaign:', response.message);
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

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

  const handleDonation = async () => {
    if (!campaign || !donationAmount) return;

    setIsDonating(true);
    try {
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid donation amount');
        return;
      }

      // Here we'll call the donation API (to be implemented)
      const response = await campaignAPI.donateToCampaign(campaign.id, {
        amount,
        message: donationMessage || undefined
      });

      if (response.success) {
        setDonationSuccess(true);
        // Update the campaign data with new donation
        setCampaign(prev => prev ? {
          ...prev,
          raised: prev.raised + amount,
          donors: prev.donors + 1
        } : null);
        
        // Close modal after a delay
        setTimeout(() => {
          setShowDonationModal(false);
          setDonationSuccess(false);
          setDonationAmount('');
          setDonationMessage('');
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
          <p className="text-primary-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Campaign not found</h2>
          <Link to="/campaigns">
            <Button className="bg-primary-600 hover:bg-primary-700 border border-primary-700">Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:bg-primary-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="relative h-80">
                <img
                  src={getFullImageUrl(campaign.image)}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(campaign.urgency)}`}>
                    {campaign.urgency.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-white/90 text-gray-700 rounded-full text-xs font-medium">
                    {campaign.category}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title and Meta */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-3xl font-bold text-white mb-2">{campaign.title}</h1>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {campaign.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <Link to={`/ngos/${campaign.ngoId}`} className="hover:text-white">
                        {campaign.ngoName}
                      </Link>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {campaign.daysLeft} days left
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Campaign</h2>
              <div className="prose max-w-none">
                {campaign.fullDescription.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                    {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                      <strong className="text-gray-900">{paragraph.slice(2, -2)}</strong>
                    ) : paragraph.startsWith('- ') ? (
                      <span className="flex items-start">
                        <span className="mr-2 text-primary-500">•</span>
                        <span>{paragraph.slice(2)}</span>
                      </span>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </div>
            </div>

            {/* Updates Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Updates</h2>
              <div className="space-y-6">
                {campaign.updates.length > 0 ? campaign.updates.map((update) => (
                  <div key={update.id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{update.title}</h3>
                      <span className="text-sm text-gray-500">{new Date(update.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700">{update.content}</p>
                    {update.image && (
                      <img
                        src={update.image}
                        alt={update.title}
                        className="mt-3 w-full max-w-md h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">No updates available yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Progress */}
            <Card className="border-primary-200">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-900 mb-2">
                    ₹{campaign.raised.toLocaleString()}
                  </div>
                  <div className="text-primary-600">
                    raised of ₹{campaign.target.toLocaleString()} goal
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-full bg-primary-100 rounded-full h-3 mb-4">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(campaign.raised, campaign.target)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-primary-600">
                    <span>{Math.round(getProgressPercentage(campaign.raised, campaign.target))}% funded</span>
                    <span>{campaign.donors} donors</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-primary-600">
                      <Clock className="w-4 h-4 mr-2 text-primary-500" />
                      Days remaining
                    </span>
                    <span className="font-medium text-primary-900">{campaign.daysLeft}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-primary-600">
                      <Target className="w-4 h-4 mr-2 text-primary-500" />
                      Goal amount
                    </span>
                    <span className="font-medium text-primary-900">₹{campaign.target.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-primary-600">
                      <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                      Campaign started
                    </span>
                    <span className="font-medium text-primary-900">
                      {new Date(campaign.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Only show donation functionality for non-NGO users */}
                {user?.role !== 'ngo_admin' && (
                  <Button
                    className="w-full bg-primary-600 hover:bg-primary-700 border border-primary-700 text-lg py-3 mb-3"
                    onClick={() => setShowDonationModal(true)}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Support Campaign
                  </Button>
                )}

                {/* Dynamic button based on user role */}
                {user?.role === 'ngo_admin' ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-primary-300 text-primary-700 hover:bg-primary-50"
                    onClick={() => navigate(`/ngo/campaigns/${campaign.id}/edit`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Manage Campaign
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full border-primary-300 text-primary-700 hover:bg-primary-50">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Campaign
                  </Button>
                )}
              </div>
            </Card>

            {/* NGO Info */}
            <Card className="border-primary-200">
              <div className="p-6">
                <h3 className="font-bold text-primary-900 mb-4">About the Organization</h3>
                <Link to={`/ngos/${campaign.ngoId}`} className="block">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {campaign.ngoName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-primary-900">{campaign.ngoName}</div>
                      <div className="text-sm text-primary-600">Verified NGO</div>
                    </div>
                  </div>
                </Link>
                <p className="text-sm text-primary-600 mb-4">
                  {campaign.ngoName} is a verified non-profit organization working towards creating positive social impact through various community initiatives.
                </p>
                <Link to={`/ngos/${campaign.ngoId}`}>
                  <Button variant="outline" className="w-full border-primary-300 text-primary-700 hover:bg-primary-50">
                    <Eye className="w-4 h-4 mr-2" />
                    View NGO Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Impact Stats */}
            <Card className="border-primary-200 bg-primary-50">
              <div className="p-6">
                <h3 className="font-bold text-primary-900 mb-4">Campaign Impact</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-600">Communities helped</span>
                    <span className="font-bold text-primary-700">15+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-600">People benefited</span>
                    <span className="font-bold text-primary-700">3,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-600">Systems installed</span>
                    <span className="font-bold text-primary-700">8</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Support This Campaign</h3>
              <button
                onClick={() => setShowDonationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {donationSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-primary-900 mb-2">Thank You!</h4>
                <p className="text-primary-600">Your donation has been processed successfully.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Donation Amount (₹)
                  </label>
                  <Input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    placeholder="Leave a message for the NGO..."
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-900"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDonationModal(false)}
                    className="flex-1 border-primary-300 text-primary-700 hover:bg-primary-50"
                    disabled={isDonating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDonation}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 border border-primary-700"
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
    </div>
  );
};

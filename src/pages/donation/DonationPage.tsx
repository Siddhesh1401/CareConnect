import React, { useState } from 'react';
import { Heart, CreditCard, Smartphone, Wallet, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const DonationPage: React.FC = () => {
  const navigate = useNavigate();
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedNGO, setSelectedNGO] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  const ngos = [
    { 
      id: '1', 
      name: 'Green Earth Foundation', 
      category: 'Environment',
      description: 'Working towards a sustainable and green future for all',
      logo: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=100',
      impact: '50,000+ trees planted'
    },
    { 
      id: '2', 
      name: 'Hope for Children', 
      category: 'Education',
      description: 'Providing quality education to underprivileged children',
      logo: 'https://images.pexels.com/photos/8422403/pexels-photo-8422403.jpeg?auto=compress&cs=tinysrgb&w=100',
      impact: '10,000+ children educated'
    },
    { 
      id: '3', 
      name: 'Community Care', 
      category: 'Healthcare',
      description: 'Delivering healthcare services to rural communities',
      logo: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=100',
      impact: '25,000+ patients treated'
    },
    { 
      id: '4', 
      name: 'Animal Welfare Society', 
      category: 'Animals',
      description: 'Rescuing and caring for animals in need',
      logo: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=100',
      impact: '5,000+ animals rescued'
    }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI Payment', icon: Smartphone },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet }
  ];

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setDonationAmount(value);
  };

  const handleDonate = async () => {
    if (!donationAmount || !selectedNGO || !paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsProcessing(false);
    setDonationSuccess(true);

    // Auto redirect after 5 seconds
    setTimeout(() => {
      navigate('/volunteer/dashboard');
    }, 5000);
  };

  const getFinalAmount = () => {
    return customAmount || donationAmount;
  };

  const getTaxBenefit = () => {
    const amount = getFinalAmount();
    if (!amount) return 0;
    // 50% tax benefit under Section 80G
    return Math.floor(parseInt(amount) * 0.5);
  };

  const getImpactMessage = (amount: string) => {
    const amt = parseInt(amount);
    if (amt >= 10000) return "🌟 Can fund a complete education kit for 10 children";
    if (amt >= 5000) return "🌱 Can plant and maintain 50 trees for a year";
    if (amt >= 2500) return "🏥 Can provide medical care for 25 patients";
    if (amt >= 1000) return "📚 Can provide books for 5 children";
    if (amt >= 500) return "🍞 Can provide meals for 20 people";
    return "💝 Every rupee makes a difference";
  };

  if (donationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You for Your Donation!
          </h2>
          <p className="text-gray-600 mb-4">
            Your donation of <strong>₹{getFinalAmount()}</strong> to{' '}
            <strong>{ngos.find(n => n.id === selectedNGO)?.name}</strong> has been processed successfully.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              A receipt has been sent to your email. Your donation may be eligible for tax benefits under Section 80G.
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => navigate('/volunteer/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setDonationSuccess(false)} className="w-full">
              Make Another Donation
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3">Make a Donation</h1>
          <p className="text-gray-600 text-lg">
            Your contribution makes a real difference in communities across India
          </p>
        </div>

        <div className="space-y-8">
          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">₹2.4M+</div>
              <div className="text-sm text-gray-600">Total Raised</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
              <div className="text-2xl font-bold text-green-600">15,000+</div>
              <div className="text-sm text-gray-600">Lives Impacted</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-sm text-gray-600">Active Donors</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">25+</div>
              <div className="text-sm text-gray-600">Partner NGOs</div>
            </div>
          </div>

          {/* Select NGO */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="w-6 h-6 text-blue-600 mr-3" />
              Choose Organization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ngos.map((ngo) => (
                <label key={ngo.id} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="ngo"
                    value={ngo.id}
                    checked={selectedNGO === ngo.id}
                    onChange={(e) => setSelectedNGO(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-6 border-2 rounded-2xl transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 ${
                    selectedNGO === ngo.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform -translate-y-1'
                      : 'border-blue-200 hover:border-blue-300 bg-white'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <img 
                        src={ngo.logo} 
                        alt={ngo.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{ngo.name}</div>
                            <div className="text-sm text-blue-600 font-medium">{ngo.category}</div>
                          </div>
                          {selectedNGO === ngo.id && (
                            <CheckCircle className="w-6 h-6 text-blue-600 animate-bounce-in" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{ngo.description}</p>
                        <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full w-fit">
                          {ngo.impact}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Donation Amount */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Wallet className="w-6 h-6 text-blue-600 mr-3" />
              Donation Amount
            </h3>
            
            {/* Predefined Amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`group p-4 border-2 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    donationAmount === amount.toString() && !customAmount
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform scale-105'
                      : 'border-blue-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-lg text-gray-900">₹{amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {amount === 500 && "Basic Support"}
                    {amount === 1000 && "Good Help"}
                    {amount === 2500 && "Great Impact"}
                    {amount === 5000 && "Major Support"}
                    {amount === 10000 && "Champion"}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Or enter custom amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount in ₹"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                min="1"
                className="text-lg p-4 border-2 border-blue-200 rounded-xl focus:border-blue-400"
              />
            </div>

            {getFinalAmount() && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 animate-fade-in">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800 mb-2">
                    Total Donation: ₹{parseInt(getFinalAmount()).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 mb-3">
                    Tax Benefit: ₹{getTaxBenefit().toLocaleString()} (under Section 80G)
                  </div>
                  <div className="text-sm text-gray-700 bg-white/70 p-3 rounded-xl">
                    <strong>Impact:</strong> {getImpactMessage(getFinalAmount())}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Payment Method */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
              Payment Method
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {paymentMethods.map((method) => (
                <label key={method.id} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-6 border-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                      : 'border-blue-200 hover:border-blue-300 bg-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <method.icon className="w-6 h-6 text-blue-600" />
                        <div>
                          <span className="font-semibold text-gray-900 text-lg">{method.name}</span>
                          <div className="text-sm text-gray-500">
                            {method.id === 'card' && 'Credit/Debit Cards - Visa, Mastercard, RuPay'}
                            {method.id === 'upi' && 'UPI - PhonePe, Google Pay, Paytm'}
                            {method.id === 'wallet' && 'Digital Wallets - Quick & Secure'}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        method.id === 'card' 
                          ? 'bg-green-100 text-green-700' 
                          : method.id === 'upi'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {method.id === 'card' ? 'Secure' : method.id === 'upi' ? 'Instant' : 'Fast'}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {paymentMethod && (
              <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 animate-fade-in">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-800 mb-1">Secure Payment</div>
                    <div className="text-sm text-green-700">
                      Your payment is secured with bank-grade encryption. We use trusted payment gateways 
                      to ensure your financial information is protected.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Donate Button */}
          <div className="space-y-6">
            <Button
              onClick={handleDonate}
              isLoading={isProcessing}
              disabled={!getFinalAmount() || !selectedNGO || !paymentMethod}
              className="w-full relative overflow-hidden group"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center">
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Processing Donation...
                  </>
                ) : (
                  <>
                    <Heart className="mr-3 w-6 h-6" />
                    {getFinalAmount() ? (
                      <span className="text-lg font-bold">
                        Donate ₹{parseInt(getFinalAmount()).toLocaleString()}
                      </span>
                    ) : (
                      'Complete Your Donation'
                    )}
                  </>
                )}
              </div>
            </Button>

            {/* Terms */}
            <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
              <Shield className="w-4 h-4 inline mr-1" />
              By donating, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                100% secure payment • SSL encrypted • No card details stored
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
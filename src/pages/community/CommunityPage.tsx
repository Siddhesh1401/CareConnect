import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Image,
  Send,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const myCommunities = [
    {
      id: '1',
      name: 'Environmental Action',
      description: 'Join fellow eco-warriors in making our planet greener',
      memberCount: 1250,
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=150',
      category: 'Environment',
      isJoined: true
    },
    {
      id: '2',
      name: 'Education for All',
      description: 'Supporting education initiatives across communities',
      memberCount: 890,
      image: 'https://images.pexels.com/photos/8422028/pexels-photo-8422028.jpeg?auto=compress&cs=tinysrgb&w=150',
      category: 'Education',
      isJoined: true
    },
    {
      id: '3',
      name: 'Healthcare Heroes',
      description: 'Medical volunteers and health awareness programs',
      memberCount: 565,
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=150',
      category: 'Healthcare',
      isJoined: true
    }
  ];

  const discoverCommunities = [
    {
      id: '4',
      name: 'Animal Welfare',
      description: 'Protecting and caring for animals in need',
      memberCount: 743,
      image: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=150',
      category: 'Animals',
      isJoined: false
    },
    {
      id: '5',
      name: 'Disaster Relief',
      description: 'Emergency response and disaster preparedness',
      memberCount: 432,
      image: 'https://images.pexels.com/photos/6995167/pexels-photo-6995167.jpeg?auto=compress&cs=tinysrgb&w=150',
      category: 'Emergency',
      isJoined: false
    },
    {
      id: '6',
      name: 'Youth Development',
      description: 'Empowering young minds through mentorship',
      memberCount: 658,
      image: 'https://images.pexels.com/photos/8422403/pexels-photo-8422403.jpeg?auto=compress&cs=tinysrgb&w=150',
      category: 'Youth',
      isJoined: false
    }
  ];

  const posts = [
    {
      id: '1',
      title: 'Amazing Turnout at Beach Cleanup!',
      content: 'What an incredible day! We had over 200 volunteers show up for the Juhu Beach cleanup. Together, we collected 500kg of waste and made a real difference. The energy and enthusiasm of everyone involved was absolutely inspiring. Thank you to everyone who participated!',
      author: {
        id: '1',
        name: 'Priya Sharma',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50'
      },
      date: new Date('2025-01-22'),
      likes: 45,
      comments: [
        {
          id: '1',
          content: 'This was such a great event! Already looking forward to the next one.',
          author: {
            id: '2',
            name: 'Rahul Verma',
            avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=50'
          },
          date: new Date('2025-01-22')
        },
        {
          id: '2', 
          content: 'The before and after photos were amazing. Real impact!',
          author: {
            id: '3',
            name: 'Sneha Patel',
            avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=50'
          },
          date: new Date('2025-01-22')
        }
      ],
      image: 'https://images.pexels.com/photos/4039921/pexels-photo-4039921.jpeg?auto=compress&cs=tinysrgb&w=600',
      isLiked: true
    },
    {
      id: '2',
      title: 'Educational Workshop Success Story',
      content: 'Yesterday we conducted a digital literacy workshop for 50 children in Dharavi. Seeing their faces light up as they learned to use tablets for the first time was priceless. Technology can truly bridge educational gaps when used thoughtfully.',
      author: {
        id: '4',
        name: 'Amit Kumar',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50'
      },
      date: new Date('2025-01-21'),
      likes: 32,
      comments: [
        {
          id: '3',
          content: 'Education is the key to breaking the cycle of poverty. Great work!',
          author: {
            id: '5',
            name: 'Maya Singh',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50'
          },
          date: new Date('2025-01-21')
        }
      ],
      image: 'https://images.pexels.com/photos/8422028/pexels-photo-8422028.jpeg?auto=compress&cs=tinysrgb&w=600',
      isLiked: false
    }
  ];

  const handleCreatePost = () => {
    if (newPostTitle.trim() && newPostContent.trim()) {
      // In a real app, this would send to API
      console.log('Creating post:', { title: newPostTitle, content: newPostContent });
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
    }
  };

  const handleJoinCommunity = (communityId: string) => {
    console.log('Joining community:', communityId);
  };

  const handleLikePost = (postId: string) => {
    console.log('Liking post:', postId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent animate-fade-in">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span>Community</span>
            </h1>
            <p className="text-gray-600 mt-3 text-lg animate-fade-in-up">Connect, share, and grow together with fellow volunteers</p>
          </div>
          <Button 
            onClick={() => setShowCreatePost(!showCreatePost)} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Plus className="mr-2 w-4 h-4" />
            Create Post
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl mb-12 shadow-lg border border-blue-100/50">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'feed' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveTab('my-communities')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-communities' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            My Communities
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discover' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            Discover
          </button>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <Card className="p-6 mb-8 bg-blue-50 border-blue-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Create a New Post</h3>
            <div className="space-y-4">
              <Input
                placeholder="Post title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
              <div>
                <textarea
                  placeholder="Share your thoughts, experiences, or ask questions..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Image className="mr-2 w-4 h-4" />
                  Add Photo
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreatePost(false)}
                    className="text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleCreatePost}
                  >
                    <Send className="mr-2 w-4 h-4" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="p-6">
                    {/* Post Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                        <p className="text-sm text-gray-500">{post.date.toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{post.content}</p>

                    {/* Post Image */}
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post image"
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-2 text-sm transition-colors ${
                            post.isLiked 
                              ? 'text-blue-600 hover:text-blue-700' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments.length}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-blue-100">
                        <div className="space-y-3">
                          {post.comments.slice(0, 2).map((comment) => (
                            <div key={comment.id} className="flex items-start space-x-3">
                              <img
                                src={comment.author.avatar}
                                alt={comment.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                                  <span className="text-xs text-gray-500">{comment.date.toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          {post.comments.length > 2 && (
                            <button className="text-sm text-blue-600 hover:text-blue-700 ml-11">
                              View all {post.comments.length} comments
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'my-communities' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Communities ({myCommunities.length})</h2>
                  <Button size="sm">
                    <MessageSquare className="mr-2 w-4 h-4" />
                    Start Discussion
                  </Button>
                </div>
                {myCommunities.map((community) => (
                  <Card key={community.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {community.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{community.memberCount.toLocaleString()} members</span>
                          </div>
                          <div className="flex space-x-2">
                            <Link to={`/communities/${community.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                            <Button size="sm">
                              <MessageSquare className="mr-2 w-4 h-4" />
                              Active
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'discover' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Discover Communities</h2>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search communities..."
                      className="w-64"
                      leftIcon={<Search className="w-4 h-4" />}
                    />
                  </div>
                </div>
                {discoverCommunities.map((community) => (
                  <Card key={community.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {community.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{community.memberCount.toLocaleString()} members</span>
                          </div>
                          <div className="flex space-x-2">
                            <Link to={`/communities/${community.id}`}>
                              <Button size="sm" variant="outline">
                                Preview
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              onClick={() => handleJoinCommunity(community.id)}
                            >
                              <UserPlus className="mr-2 w-4 h-4" />
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Your Impact</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Communities Joined</span>
                  <span className="font-medium text-gray-900">{myCommunities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts Created</span>
                  <span className="font-medium text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments Made</span>
                  <span className="font-medium text-gray-900">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes Received</span>
                  <span className="font-medium text-gray-900">128</span>
                </div>
              </div>
            </Card>

            {/* Trending Topics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Trending Topics</h3>
              <div className="space-y-3">
                {['#BeachCleanup', '#EducationForAll', '#ClimateAction', '#VolunteerLife', '#CommunitySupport'].map((tag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer">{tag}</span>
                    <span className="text-sm text-gray-500">{Math.floor(Math.random() * 100) + 20} posts</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <UserPlus className="mr-2 w-4 h-4" />
                  Invite Friends
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 w-4 h-4" />
                  Start Discussion
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
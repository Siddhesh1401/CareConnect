import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Send,
  UserPlus,
  MessageSquare,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { communityAPI, getFullImageUrl } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';

// Type definitions
interface Community {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  memberCount?: number;
  members?: string[];
  createdBy?: {
    id?: string;
    _id?: string;
    name?: string;
    organizationName?: string;
  };
  createdAt?: string;
}

interface Post {
  id?: string;
  _id?: string;
  title?: string;
  content: string;
  author?: {
    id?: string;
    _id?: string;
    name?: string;
    avatar?: string;
  };
  createdAt?: string;
  date?: Date;
  image?: string;
  likes?: number;
  isLiked?: boolean;
  comments?: Array<{
    id?: string;
    _id?: string;
    content: string;
    author?: {
      id?: string;
      _id?: string;
      name?: string;
      avatar?: string;
    };
    createdAt?: string;
    date?: Date;
    likes?: string[]; // Array of user IDs who liked the comment
  }>;
}

export const CommunityDetailPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  // Comment states
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});
  const [commentLoading, setCommentLoading] = useState<{[postId: string]: boolean}>({});
  const [expandedComments, setExpandedComments] = useState<{[postId: string]: boolean}>({});
  const [likedComments, setLikedComments] = useState<{[commentId: string]: boolean}>({});
  const [commentLikesLoading, setCommentLikesLoading] = useState<{[commentId: string]: boolean}>({});
  const [commentSortBy, setCommentSortBy] = useState<'newest' | 'oldest' | 'most-liked'>('newest');
  const [showAllComments, setShowAllComments] = useState<{[postId: string]: boolean}>({});

  // Fetch community data and posts
  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!communityId) {
        setError('Community ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch community details
        const communityResponse = await communityAPI.getCommunityById(communityId);
        const communityData = communityResponse?.data;
        setCommunity(communityData);

        // Check if user is a member or owner
        if (user && communityData) {
          const isOwner = communityData.createdBy?._id === user.id || communityData.createdBy === user.id;
          const isInMembers = communityData.members?.includes(user.id);
          setIsMember(isOwner || isInMembers);
        }

        // Fetch community posts
        const postsResponse = await communityAPI.getCommunityPosts(communityId);
        const postsData = postsResponse?.data || [];
        const processedPosts = Array.isArray(postsData) ? postsData : [];
        
        // Initialize likedComments state based on current user's likes
        const initialLikedComments: {[commentId: string]: boolean} = {};
        processedPosts.forEach((post: any) => {
          if (post.comments && Array.isArray(post.comments)) {
            post.comments.forEach((comment: any) => {
              const commentId = comment.id || comment._id;
              if (commentId) {
                // Handle likes field more robustly
                let isLikedByUser = false;
                if (comment.likes && Array.isArray(comment.likes)) {
                  // Convert ObjectIds to strings for comparison
                  const userIdStr = user?.id?.toString();
                  const likesAsStrings = comment.likes.map((like: any) => 
                    typeof like === 'string' ? like : like?.toString()
                  );
                  isLikedByUser = likesAsStrings.includes(userIdStr);
                } else if (comment.likes && typeof comment.likes === 'string') {
                  // If likes is a single string, check if it matches user ID
                  isLikedByUser = comment.likes === user?.id?.toString();
                }
                
                initialLikedComments[commentId] = isLikedByUser;
              }
            });
          }
        });
        
        setPosts(processedPosts);
        setLikedComments(initialLikedComments);

      } catch (error) {
        console.error('Error fetching community data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load community data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCommunityData();
    } else {
      setLoading(false);
    }
  }, [communityId, user]);

  const handleJoinCommunity = async () => {
    if (!communityId) return;

    try {
      setLoading(true);
      setError(null);

      await communityAPI.joinCommunity(communityId);
      setIsMember(true);

      // Refresh community data to update member count
      const communityResponse = await communityAPI.getCommunityById(communityId);
      const communityData = communityResponse?.data;
      setCommunity(communityData);

    } catch (error) {
      console.error('Error joining community:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join community';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!communityId) return;

    if (window.confirm('Are you sure you want to leave this community?')) {
      try {
        setLoading(true);
        setError(null);

        await communityAPI.leaveCommunity(communityId);
        setIsMember(false);

        // Refresh community data to update member count
        const communityResponse = await communityAPI.getCommunityById(communityId);
        const communityData = communityResponse?.data;
        setCommunity(communityData);

      } catch (error) {
        console.error('Error leaving community:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to leave community';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreatePost = async () => {
    if (!communityId || !newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      setPostLoading(true);
      setError(null);

      const postData = {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        image: newPostImage || undefined,
      };

      await communityAPI.createPost(communityId, postData);

      // Clear form
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage(null);
      setShowCreatePost(false);

      // Refresh posts
      const postsResponse = await communityAPI.getCommunityPosts(communityId);
      const postsData = postsResponse?.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);

    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      setError(errorMessage);
    } finally {
      setPostLoading(false);
    }
  };

  const handleLikePost = async (postId?: string) => {
    if (!communityId || !postId) return;

    try {
      await communityAPI.likePost(communityId, postId);

      // Refresh posts to show updated like count
      const postsResponse = await communityAPI.getCommunityPosts(communityId);
      const postsData = postsResponse?.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);

    } catch (error) {
      console.error('Error liking post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to like post';
      setError(errorMessage);
    }
  };

  // Handle adding a comment to a post
  const handleAddComment = async (postId: string) => {
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent || !communityId) return;

    try {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));

      await communityAPI.commentOnPost(communityId, postId, commentContent);

      // Clear the input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));

      // Refresh posts to show the new comment
      const postsResponse = await communityAPI.getCommunityPosts(communityId);
      const postsData = postsResponse?.data || [];
      const processedPosts = Array.isArray(postsData) ? postsData : [];
      
      // Update likedComments state after refresh
      const updatedLikedComments: {[commentId: string]: boolean} = {};
      processedPosts.forEach((post: any) => {
        if (post.comments && Array.isArray(post.comments)) {
          post.comments.forEach((comment: any) => {
            const commentId = comment.id || comment._id;
            if (commentId && comment.likes && Array.isArray(comment.likes)) {
              updatedLikedComments[commentId] = comment.likes.includes(user?.id);
            }
          });
        }
      });
      
      setPosts(processedPosts);
      setLikedComments(updatedLikedComments);

    } catch (error) {
      console.error('Error adding comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      setError(errorMessage);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle liking/unliking a comment
  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!communityId) return;

    try {
      setCommentLikesLoading(prev => ({ ...prev, [commentId]: true }));

      const response = await communityAPI.likeComment(communityId, postId, commentId);
      const { isLiked } = response.data;

      setLikedComments(prev => ({
        ...prev,
        [commentId]: isLiked
      }));

      // Refresh posts to get updated like counts
      const postsResponse = await communityAPI.getCommunityPosts(communityId);
      const postsData = postsResponse?.data || [];
      const processedPosts = Array.isArray(postsData) ? postsData : [];
      
      // Update likedComments state after refresh
      const updatedLikedComments: {[commentId: string]: boolean} = {};
      processedPosts.forEach((post: any) => {
        if (post.comments && Array.isArray(post.comments)) {
          post.comments.forEach((comment: any) => {
            const commentId = comment.id || comment._id;
            if (commentId) {
              // Handle likes field more robustly
              let isLikedByUser = false;
              if (comment.likes && Array.isArray(comment.likes)) {
                // Convert ObjectIds to strings for comparison
                const userIdStr = user?.id?.toString();
                const likesAsStrings = comment.likes.map((like: any) => 
                  typeof like === 'string' ? like : like?.toString()
                );
                isLikedByUser = likesAsStrings.includes(userIdStr);
              } else if (comment.likes && typeof comment.likes === 'string') {
                // If likes is a single string, check if it matches user ID
                isLikedByUser = comment.likes === user?.id?.toString();
              }
              
              updatedLikedComments[commentId] = isLikedByUser;
            }
          });
        }
      });
      
      setPosts(processedPosts);
      setLikedComments(prev => ({
        ...prev,
        ...updatedLikedComments
      }));

    } catch (error) {
      console.error('Error liking comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to like comment';
      setError(errorMessage);
    } finally {
      setCommentLikesLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle deleting a comment (moderation)
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!communityId) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await communityAPI.deleteComment(communityId, postId, commentId);

      // Refresh posts to remove the deleted comment
      const postsResponse = await communityAPI.getCommunityPosts(communityId);
      const postsData = postsResponse?.data || [];
      const processedPosts = Array.isArray(postsData) ? postsData : [];
      
      // Update likedComments state after refresh (remove deleted comment's like status)
      const updatedLikedComments: {[commentId: string]: boolean} = {};
      processedPosts.forEach((post: any) => {
        if (post.comments && Array.isArray(post.comments)) {
          post.comments.forEach((comment: any) => {
            const commentId = comment.id || comment._id;
            if (commentId) {
              // Handle likes field more robustly
              let isLikedByUser = false;
              if (comment.likes && Array.isArray(comment.likes)) {
                // Convert ObjectIds to strings for comparison
                const userIdStr = user?.id?.toString();
                const likesAsStrings = comment.likes.map((like: any) => 
                  typeof like === 'string' ? like : like?.toString()
                );
                isLikedByUser = likesAsStrings.includes(userIdStr);
              } else if (comment.likes && typeof comment.likes === 'string') {
                // If likes is a single string, check if it matches user ID
                isLikedByUser = comment.likes === user?.id?.toString();
              }
              
              updatedLikedComments[commentId] = isLikedByUser;
            }
          });
        }
      });
      
      setPosts(processedPosts);
      setLikedComments(updatedLikedComments);

    } catch (error) {
      console.error('Error deleting comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      setError(errorMessage);
    }
  };

  // Sort comments based on selected criteria
  const sortComments = (comments: any[], sortBy: 'newest' | 'oldest' | 'most-liked') => {
    const sortedComments = [...comments];
    
    switch (sortBy) {
      case 'newest':
        return sortedComments.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0).getTime();
          const dateB = new Date(b.createdAt || b.date || 0).getTime();
          return dateB - dateA; // Newest first
        });
      case 'oldest':
        return sortedComments.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0).getTime();
          const dateB = new Date(b.createdAt || b.date || 0).getTime();
          return dateA - dateB; // Oldest first
        });
      case 'most-liked':
        return sortedComments.sort((a, b) => {
          const likesA = Array.isArray(a.likes) ? a.likes.length : (a.likes ? 1 : 0);
          const likesB = Array.isArray(b.likes) ? b.likes.length : (b.likes ? 1 : 0);
          return likesB - likesA; // Most liked first
        });
      default:
        return sortedComments;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error || 'Community not found'}</p>
            <Button onClick={() => navigate('/community')} className="bg-primary-600 hover:bg-primary-700">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Communities
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/community')}
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Communities
          </Button>
        </div>

        {/* Community Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {getFullImageUrl(community.image) ? (
              <img
                src={getFullImageUrl(community.image)}
                alt={community.name}
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl bg-primary-100 border-4 border-white shadow-lg flex items-center justify-center">
                <Users className="w-12 h-12 lg:w-16 lg:h-16 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl lg:text-4xl font-bold">{community.name}</h1>
                    {(() => {
                      const isOwner = community.createdBy?._id === user?.id || community.createdBy === user?.id;
                      return isOwner ? (
                        <span className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          👑 Owner
                        </span>
                      ) : isMember ? (
                        <span className="bg-green-500 text-green-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          👥 Member
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-primary-100 text-lg mb-3">{community.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {community.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{community.memberCount || community.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {(() => {
                    const isOwner = community.createdBy?._id === user?.id || community.createdBy === user?.id;
                    
                    if (isOwner) {
                      // Owner actions with enhanced styling
                      return (
                        <>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setShowCreatePost(!showCreatePost)}
                              className="bg-white text-primary-600 hover:bg-gray-100 border-2 border-white hover:border-primary-300"
                            >
                              <Plus className="mr-2 w-4 h-4" />
                              Create Post
                            </Button>
                            <Button
                              variant="outline"
                              className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-primary-600 font-semibold shadow-lg"
                            >
                              <UserPlus className="mr-2 w-4 h-4" />
                              ⚙️ Manage Community
                            </Button>
                          </div>
                          {/* Quick Owner Actions */}
                          <div className="flex gap-2 text-xs">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                              📊 {posts.length} Posts
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                              👥 {community.memberCount || community.members?.length || 0} Members
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                              🔥 Active
                            </span>
                          </div>
                        </>
                      );
                    } else if (isMember) {
                      // Member actions
                      return (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleLeaveCommunity}
                            className="border-white text-white hover:bg-white hover:text-primary-600"
                          >
                            <UserPlus className="mr-2 w-4 h-4" />
                            Leave Community
                          </Button>
                          <Button
                            onClick={() => setShowCreatePost(!showCreatePost)}
                            className="bg-white text-primary-600 hover:bg-gray-100"
                          >
                            <Plus className="mr-2 w-4 h-4" />
                            Create Post
                          </Button>
                        </>
                      );
                    } else {
                      // Non-member actions
                      return (
                        <Button
                          onClick={handleJoinCommunity}
                          className="bg-white text-primary-600 hover:bg-gray-100"
                        >
                          <UserPlus className="mr-2 w-4 h-4" />
                          Join Community
                        </Button>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Create Post Modal */}
        {showCreatePost && isMember && (
          <Card className="p-6 mb-8 bg-white border-primary-200">
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
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <ImageUpload
                onImageSelect={setNewPostImage}
                placeholder="Add a photo to your post"
                className="w-full"
              />
              <div className="flex items-center justify-between">
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
                    disabled={postLoading}
                  >
                    <Send className="mr-2 w-4 h-4" />
                    {postLoading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Posts */}
          <div className="lg:col-span-2">
            {/* Owner Management Stats */}
            {(() => {
              const isOwner = community.createdBy?._id === user?.id || community.createdBy === user?.id;
              return isOwner && user?.role === 'ngo_admin' ? (
                <Card className="p-6 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-yellow-600">⚙️</span>
                      Community Management
                    </h3>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      👑 Owner Dashboard
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Members</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{community.memberCount || community.members?.length || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Posts</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Activity</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">High</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">Created</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                </Card>
              ) : null;
            })()}

            <div className="space-y-6">
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id || post._id} className="p-6">
                    {/* Post Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={post.author?.avatar || 'https://picsum.photos/40/40?random=1'}
                        alt={post.author?.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{post.author?.name || 'Anonymous'}</h4>
                        <p className="text-sm text-gray-500">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title || 'Post'}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{post.content}</p>

                    {/* Post Image */}
                    {post.image && (
                      <img
                        src={getFullImageUrl(post.image)}
                        alt="Post image"
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLikePost(post.id || post._id)}
                          className={`flex items-center space-x-2 text-sm transition-colors ${
                            post.isLiked
                              ? 'text-blue-600 hover:text-blue-700'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{Array.isArray(post.likes) ? post.likes.length : (post.likes ? 1 : 0)}</span>
                        </button>
                        <button 
                          onClick={() => {
                            const postId = post._id || post.id || '';
                            setExpandedComments(prev => ({
                              ...prev,
                              [postId]: !prev[postId]
                            }));
                            // Focus on comment input when expanding
                            if (!expandedComments[postId]) {
                              setTimeout(() => {
                                const commentInput = document.querySelector(`input[data-post-id="${postId}"]`) as HTMLInputElement;
                                if (commentInput) {
                                  commentInput.focus();
                                }
                              }, 100);
                            }
                          }}
                          className={`flex items-center space-x-2 text-sm transition-colors cursor-pointer ${
                            expandedComments[post._id || post.id || ''] 
                              ? 'text-blue-600 hover:text-blue-700' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <MessageCircle className={`w-5 h-5 ${expandedComments[post._id || post.id || ''] ? 'fill-current' : ''}`} />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments - Only show when expanded */}
                    {expandedComments[post._id || post.id || ''] && (
                      <div className="mt-4 pt-4 border-t border-blue-100">
                        {Array.isArray(post.comments) && post.comments.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {/* Comment sorting and count header */}
                            <div className="flex items-center justify-between mb-3 px-2">
                              <span className="text-sm font-medium text-gray-700">
                                {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                              </span>
                              {post.comments.length > 1 && (
                                <select
                                  value={commentSortBy}
                                  onChange={(e) => setCommentSortBy(e.target.value as 'newest' | 'oldest' | 'most-liked')}
                                  className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                  <option value="newest">Newest first</option>
                                  <option value="oldest">Oldest first</option>
                                  <option value="most-liked">Most liked</option>
                                </select>
                              )}
                            </div>

                            {/* Display comments based on sorting and show all toggle */}
                            {(() => {
                              const sortedComments = sortComments(post.comments, commentSortBy);
                              const postId = post._id || post.id || '';
                              const showAll = showAllComments[postId];
                              const commentsToShow = showAll ? sortedComments : sortedComments.slice(0, 2);
                              
                              return commentsToShow.map((comment) => (
                                <div key={comment.id || comment._id} className="flex items-start space-x-3">
                                  <img
                                    src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'User')}&background=6366f1&color=fff&size=32`}
                                    alt={comment.author?.name || 'User'}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900 truncate">{comment.author?.name || 'Anonymous'}</span>
                                      <span className="text-xs text-gray-500 flex-shrink-0">
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 break-words">{comment.content}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <button
                                        onClick={() => handleLikeComment(post._id || post.id || '', comment.id || comment._id || '')}
                                        disabled={commentLikesLoading[comment.id || comment._id || '']}
                                        className={`flex items-center space-x-1 text-xs transition-colors min-h-[32px] min-w-[32px] px-2 py-1 rounded ${
                                          likedComments[comment.id || comment._id || ''] 
                                            ? 'text-red-600 hover:text-red-700' 
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        <Heart className={`w-3 h-3 ${likedComments[comment.id || comment._id || ''] ? 'fill-red-600 text-red-600' : 'text-gray-500'}`} />
                                        <span>
                                          {(() => {
                                            if (Array.isArray(comment.likes)) {
                                              return comment.likes.length;
                                            } else if (comment.likes && typeof comment.likes === 'string') {
                                              return 1; // Single like
                                            } else if (comment.likes) {
                                              return 1; // Some form of like exists
                                            } else {
                                              return 0;
                                            }
                                          })()}
                                        </span>
                                      </button>
                                      {(user?.role === 'admin' || user?.role === 'ngo_admin' || comment.author?._id === user?.id) && (
                                        <button
                                          onClick={() => handleDeleteComment(post._id || post.id || '', comment.id || comment._id || '')}
                                          className="text-xs text-red-600 hover:text-red-700 px-2 py-1 min-h-[32px] min-w-[32px] rounded"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ));
                            })()}

                            {/* View all comments toggle */}
                            {post.comments.length > 2 && (
                              <button 
                                onClick={() => {
                                  const postId = post._id || post.id || '';
                                  setShowAllComments(prev => ({
                                    ...prev,
                                    [postId]: !prev[postId]
                                  }));
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 ml-11 px-2 py-1"
                              >
                                {showAllComments[post._id || post.id || ''] 
                                  ? 'Show less comments' 
                                  : `View all ${post.comments.length} comments`
                                }
                              </button>
                            )}
                          </div>
                        )}

                        {/* Comment Input - Only show when expanded */}
                        <div className="flex items-start space-x-3">
                          <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=32`}
                            alt={user?.name || 'User'}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                data-post-id={post._id || post.id || ''}
                                value={commentInputs[post._id || post.id || ''] || ''}
                                onChange={(e) => setCommentInputs(prev => ({
                                  ...prev,
                                  [post._id || post.id || '']: e.target.value
                                }))}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post._id || post.id || '');
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[40px] sm:min-h-[36px]"
                              />
                              <button
                                onClick={() => handleAddComment(post._id || post.id || '')}
                                disabled={!commentInputs[post._id || post.id || '']?.trim() || commentLoading[post._id || post.id || '']}
                                className="p-2 text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-full hover:bg-primary-50 transition-colors"
                              >
                                <Send className={`w-4 h-4 ${commentLoading[post._id || post.id || ''] ? 'animate-pulse' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-6">
                    {isMember
                      ? 'Be the first to share something with the community!'
                      : 'Join this community to see posts and participate in discussions.'
                    }
                  </p>
                  {isMember && (
                    <Button
                      onClick={() => setShowCreatePost(true)}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Create First Post
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Community Stats</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Members</span>
                  <span className="font-medium text-gray-900">{community.memberCount || community.members?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-medium text-gray-900">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{community.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Community Creator */}
            {community.createdBy && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Created by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {community.createdBy.organizationName || community.createdBy.name || 'NGO Admin'}
                    </p>
                    <p className="text-sm text-gray-600">Community Administrator</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                {isMember ? (
                  <>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 w-4 h-4" />
                      Start Discussion
                    </Button>
                    <Button variant="outline" className="w-full">
                      <UserPlus className="mr-2 w-4 h-4" />
                      Invite Friends
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleJoinCommunity}
                    className="w-full bg-primary-600 hover:bg-primary-700"
                  >
                    <UserPlus className="mr-2 w-4 h-4" />
                    Join Community
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
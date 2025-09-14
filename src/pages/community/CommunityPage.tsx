import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Send,
  UserPlus,
  MessageSquare
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
  createdBy?: string;
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
  likes?: string[]; // Array of user IDs who liked the post
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

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDescription, setNewCommunityDescription] = useState('');
  const [newCommunityCategory, setNewCommunityCategory] = useState('');
  const [newCommunityImage, setNewCommunityImage] = useState<File | null>(null);
  
  // Edit community states
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [editCommunityName, setEditCommunityName] = useState('');
  const [editCommunityDescription, setEditCommunityDescription] = useState('');
  const [editCommunityCategory, setEditCommunityCategory] = useState('');
  const [editCommunityImage, setEditCommunityImage] = useState<File | null>(null);
  
  // Dynamic data states
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [discoverCommunities, setDiscoverCommunities] = useState<Community[]>([]);
  const [ownedCommunities, setOwnedCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User impact statistics
  const [userStats, setUserStats] = useState({
    communitiesJoined: 0,
    postsCreated: 0,
    commentsMade: 0,
    likesReceived: 0
  });

  // Trending topics
  const [trendingTopics, setTrendingTopics] = useState<Array<{tag: string, count: number}>>([]);

  // Discussion states
  const [showStartDiscussion, setShowStartDiscussion] = useState(false);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');
  const [discussionTags, setDiscussionTags] = useState<string[]>([]);
  const [discussionCategory, setDiscussionCategory] = useState('');

  // Current community for posts
  const [currentCommunityId, setCurrentCommunityId] = useState<string | null>(null);

  // Comment states
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});
  const [commentLoading, setCommentLoading] = useState<{[postId: string]: boolean}>({});
  const [expandedComments, setExpandedComments] = useState<{[postId: string]: boolean}>({});
  const [likedComments, setLikedComments] = useState<{[commentId: string]: boolean}>({});
  const [commentLikesLoading, setCommentLikesLoading] = useState<{[commentId: string]: boolean}>({});
  const [commentSortBy, setCommentSortBy] = useState<'newest' | 'oldest' | 'most-liked'>('newest');
  const [showAllComments, setShowAllComments] = useState<{[postId: string]: boolean}>({});

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's communities
        const userCommunitiesResponse = await communityAPI.getUserCommunities();
        const userCommunities = userCommunitiesResponse?.data || [];
        setMyCommunities(Array.isArray(userCommunities) ? userCommunities : []);

        // Fetch NGO specific communities if user is NGO admin
        if (user?.role === 'ngo_admin') {
          try {
            const ownedCommunitiesResponse = await communityAPI.getNGOCommunities();
            const ownedCommunities = ownedCommunitiesResponse?.data || [];
            setOwnedCommunities(Array.isArray(ownedCommunities) ? ownedCommunities : []);

            const joinedCommunitiesResponse = await communityAPI.getNGOJoinedCommunities();
            const joinedCommunities = joinedCommunitiesResponse?.data || [];
            setJoinedCommunities(Array.isArray(joinedCommunities) ? joinedCommunities : []);
          } catch (ngoError) {
            console.error('Error fetching NGO communities:', ngoError);
            setOwnedCommunities([]);
            setJoinedCommunities([]);
          }
        }

        // Fetch all communities for discover and filter out user's own communities
        const allCommunitiesResponse = await communityAPI.getAllCommunities();
        const allCommunities = allCommunitiesResponse?.data || [];
        
        // Filter out communities created by current user
        const filteredDiscoverCommunities = Array.isArray(allCommunities) 
          ? allCommunities.filter(community => {
              const communityCreatorId = community.createdBy?._id || community.createdBy;
              const currentUserId = user?.id;
              return communityCreatorId !== currentUserId;
            })
          : [];
        
        setDiscoverCommunities(filteredDiscoverCommunities);

        // For posts, fetch from a default community or all posts
        // For now, assume posts are from user's communities
        if (Array.isArray(userCommunities) && userCommunities.length > 0) {
          const firstCommunity = userCommunities[0];
          const communityId = firstCommunity?.id || firstCommunity?._id;

          if (communityId) {
            try {
              const communityPostsResponse = await communityAPI.getCommunityPosts(communityId);
              const communityPosts = communityPostsResponse?.data || [];
              const processedPosts = Array.isArray(communityPosts) ? communityPosts : [];
              
              // Initialize likedComments state based on current user's likes
              const initialLikedComments: {[commentId: string]: boolean} = {};
              processedPosts.forEach(post => {
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
              setCurrentCommunityId(communityId);
            } catch (postError) {
              console.error('Error fetching posts:', postError);
              setPosts([]);
              setCurrentCommunityId(null);
            }
          } else {
            console.warn('Community ID is undefined, skipping posts fetch');
            setPosts([]);
            setCurrentCommunityId(null);
          }
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load community data';
        setError(errorMessage);
        // Set empty arrays on error
        setMyCommunities([]);
        setDiscoverCommunities([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      // If no user, set empty state
      setMyCommunities([]);
      setDiscoverCommunities([]);
      setPosts([]);
      setLoading(false);
    }

    // Polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (user && activeTab === 'feed') {
        fetchData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, activeTab]);

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      // For now, we'll calculate stats from available data
      // In a real implementation, you'd have a dedicated API endpoint for user stats
      let totalPosts = 0;
      let totalComments = 0;
      let totalLikes = 0;

      // Count posts from all communities the user has access to
      if (Array.isArray(posts)) {
        posts.forEach(post => {
          if (post.author?.id === user?.id || post.author?._id === user?.id) {
            totalPosts++;
            // Fix: likes is an array, so get its length
            const postLikes = Array.isArray(post.likes) ? post.likes.length : (post.likes ? 1 : 0);
            totalLikes += postLikes;
          }
          
          // Count comments made by user
          if (Array.isArray(post.comments)) {
            post.comments.forEach(comment => {
              if (comment.author?.id === user?.id || comment.author?._id === user?.id) {
                totalComments++;
              }
            });
          }
        });
      }

      setUserStats({
        communitiesJoined: Array.isArray(myCommunities) ? myCommunities.length : 0,
        postsCreated: totalPosts,
        commentsMade: totalComments,
        likesReceived: totalLikes
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback to basic stats
      setUserStats({
        communitiesJoined: Array.isArray(myCommunities) ? myCommunities.length : 0,
        postsCreated: 0,
        commentsMade: 0,
        likesReceived: 0
      });
    }
  };

  // Fetch posts for a specific community
  const fetchPostsForCommunity = async (communityId: string) => {
    try {
      const postsResponse = await communityAPI.getCommunityPosts(communityId);
      const postsData = postsResponse?.data || [];
      
      // Process posts with comment likes
      const processedPosts = postsData.map((post: any) => {
        if (Array.isArray(post.comments)) {
          const updatedComments = post.comments.map((comment: any) => {
            let isLikedByUser = false;
            
            // Check if user liked this comment
            if (Array.isArray(comment.likes)) {
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
            
            return {
              ...comment,
              isLikedByUser
            };
          });
          
          return {
            ...post,
            comments: updatedComments
          };
        }
        
        return post;
      });
      
      setPosts(processedPosts);
      setCurrentCommunityId(communityId);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    }
  };

  // Update user stats when posts or communities change
  useEffect(() => {
    if (user) {
      fetchUserStats();
      calculateTrendingTopics();
    }
  }, [posts, myCommunities, user]);

  // Calculate trending topics from posts
  const calculateTrendingTopics = () => {
    const hashtagCounts: {[key: string]: number} = {};
    
    if (Array.isArray(posts)) {
      posts.forEach(post => {
        if (post.content) {
          // Extract hashtags from post content
          const hashtags = post.content.match(/#\w+/g);
          if (hashtags) {
            hashtags.forEach(tag => {
              hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            });
          }
        }
        
        // Also check comments for hashtags
        if (Array.isArray(post.comments)) {
          post.comments.forEach(comment => {
            if (comment.content) {
              const hashtags = comment.content.match(/#\w+/g);
              if (hashtags) {
                hashtags.forEach(tag => {
                  hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
                });
              }
            }
          });
        }
      });
    }
    
    // Convert to array and sort by count
    const sortedTopics = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 trending topics
    
    setTrendingTopics(sortedTopics);
  };

  const handleCreatePost = async () => {
    if (newPostTitle.trim() && newPostContent.trim()) {
      try {
        setLoading(true);
        setError(null);

        // Get the first community ID from user's communities
        const userCommunities = await communityAPI.getUserCommunities();
        const communities = userCommunities?.data || [];

        if (Array.isArray(communities) && communities.length > 0) {
          const firstCommunity = communities[0];
          const communityId = firstCommunity?.id || firstCommunity?._id;

          if (communityId) {
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

            // Refresh posts data
            const communityPostsResponse = await communityAPI.getCommunityPosts(communityId);
            const communityPosts = communityPostsResponse?.data || [];
            setPosts(Array.isArray(communityPosts) ? communityPosts : []);
          } else {
            setError('Unable to determine community for posting');
          }
        } else {
          setError('You must join a community before creating posts');
        }
      } catch (error) {
        console.error('Error creating post:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateCommunity = async () => {
    if (newCommunityName.trim() && newCommunityDescription.trim() && newCommunityCategory.trim()) {
      try {
        setLoading(true);
        setError(null);

        const communityData = {
          name: newCommunityName.trim(),
          description: newCommunityDescription.trim(),
          category: newCommunityCategory.trim(),
          image: newCommunityImage || undefined,
        };

        await communityAPI.createCommunity(communityData);

        // Clear form
        setNewCommunityName('');
        setNewCommunityDescription('');
        setNewCommunityCategory('');
        setNewCommunityImage(null);
        setShowCreateCommunity(false);

        // Refresh data to show the new community
        const userCommunitiesResponse = await communityAPI.getUserCommunities();
        const userCommunities = userCommunitiesResponse?.data || [];
        setMyCommunities(Array.isArray(userCommunities) ? userCommunities : []);

        // Also refresh discover communities
        const allCommunitiesResponse = await communityAPI.getAllCommunities();
        const allCommunities = allCommunitiesResponse?.data || [];
        
        // Filter out communities created by current user
        const filteredDiscoverCommunities = Array.isArray(allCommunities) 
          ? allCommunities.filter(community => {
              const communityCreatorId = community.createdBy?._id || community.createdBy;
              const currentUserId = user?.id;
              return communityCreatorId !== currentUserId;
            })
          : [];
        
        setDiscoverCommunities(filteredDiscoverCommunities);

      } catch (error) {
        console.error('Error creating community:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleJoinCommunity = async (communityId?: string) => {
    if (!communityId) {
      setError('Invalid community ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await communityAPI.joinCommunity(communityId);

      // Refresh user's communities to show the joined community
      const userCommunitiesResponse = await communityAPI.getUserCommunities();
      const userCommunities = userCommunitiesResponse?.data || [];
      setMyCommunities(Array.isArray(userCommunities) ? userCommunities : []);

      // Also refresh discover communities to update member counts
      const allCommunitiesResponse = await communityAPI.getAllCommunities();
      const allCommunities = allCommunitiesResponse?.data || [];
      
      // Filter out communities created by current user
      const filteredDiscoverCommunities = Array.isArray(allCommunities) 
        ? allCommunities.filter(community => {
            const communityCreatorId = community.createdBy?._id || community.createdBy;
            const currentUserId = user?.id;
            return communityCreatorId !== currentUserId;
          })
        : [];
      
      setDiscoverCommunities(filteredDiscoverCommunities);

    } catch (error) {
      console.error('Error joining community:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join community';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId?: string) => {
    if (!postId) {
      setError('Invalid post ID');
      return;
    }

    try {
      // Get the first community ID from user's communities
      const userCommunities = await communityAPI.getUserCommunities();
      const communities = userCommunities?.data || [];

      if (Array.isArray(communities) && communities.length > 0) {
        const firstCommunity = communities[0];
        const communityId = firstCommunity?.id || firstCommunity?._id;

        if (communityId) {
          await communityAPI.likePost(communityId, postId);

          // Refresh posts to show updated like count
          const communityPostsResponse = await communityAPI.getCommunityPosts(communityId);
          const communityPosts = communityPostsResponse?.data || [];
          setPosts(Array.isArray(communityPosts) ? communityPosts : []);
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to like post';
      setError(errorMessage);
    }
  };

  const handleEditCommunity = async (communityId?: string) => {
    if (!communityId) {
      setError('Invalid community ID');
      return;
    }

    // Find the community to edit
    const community = myCommunities.find(c => (c.id || c._id) === communityId);
    if (!community) {
      setError('Community not found');
      return;
    }

    // Set edit form values
    setEditingCommunity(community);
    setEditCommunityName(community.name);
    setEditCommunityDescription(community.description);
    setEditCommunityCategory(community.category);
    setEditCommunityImage(null); // Reset image selection
    setShowEditCommunity(true);
  };

  const handleDeleteCommunity = async (communityId?: string) => {
    if (!communityId) {
      setError('Invalid community ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);

        await communityAPI.deleteCommunity(communityId);

        // Refresh communities list
        const userCommunitiesResponse = await communityAPI.getUserCommunities();
        const userCommunities = userCommunitiesResponse?.data || [];
        setMyCommunities(Array.isArray(userCommunities) ? userCommunities : []);

        // Also refresh discover communities
        const allCommunitiesResponse = await communityAPI.getAllCommunities();
        const allCommunities = allCommunitiesResponse?.data || [];
        
        // Filter out communities created by current user
        const filteredDiscoverCommunities = Array.isArray(allCommunities) 
          ? allCommunities.filter(community => {
              const communityCreatorId = community.createdBy?._id || community.createdBy;
              const currentUserId = user?.id;
              return communityCreatorId !== currentUserId;
            })
          : [];
        
        setDiscoverCommunities(filteredDiscoverCommunities);

        alert('Community deleted successfully');
      } catch (error) {
        console.error('Error deleting community:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete community';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateCommunity = async () => {
    if (!editingCommunity) return;

    if (editCommunityName.trim() && editCommunityDescription.trim() && editCommunityCategory.trim()) {
      try {
        setLoading(true);
        setError(null);

        const communityId = editingCommunity.id || editingCommunity._id;
        if (!communityId) {
          setError('Invalid community ID');
          return;
        }

        const updateData = {
          name: editCommunityName.trim(),
          description: editCommunityDescription.trim(),
          category: editCommunityCategory.trim(),
          image: editCommunityImage || undefined,
        };

        await communityAPI.updateCommunity(communityId, updateData);

        // Clear form and close modal
        setEditCommunityName('');
        setEditCommunityDescription('');
        setEditCommunityCategory('');
        setEditCommunityImage(null);
        setEditingCommunity(null);
        setShowEditCommunity(false);

        // Refresh communities list
        const userCommunitiesResponse = await communityAPI.getUserCommunities();
        const userCommunities = userCommunitiesResponse?.data || [];
        setMyCommunities(Array.isArray(userCommunities) ? userCommunities : []);

        // Also refresh discover communities
        const allCommunitiesResponse = await communityAPI.getAllCommunities();
        const allCommunities = allCommunitiesResponse?.data || [];
        
        // Filter out communities created by current user
        const filteredDiscoverCommunities = Array.isArray(allCommunities) 
          ? allCommunities.filter(community => {
              const communityCreatorId = community.createdBy?._id || community.createdBy;
              const currentUserId = user?.id;
              return communityCreatorId !== currentUserId;
            })
          : [];
        
        setDiscoverCommunities(filteredDiscoverCommunities);

        alert('Community updated successfully!');
      } catch (error) {
        console.error('Error updating community:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update community';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle adding a comment to a post
  const handleAddComment = async (postId: string) => {
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent || !currentCommunityId) return;

    try {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));

      await communityAPI.commentOnPost(currentCommunityId, postId, commentContent);

      // Clear the input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));

      // Refresh posts to show the new comment
      const postsResponse = await communityAPI.getCommunityPosts(currentCommunityId);
      const postsData = postsResponse?.data || [];
      const processedPosts = Array.isArray(postsData) ? postsData : [];
      
      // Update likedComments state after refresh
      const updatedLikedComments: {[commentId: string]: boolean} = {};
      processedPosts.forEach(post => {
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
      setError('Failed to add comment');
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle liking/unliking a comment
  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!currentCommunityId) return;

    try {
      setCommentLikesLoading(prev => ({ ...prev, [commentId]: true }));

      const response = await communityAPI.likeComment(currentCommunityId, postId, commentId);
      const { isLiked } = response.data;

      setLikedComments(prev => ({
        ...prev,
        [commentId]: isLiked
      }));

      // Refresh posts to get updated like counts
      const postsResponse = await communityAPI.getCommunityPosts(currentCommunityId);
      const postsData = postsResponse?.data || [];
      const processedPosts = Array.isArray(postsData) ? postsData : [];
      
      // Update likedComments state after refresh
      const updatedLikedComments: {[commentId: string]: boolean} = {};
      processedPosts.forEach(post => {
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
      setError('Failed to like comment');
    } finally {
      setCommentLikesLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle starting a new discussion
  const handleStartDiscussion = async () => {
    if (!discussionTitle.trim() || !discussionContent.trim()) {
      setError('Please provide both title and content for the discussion');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a discussion post with special formatting
      const discussionData = {
        title: `💬 ${discussionTitle}`,
        content: `${discussionContent}\n\n---\n*Discussion started by ${user?.name || 'Anonymous'}*`,
        image: undefined,
        tags: discussionTags,
        category: discussionCategory || 'Discussion',
        isDiscussion: true
      };

      // For now, we'll create it as a regular post in the first available community
      // In a real implementation, you might want to create discussions in a special "Discussions" community
      if (Array.isArray(myCommunities) && myCommunities.length > 0) {
        const targetCommunity = myCommunities[0];
        const communityId = targetCommunity?.id || targetCommunity?._id;

        if (communityId) {
          await communityAPI.createPost(communityId, discussionData);

          // Clear form
          setDiscussionTitle('');
          setDiscussionContent('');
          setDiscussionTags([]);
          setDiscussionCategory('');
          setShowStartDiscussion(false);

          // Refresh posts
          await fetchPostsForCommunity(communityId);

          alert('Discussion started successfully!');
        } else {
          setError('No valid community found to start discussion');
        }
      } else {
        setError('You need to join a community first to start a discussion');
      }

    } catch (error) {
      console.error('Error starting discussion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start discussion';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a comment (moderation)
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!currentCommunityId) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await communityAPI.deleteComment(currentCommunityId, postId, commentId);

      // Refresh posts to remove the deleted comment
      const postsResponse = await communityAPI.getCommunityPosts(currentCommunityId);
      const postsData = postsResponse?.data || [];
      const processedPosts = Array.isArray(postsData) ? postsData : [];
      
      // Update likedComments state after refresh (remove deleted comment's like status)
      const updatedLikedComments: {[commentId: string]: boolean} = {};
      processedPosts.forEach(post => {
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
      setError('Failed to delete comment');
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

  return (
    <div className="min-h-screen bg-primary-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold flex items-center space-x-3 text-primary-700 animate-fade-in">
              <div className="p-3 bg-primary-600 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span>Community</span>
            </h1>
            <p className="text-gray-600 mt-3 text-lg animate-fade-in-up">
              {user?.role === 'ngo_admin' 
                ? 'Manage and engage with your communities' 
                : 'Connect, share, and grow together with fellow volunteers'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreatePost(!showCreatePost)} 
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="mr-2 w-4 h-4" />
              Create Post
            </Button>
            {user?.role === 'ngo_admin' && (
              <Button 
                onClick={() => setShowCreateCommunity(!showCreateCommunity)} 
                variant="outline"
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                <Users className="mr-2 w-4 h-4" />
                Create Community
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-white p-2 rounded-lg mb-12 shadow-lg border border-primary-200">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'feed' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            Feed
          </button>
          
          {user?.role === 'ngo_admin' ? (
            <>
              <button
                onClick={() => setActiveTab('my-owned-communities')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'my-owned-communities' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                My Communities
              </button>
              <button
                onClick={() => setActiveTab('my-joined-communities')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'my-joined-communities' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                Joined Communities
              </button>
            </>
          ) : user?.role === 'volunteer' ? (
            <>
              <button
                onClick={() => setActiveTab('my-communities')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'my-communities' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                My Communities
              </button>
              <button
                onClick={() => setActiveTab('volunteer-hub')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'volunteer-hub' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                🏆 Volunteer Hub
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('my-communities')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my-communities' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              My Communities
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discover' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            Discover
          </button>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <Card className="p-6 mb-8 bg-primary-50 border-primary-200">
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
                  >
                    <Send className="mr-2 w-4 h-4" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Create Community Modal */}
        {showCreateCommunity && user?.role === 'ngo_admin' && (
          <Card className="p-6 mb-8 bg-primary-50 border-primary-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Create a New Community</h3>
            <div className="space-y-4">
              <Input
                placeholder="Community name"
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
              />
              <Input
                placeholder="Category (e.g., Environment, Education)"
                value={newCommunityCategory}
                onChange={(e) => setNewCommunityCategory(e.target.value)}
              />
              <div>
                <textarea
                  placeholder="Describe your community..."
                  value={newCommunityDescription}
                  onChange={(e) => setNewCommunityDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <ImageUpload
                onImageSelect={setNewCommunityImage}
                placeholder="Upload community image"
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateCommunity(false)}
                    className="text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleCreateCommunity}
                  >
                    <Users className="mr-2 w-4 h-4" />
                    Create Community
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Edit Community Modal */}
        {showEditCommunity && user?.role === 'ngo_admin' && editingCommunity && (
          <Card className="p-6 mb-8 bg-primary-50 border-primary-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Edit Community</h3>
            <div className="space-y-4">
              <Input
                placeholder="Community name"
                value={editCommunityName}
                onChange={(e) => setEditCommunityName(e.target.value)}
              />
              <Input
                placeholder="Category (e.g., Environment, Education)"
                value={editCommunityCategory}
                onChange={(e) => setEditCommunityCategory(e.target.value)}
              />
              <div>
                <textarea
                  placeholder="Describe your community..."
                  value={editCommunityDescription}
                  onChange={(e) => setEditCommunityDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-primary-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <ImageUpload
                onImageSelect={setEditCommunityImage}
                currentImage={editingCommunity?.image}
                placeholder="Change community image"
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditCommunity(false);
                      setEditingCommunity(null);
                      setEditCommunityName('');
                      setEditCommunityDescription('');
                      setEditCommunityCategory('');
                      setEditCommunityImage(null);
                    }}
                    className="text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateCommunity}
                  >
                    <Users className="mr-2 w-4 h-4" />
                    Update Community
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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading feed...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading feed: {error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : Array.isArray(posts) && posts.length > 0 ? (
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
                  <div className="text-center py-8">
                    <p className="text-gray-600">No posts in your feed yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Join communities to see posts from others!</p>
                  </div>
                )}
              </div>
            )}

            {/* NGO Owned Communities Tab */}
            {activeTab === 'my-owned-communities' && user?.role === 'ngo_admin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Created Communities ({Array.isArray(ownedCommunities) ? ownedCommunities.length : 0})
                  </h2>
                  <Button size="sm" onClick={() => setShowStartDiscussion(true)}>
                    <MessageSquare className="mr-2 w-4 h-4" />
                    Start Discussion
                  </Button>
                </div>
                {Array.isArray(ownedCommunities) && ownedCommunities.length > 0 ? (
                  ownedCommunities.map((community) => (
                    <Card key={community.id || community._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {getFullImageUrl(community.image) ? (
                          <img
                            src={getFullImageUrl(community.image)}
                            alt={community.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <span className="text-yellow-600">👑</span>
                                <span>Owner</span>
                              </span>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {community.category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{community.memberCount || community.members?.length || 0} members</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{community.memberCount || community.members?.length || 0} members</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Link to={`/communities/${community.id || community._id}`}>
                                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                                  <span className="mr-1">⚙️</span>
                                  Manage
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditCommunity(community.id || community._id)}
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteCommunity(community.id || community._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You haven't created any communities yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first community to get started!</p>
                    <Button 
                      onClick={() => setShowCreateCommunity(true)} 
                      className="mt-4 bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Create Community
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* NGO Joined Communities Tab */}
            {activeTab === 'my-joined-communities' && user?.role === 'ngo_admin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Joined Communities ({Array.isArray(joinedCommunities) ? joinedCommunities.length : 0})
                  </h2>
                  <Button size="sm" onClick={() => setShowStartDiscussion(true)}>
                    <MessageSquare className="mr-2 w-4 h-4" />
                    Start Discussion
                  </Button>
                </div>
                {Array.isArray(joinedCommunities) && joinedCommunities.length > 0 ? (
                  joinedCommunities.map((community) => (
                    <Card key={community.id || community._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {getFullImageUrl(community.image) ? (
                          <img
                            src={getFullImageUrl(community.image)}
                            alt={community.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                👥 Member
                              </span>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {community.category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Users className="w-4 h-4" />
                              <span>{community.memberCount || community.members?.length || 0} members</span>
                            </div>
                            <div className="flex space-x-2">
                              <Link to={`/communities/${community.id || community._id}`}>
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You haven't joined any communities yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Check out the Discover tab to find communities to join!</p>
                  </div>
                )}
              </div>
            )}

            {/* Regular User My Communities Tab */}
            {activeTab === 'my-communities' && user?.role !== 'ngo_admin' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading your communities...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading communities: {error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        My Communities ({Array.isArray(myCommunities) ? myCommunities.length : 0})
                      </h2>
                      <Button size="sm" onClick={() => setShowStartDiscussion(true)}>
                        <MessageSquare className="mr-2 w-4 h-4" />
                        Start Discussion
                      </Button>
                    </div>
                    {Array.isArray(myCommunities) && myCommunities.length > 0 ? (
                      myCommunities.map((community) => (
                        <Card key={community.id || community._id} className="p-6">
                          <div className="flex items-start space-x-4">
                            {getFullImageUrl(community.image) ? (
                              <img
                                src={getFullImageUrl(community.image)}
                                alt={community.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                                <Users className="w-8 h-8 text-primary-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
                                  {(() => {
                                    const isOwner = community.createdBy === user?.id;
                                    return isOwner ? (
                                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                        👑 Owner
                                      </span>
                                    ) : (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        👥 Member
                                      </span>
                                    );
                                  })()}
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {community.category}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Users className="w-4 h-4" />
                                  <span>{community.memberCount || community.members?.length || 0} members</span>
                                </div>
                                <div className="flex space-x-2">
                                  <Link to={`/communities/${community.id || community._id}`}>
                                    <Button size="sm" variant="outline">
                                      View
                                    </Button>
                                  </Link>
                                  <Button size="sm">
                                    <MessageSquare className="mr-2 w-4 h-4" />
                                    Active
                                  </Button>
                                  {(() => {
                                    const isOwner = community.createdBy === user?.id;
                                    return isOwner && user?.role === 'ngo_admin' ? (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleEditCommunity(community.id || community._id)}
                                        >
                                          Edit
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="text-red-600 hover:text-red-700"
                                          onClick={() => handleDeleteCommunity(community.id || community._id)}
                                        >
                                          Delete
                                        </Button>
                                      </>
                                    ) : null;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">You haven't joined any communities yet.</p>
                        <p className="text-sm text-gray-500 mt-1">Check out the Discover tab to find communities to join!</p>
                      </div>
                    )}
                  </>
                )}
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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading communities...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading communities: {error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : Array.isArray(discoverCommunities) && discoverCommunities.length > 0 ? (
                  discoverCommunities.map((community) => (
                    <Card key={community.id || community._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {getFullImageUrl(community.image) ? (
                          <img
                            src={getFullImageUrl(community.image)}
                            alt={community.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary-600" />
                          </div>
                        )}
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
                              <span>{community.memberCount || community.members?.length || 0} members</span>
                            </div>
                            <div className="flex space-x-2">
                              <Link to={`/communities/${community.id || community._id}`}>
                                <Button size="sm" variant="outline">
                                  Preview
                                </Button>
                              </Link>
                              {(() => {
                                const isOwner = community.createdBy === user?.id;
                                const isAlreadyMember = user?.id ? community.members?.includes(user.id) : false;
                                
                                if (isOwner) {
                                  return (
                                    <Button size="sm" variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                                      👑 Owner
                                    </Button>
                                  );
                                } else if (isAlreadyMember) {
                                  return (
                                    <Button size="sm" variant="outline" className="bg-green-50 border-green-300 text-green-700">
                                      👥 Member
                                    </Button>
                                  );
                                } else {
                                  return (
                                    <Button
                                      size="sm"
                                      onClick={() => handleJoinCommunity(community.id || community._id)}
                                    >
                                      <UserPlus className="mr-2 w-4 h-4" />
                                      Join
                                    </Button>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No communities available at the moment.</p>
                    <p className="text-sm text-gray-500 mt-1">Check back later or create your own community!</p>
                  </div>
                )}
              </div>
            )}

            {/* Volunteer Hub Tab */}
            {activeTab === 'volunteer-hub' && user?.role === 'volunteer' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Volunteer Hub</h2>
                  <p className="text-gray-600">Track your volunteer journey and connect with like-minded individuals</p>
                </div>

                {/* Volunteer Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="text-3xl mb-2">🌟</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Impact Score</h3>
                    <p className="text-2xl font-bold text-green-600">{userStats.postsCreated * 10 + userStats.commentsMade * 5}</p>
                    <p className="text-sm text-gray-600">Based on your activity</p>
                  </Card>

                  <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <div className="text-3xl mb-2">🤝</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Communities</h3>
                    <p className="text-2xl font-bold text-blue-600">{userStats.communitiesJoined}</p>
                    <p className="text-sm text-gray-600">Active memberships</p>
                  </Card>

                  <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <div className="text-3xl mb-2">💬</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Discussions</h3>
                    <p className="text-2xl font-bold text-purple-600">{userStats.postsCreated + userStats.commentsMade}</p>
                    <p className="text-sm text-gray-600">Contributions made</p>
                  </Card>
                </div>

                {/* Volunteer Achievements */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <span className="text-yellow-500">🏅</span>
                    Your Achievements
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {userStats.communitiesJoined >= 1 && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-2xl">🌱</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Community Member</h4>
                          <p className="text-sm text-gray-600">Joined your first community</p>
                        </div>
                      </div>
                    )}
                    {userStats.postsCreated >= 1 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-2xl">📝</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Content Creator</h4>
                          <p className="text-sm text-gray-600">Created your first post</p>
                        </div>
                      </div>
                    )}
                    {userStats.commentsMade >= 5 && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-2xl">💬</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Active Discussant</h4>
                          <p className="text-sm text-gray-600">Made 5+ comments</p>
                        </div>
                      </div>
                    )}
                    {userStats.likesReceived >= 10 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <span className="text-2xl">❤️</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Community Favorite</h4>
                          <p className="text-sm text-gray-600">Received 10+ likes</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {userStats.communitiesJoined === 0 && userStats.postsCreated === 0 && userStats.commentsMade === 0 && (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-4 block">🚀</span>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Start Your Journey</h4>
                      <p className="text-gray-600 mb-4">Join communities and start contributing to earn your first achievements!</p>
                      <Button onClick={() => setActiveTab('discover')} className="bg-green-600 hover:bg-green-700">
                        Discover Communities
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Quick Volunteer Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setShowStartDiscussion(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <MessageSquare className="mr-2 w-4 h-4" />
                      Start Discussion
                    </Button>
                    <Button
                      onClick={() => setActiveTab('discover')}
                      variant="outline"
                      className="w-full"
                    >
                      <Search className="mr-2 w-4 h-4" />
                      Find Communities
                    </Button>
                  </div>
                </Card>
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
                  <span className="font-medium text-gray-900">{userStats.communitiesJoined}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts Created</span>
                  <span className="font-medium text-gray-900">{userStats.postsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments Made</span>
                  <span className="font-medium text-gray-900">{userStats.commentsMade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes Received</span>
                  <span className="font-medium text-gray-900">{userStats.likesReceived}</span>
                </div>
              </div>
            </Card>

            {/* Trending Topics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Trending Topics</h3>
              <div className="space-y-3">
                {trendingTopics.length > 0 ? (
                  trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-blue-600 hover:text-blue-700 cursor-pointer">{topic.tag}</span>
                      <span className="text-sm text-gray-500">{topic.count} posts</span>
                    </div>
                  ))
                ) : (
                  ['#BeachCleanup', '#EducationForAll', '#ClimateAction', '#VolunteerLife', '#CommunitySupport'].map((tag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-blue-600 hover:text-blue-700 cursor-pointer">{tag}</span>
                      <span className="text-sm text-gray-500">{Math.floor(Math.random() * 100) + 20} posts</span>
                    </div>
                  ))
                )}
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
                <Button variant="outline" className="w-full" onClick={() => setShowStartDiscussion(true)}>
                  <MessageSquare className="mr-2 w-4 h-4" />
                  Start Discussion
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Start Discussion Modal */}
      {showStartDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Start a Discussion
                </h3>
                <button
                  onClick={() => setShowStartDiscussion(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discussion Title *
                  </label>
                  <Input
                    placeholder="What's your discussion about?"
                    value={discussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discussion Content *
                  </label>
                  <textarea
                    placeholder="Share your thoughts, ask questions, or start a conversation..."
                    value={discussionContent}
                    onChange={(e) => setDiscussionContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category (Optional)
                  </label>
                  <select
                    value={discussionCategory}
                    onChange={(e) => setDiscussionCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="General">General Discussion</option>
                    <option value="Events">Events & Activities</option>
                    <option value="Volunteering">Volunteering</option>
                    <option value="Environment">Environment</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health & Wellness</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    Your discussion will be posted in your first joined community
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowStartDiscussion(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStartDiscussion}
                      disabled={loading || !discussionTitle.trim() || !discussionContent.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Starting...' : 'Start Discussion'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
import Post from '../models/Post.js';
import Sheet from '../models/Sheet.js';
import { ApiError, asyncHandler, ApiResponse } from '../utils/helpers.js';
import { POST_STATUS, POSTING_RESULTS } from '../utils/constants.js';
import { generateArticleWithClaude, generateSeoMetadata } from '../services/aiService.js';

// Create post (initiate article generation)
export const createPost = asyncHandler(async (req, res) => {
  const { keywords, selectedSites, scheduledTime, targetUrl } = req.body;

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    throw new ApiError(400, 'Keywords are required');
  }

  const title = `AI Generating: ${keywords.join(', ')}`;

  if (!selectedSites || !Array.isArray(selectedSites) || selectedSites.length === 0) {
    throw new ApiError(400, 'At least one site must be selected');
  }

  // Verify selected sites belong to user or are platform sites
  const sites = await Sheet.find({ _id: { $in: selectedSites } });
  if (sites.length !== selectedSites.length) {
    throw new ApiError(404, 'One or more sites not found');
  }

  const post = await Post.create({
    title,
    keywords,
    author: req.user._id,
    selectedSites,
    targetUrl,
    status: POST_STATUS.GENERATING,
    isScheduled: !!scheduledTime,
    scheduledTime: scheduledTime || null,
    content: '', // Will be populated by AI
  });

  res.status(201).json(
    new ApiResponse(201, post, 'Post created. Generating content...')
  );

  // Generate article in background
  generateAndSaveArticle(post._id, title, keywords, targetUrl);
});

// Background function to generate article
const generateAndSaveArticle = async (postId, tempTitle, keywords, targetUrl = null) => {
  try {
    let context = `Make sure to include an engaging <h1> tag containing the article title at the very beginning.`;
    
    if (targetUrl) {
      context += ` IMPORTANT: You MUST contextually insert a backlink to "${targetUrl}" using one of these keywords as anchor text: ${keywords.join(', ')}. Use natural phrasing.`;
    }

    const response = await generateArticleWithClaude(keywords, context);

    let finalTitle = tempTitle;
    const h1Match = response.content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    
    if (h1Match && h1Match[1]) {
      finalTitle = h1Match[1].replace(/<[^>]+>/g, '').trim();
    }

    const metadata = await generateSeoMetadata(finalTitle, response.content);
    
    if (finalTitle === tempTitle && metadata.seoTitle) {
      finalTitle = metadata.seoTitle;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title: finalTitle,
        content: response.content,
        status: POST_STATUS.GENERATED,
        metadata,
      },
      { new: true }
    );

    console.log(`✅ Article generated for post ${postId}`);

    // Auto-publish if flag is set
    if (updatedPost.autoPublish) {
      console.log(`🚀 Auto-publishing post ${postId}...`);
      await publishToSites(postId);
    }
  } catch (error) {
    console.error(`❌ Article generation failed for post ${postId}:`, error.message);
    await Post.findByIdAndUpdate(postId, {
      status: POST_STATUS.FAILED,
    });
  }
};

// Create bulk posts
export const createBulkPosts = asyncHandler(async (req, res) => {
  const { posts } = req.body; 

  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    throw new ApiError(400, 'Posts array is required');
  }

  const createdPosts = [];

  for (const postData of posts) {
    const { keywords, selectedSites, targetUrl } = postData;

    if (!keywords || keywords.length === 0 || !selectedSites || selectedSites.length === 0) {
      continue; // Skip invalid entries
    }

    const title = `AI Generating: ${keywords.join(', ')}`;

    const post = await Post.create({
      title,
      keywords,
      author: req.user._id,
      selectedSites,
      targetUrl,
      autoPublish: true, // Default to true for bulk creation
      status: POST_STATUS.GENERATING,
    });

    generateAndSaveArticle(post._id, title, keywords, targetUrl);
    createdPosts.push(post);
  }

  res.status(201).json(
    new ApiResponse(201, { count: createdPosts.length }, `${createdPosts.length} posts initiated with auto-publish.`)
  );
});

// Get all posts
export const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, author } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  // Users can only see their own posts unless they're admin
  if (req.user.role !== 'SUPER_ADMIN') {
    query.author = req.user._id;
  } else if (author) {
    query.author = author;
  }

  if (status) query.status = status;

  const posts = await Post.find(query)
    .skip(skip)
    .limit(Number(limit))
    .populate('author', 'name email')
    .populate('selectedSites', 'siteName')
    .sort({ createdAt: -1 });

  const total = await Post.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    }, 'Posts fetched successfully')
  );
});

// Get single post
export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate('author', 'name email')
    .populate('selectedSites')
    .populate('postingResults.site', 'siteName siteUrl');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  // Check authorization
  if (post.author._id.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Unauthorized to view this post');
  }

  res.status(200).json(
    new ApiResponse(200, post, 'Post fetched successfully')
  );
});

// Update post (before publishing)
export const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, content, keywords, selectedSites } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  // Only author or admin can update
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Unauthorized to update this post');
  }

  if (post.status !== POST_STATUS.GENERATED && post.status !== POST_STATUS.DRAFT) {
    throw new ApiError(400, 'Cannot update post that is already posted');
  }

  Object.assign(post, { title, content, keywords, selectedSites });
  await post.save();

  res.status(200).json(
    new ApiResponse(200, post, 'Post updated successfully')
  );
});

// Publish/Auto-post to selected sites
export const publishPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).populate('selectedSites');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (post.status !== POST_STATUS.GENERATED) {
    throw new ApiError(400, 'Post must be in GENERATED status to publish');
  }

  // Update status to POSTING
  post.status = POST_STATUS.POSTING;

  // Initialize posting results
  post.postingResults = post.selectedSites.map((site) => ({
    site: site._id,
    status: POSTING_RESULTS.PENDING,
  }));

  await post.save();

  res.status(200).json(
    new ApiResponse(200, post, 'Publishing started...')
  );

  // Auto-post to sites in background
  publishToSites(postId);
});

// Background function to post to all sites
const publishToSites = async (postId) => {
  try {
    const post = await Post.findById(postId).populate('selectedSites', 'type credentials siteUrl');

    for (let i = 0; i < post.selectedSites.length; i++) {
      const site = post.selectedSites[i];

      try {
        // Post to WordPress/custom sites
        const postUrl = await postToSite(site, post);

        post.postingResults[i] = {
          site: site._id,
          status: POSTING_RESULTS.SUCCESS,
          postUrl,
          postedAt: new Date(),
        };
      } catch (error) {
        post.postingResults[i] = {
          site: site._id,
          status: POSTING_RESULTS.FAILED,
          errorMessage: error.message,
        };
      }
    }

    post.status = POST_STATUS.COMPLETED;
    await post.save();

    console.log(`✅ Post ${postId} published to all sites`);
  } catch (error) {
    console.error(`❌ Publishing failed for post ${postId}:`, error.message);
    await Post.findByIdAndUpdate(postId, {
      status: POST_STATUS.FAILED,
    });
  }
};

// Function to post to individual site (WordPress/API)
const postToSite = async (site, post) => {
  if (site.type === 'WORDPRESS' || site.type === 'WOO_COMMERCE') {
    const { username, password } = site.credentials;
    const siteUrl = site.siteUrl.replace(/\/$/, ''); // Remove trailing slash
    const apiUrl = `${siteUrl}/wp-json/wp/v2/posts`;

    try {
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      
      const response = await axios.post(
        apiUrl,
        {
          title: post.title,
          content: post.content,
          status: 'publish', // Or 'draft' depending on requirements
          // You can also add categories, tags, etc. if needed
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.link; // Return the public post URL
    } catch (error) {
      console.error(`WordPress API Error (${site.siteUrl}):`, error.response?.data || error.message);
      throw new Error(`WordPress error: ${error.response?.data?.message || error.message}`);
    }
  }

  throw new Error(`Site type ${site.type} posting not implemented`);
};

// Delete post
export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Unauthorized to delete this post');
  }

  await Post.findByIdAndDelete(postId);

  res.status(200).json(
    new ApiResponse(200, {}, 'Post deleted successfully')
  );
});

// Get post history/logs
export const getPostHistory = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate('postingResults.site', 'siteName siteUrl');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  res.status(200).json(
    new ApiResponse(200, post.postingResults, 'Post history fetched successfully')
  );
});

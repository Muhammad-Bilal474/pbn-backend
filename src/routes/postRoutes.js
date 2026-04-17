import express from 'express';
import {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  publishPost,
  deletePost,
  getPostHistory,
} from '../controllers/postController.js';
import {
  authenticate,
} from '../middleware/auth.js';
import {
  validatePostCreation,
  handleValidationErrors,
} from '../middleware/validation.js';

const router = express.Router();

// All post routes require authentication
router.use(authenticate);

// Get all posts
router.get('/', getAllPosts);

// Create post
router.post('/', validatePostCreation, handleValidationErrors, createPost);

// Get single post
router.get('/:postId', getPost);

// Update post
router.put('/:postId', updatePost);

// Publish/Auto-post
router.post('/:postId/publish', publishPost);

// Get post history
router.get('/:postId/history', getPostHistory);

// Delete post
router.delete('/:postId', deletePost);

export default router;

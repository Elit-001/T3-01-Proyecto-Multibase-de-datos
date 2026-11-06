const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews.controller');

// Endpoints CRUD para Reseñas / Reviews (MongoDB)
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.post('/', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;


const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query.controller');
const { authenticate, requireAdmin, requireSupportOrAdmin } = require('../middlewares/dashboardAuth.middleware');

// Create a query - Support or Admin
router.post('/', authenticate, requireSupportOrAdmin, queryController.createQuery);
// List queries with pagination - Support or Admin
router.get('/', authenticate, requireSupportOrAdmin, queryController.listQueries);
// Update a query - Support or Admin
router.put('/:id', authenticate, requireSupportOrAdmin, queryController.updateQuery);
// Delete a query - Admin only
router.delete('/:id', authenticate, requireAdmin, queryController.deleteQuery);

module.exports = router;

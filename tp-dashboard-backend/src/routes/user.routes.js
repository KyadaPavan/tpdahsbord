const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireAdmin, requireSupportOrAdmin } = require('../middlewares/dashboardAuth.middleware');

//  /api/users/search?query=abc
router.get('/search', authenticate, requireSupportOrAdmin, userController.searchUsers);
router.get('/:userId', authenticate, requireSupportOrAdmin, userController.getUserById);
router.put('/:userId', authenticate, requireAdmin, userController.updateUserById);

module.exports = router;
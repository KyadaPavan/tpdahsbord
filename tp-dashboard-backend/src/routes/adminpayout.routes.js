const express = require('express');
const router = express.Router();
const adminPayoutController = require('../controllers/adminpayout');
const { authenticate, requireAdmin } = require('../middlewares/dashboardAuth.middleware');

router.get('/:contract_unique_id', authenticate, requireAdmin, adminPayoutController.getContractByUniqueId);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getContractById } = require('../controllers/contract.controller');
const { updateContract } = require('../controllers/contract.controller');
const { authenticate, requireAdmin, requireSupportOrAdmin } = require('../middlewares/dashboardAuth.middleware');

router.get('/:contractId', authenticate, requireSupportOrAdmin, getContractById);
router.put('/:contractId', authenticate, requireAdmin, updateContract);

module.exports = router;

const AdminPayout = require('../models/adminpayout.modle');
const { logActivity } = require('../utils/activityLogger');

exports.getContractByUniqueId = async (req, res) => {
  try {
    const { contract_unique_id } = req.params;
    if (!contract_unique_id) {
      return res.status(400).json({
        success: false,
        message: 'contract_unique_id is required'
      });
    }

    // fetch the details by contract_unique_id
    const contract = await AdminPayout.findOne({ contract_unique_id }).lean();

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'No contract found with the provided contract_unique_id'
      });
    }

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching contract by contract_unique_id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error '
    });
  }
};
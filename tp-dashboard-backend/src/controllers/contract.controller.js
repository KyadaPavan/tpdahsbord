const Contract = require('../models/contract.model');
const Milestone = require('../models/milestone.model');
const User = require('../models/user.model');
const { logActivity, getChanges, sanitizeData } = require('../utils/activityLogger');

//  to fromat the date and time 
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// to get the contrract id by contract id
exports.getContractById = async (req, res) => {
  try {
    const contractId = req.params.contractId;

    const contract = await Contract.findOne({ contract_unique_id: contractId });

    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Fetch milestone data by using contract id and fetching from milestone 
    const milestone = await Milestone.findOne({ contract_id: contract._id });

    // Fetch buyer and seller user details
    let buyerUsername = null;
    let sellerUsername = null;
    try {
      if (contract.buyer) {
        const buyerUser = await User.findById(contract.buyer);
        buyerUsername = buyerUser ? buyerUser.username : null;
      }
      if (contract.seller) {
        const sellerUser = await User.findById(contract.seller);
        sellerUsername = sellerUser ? sellerUser.username : null;
      }
    } catch (userErr) {
      console.error('Error fetching buyer/seller user:', userErr);
    }

    const statusObj = contract.contract_acceptance_status?.find(item => item?.status === true);

    const contractData = {
      contract_unique_id: contract.contract_unique_id,
      trade_type: contract.trade_type,
      services: contract.services,
      project_name: contract.project_name,
      project_amount: contract.project_amount,
      project_description: contract.project_description,
      project_deadline: formatDate(contract.project_deadline),
      contract_created: formatDate(contract.contract_created),
      contract_acceptance_status: statusObj || null,
      project_completed_status: contract.project_completed_status || false,
      project_milestone_timeline: contract.project_milestone_timeline || {},
      buyer_username: buyerUsername,
      seller_username: sellerUsername,
      milestone: milestone || null
    };

    res.status(200).json(contractData);
  } catch (err) {
    console.error('Fetching Contract Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// to update the contract details (only admin has the access)
exports.updateContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const updateData = req.body;

    // Get original contract for activity logging
    const originalContract = await Contract.findOne({ contract_unique_id: contractId });
    if (!originalContract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // update milestone data using contract id
    const updatedContract = await Contract.findOneAndUpdate(
      { contract_unique_id: contractId },
      { $set: updateData },
      { new: true }
    );

    // Log the contract update activity BEFORE sending response
    console.log('🔍 Contract Controller - About to log update activity for user:', req.dashboardUser);
    try {
      const changes = getChanges(sanitizeData(originalContract.toObject()), sanitizeData(updatedContract.toObject()));
      await logActivity({
        performedBy: req.dashboardUser,
        action: 'UPDATE',
        resource: 'CONTRACT',
        resourceId: contractId,
        changes,
        metadata: {
          description: `Updated contract ${contractId}`,
          statusCode: 200
        },
        req
      });
      console.log(' Contract Controller - Update activity logged successfully');
    } catch (logError) {
      console.error(' Contract Controller - Failed to log update activity:', logError);
    }

    res.status(200).json({
      message: 'Contract updated successfully',
      contract: updatedContract
    });
  } catch (err) {
    console.error('Creating Contract Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

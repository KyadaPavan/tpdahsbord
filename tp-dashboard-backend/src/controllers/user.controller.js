const User = require('../models/user.model');
const Contract = require('../models/contract.model');
const moment = require('moment');
const { logActivity, getChanges, sanitizeData } = require('../utils/activityLogger');

// fetching user details by user id or by the phone number
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Only perform search if query is at least 6 characters long
    if (query.length < 6) {
      return res.status(400).json({
        message: 'Query must be at least 6 characters long for user ID or phone number search'
      });
    }
    const users = await User.find({
      $or: [
        { user_id: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }, {
      email: 1,
      phone: 1,
      kyc_verified: 1,
      user_id: 1,
      username: 1,
      user_confidential_data: 1,
      user_contracts: 1,
      user_created_date: 1
    });

    // Fetch contract data by using contract id and fetching from contract
    const contractIds = users.user_contracts?.map(contract => contract.contract_id) || [];
    const contracts = contractIds.length > 0 ?
      await Contract.find({ _id: { $in: contractIds } }) : [];

    const formatted = users.map(user => ({
      email: user.email,
      phone: user.phone,
      kyc_verified: user.kyc_verified,
      user_id: user.user_id,
      username: user.username,
      user_confidential_data: user.user_confidential_data,
      contract_count: user.user_contracts?.length || 0,
      created_at: user.user_created_date
        ? moment(user.user_created_date).utcOffset("+05:30").format("DD/MM/YYYY, hh:mm A")
        : "N/A",
      contracts: contracts
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Fetching User Details Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// fetching user details by user id or by the phone number
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ user_id: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch contract data by using contract id and fetching from contract
    const contractIds = user.user_contracts?.map(contract => contract.contract_id) || [];
    const contracts = contractIds.length > 0 ?
      await Contract.find({ _id: { $in: contractIds } }) : [];

    const userData = {
      email: user.email,
      phone: user.phone,
      kyc_verified: user.kyc_verified,
      user_id: user.user_id,
      username: user.username,
      user_confidential_data: user.user_confidential_data,
      created_at: user.user_created_date
        ? moment(user.user_created_date).utcOffset("+05:30").format("DD/MM/YYYY, hh:mm A")
        : "N/A",
      contracts: contracts
    };

    res.status(200).json(userData);
  } catch (err) {
    console.error('Fetching User Details Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// to update the user details (only admin has the access)
exports.updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, bank_data, pan_card_data, aadhar_card_data, pan_card_verification, aadhar_card_verification } = req.body;

    const user = await User.findOne({ user_id: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store original data for activity logging
    const originalUser = sanitizeData(user.toObject());

    const updateData = {};
    if (name) updateData.username = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    const confidentialData = user.user_confidential_data || {};
    const kyc_verified = user.kyc_verified || {
      pan_card_verification: false,
      aadhar_card_verification: false
    };
    // pan and aadhar car enable disable status
    if (pan_card_verification !== undefined) {
      kyc_verified.pan_card_verification = pan_card_verification;
    }
    if (aadhar_card_verification !== undefined) {
      kyc_verified.aadhar_card_verification = aadhar_card_verification;
    }

    if (aadhar_card_data) {
      confidentialData.aadhar_card_data = {
        ...confidentialData.aadhar_card_data,
        ...aadhar_card_data
      };
    }
    if (pan_card_data) {
      confidentialData.pan_card_data = {
        ...confidentialData.pan_card_data,
        ...pan_card_data
      };
    }
    if (bank_data) {
      confidentialData.bank_data = bank_data;
    } else {
      confidentialData.bank_data = confidentialData.bank_data || [];
    }


    updateData.user_confidential_data = confidentialData;
    updateData.kyc_verified = kyc_verified;

    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      { $set: updateData },
      { new: true }
    );

    // Log the update activity BEFORE sending response
    if (req.dashboardUser) {
      try {
        const changes = getChanges(originalUser, sanitizeData(updatedUser.toObject()));
        await logActivity({
          performedBy: req.dashboardUser,
          action: 'UPDATE',
          resource: 'USER',
          resourceId: userId,
          changes,
          targetUser: {
            userId: user.user_id,
            email: user.email,
            phone: user.phone
          },
          metadata: {
            description: `Updated user details for ${user.user_id}`,
            statusCode: 200
          },
          req
        });
      } catch (logError) {
        console.error(' User Controller - Failed to log update activity:', logError);
      }
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Updating User Details Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


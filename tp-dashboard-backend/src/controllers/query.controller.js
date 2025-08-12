const Query = require('../models/query.model');
const { logActivity, getChanges, sanitizeData } = require('../utils/activityLogger');

// Create a new query
exports.createQuery = async (req, res) => {
  try {
    const { name, phone, message, status, type, contractId, userId, attendedBy, followUps } = req.body;

    // checking for the type contract or user to take userid or contract id based on the type of query
    if (type === 'contract' && !contractId) {
      return res.status(400).json({ error: 'Contract ID is required for contract type queries' });
    }
    if (type === 'user' && !userId) {
      return res.status(400).json({ error: 'User ID is required for user type queries' });
    }

    // checking for duplicate query with same phone number and type
    const existing = await Query.findOne({ phone, type });
    if (existing) {
      return res.status(409).json({ error: `A query of type '${type}' with phone number '${phone}' already exists. you can update that.` });
    }
    const queryData = {
      name,
      phone,
      message,
      status,
      type,
      attendedBy: attendedBy
    };

    if (type === 'contract') queryData.contractId = contractId;
    if (type === 'user') queryData.userId = userId;
    // add follow ups 
    if (followUps && followUps.length > 0) {
      queryData.followUps = followUps;
    }

    const query = new Query(queryData);
    await query.save();

    // Log the create activity
    if (req.dashboardUser) {
      try {
        await logActivity({
          performedBy: req.dashboardUser,
          action: 'CREATE',
          resource: 'QUERY',
          resourceId: query._id.toString(),
          metadata: {
            description: `Created new query for ${name} (${phone})`,
            queryType: type,
            statusCode: 201
          },
          req
        });
      } catch (logError) {
        console.error(' Query Controller - Failed to log create activity:', logError);
      }
    }

    res.status(201).json(query);
  } catch (err) {
    console.error('Creating Query Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// fetching query (recent first)
exports.listQueries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Query.countDocuments();
    const queries = await Query.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ total, page, limit, queries });
  } catch (err) {
    console.error("Fetching Query Error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// update the query (both admin and support can update it)
exports.updateQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    // Get original query for activity logging
    const originalQuery = await Query.findOne({ queryId: id });
    if (!originalQuery) return res.status(404).json({ error: 'Query not found' });

    let updatedQuery;

    // adding follow up after query is created 
    if (update.newFollowUp) {
      if (!originalQuery.followUps) originalQuery.followUps = [];
      originalQuery.followUps.push(update.newFollowUp);

      delete update.newFollowUp;
      updatedQuery = await originalQuery.save();

      // Log the follow-up activity
      if (req.dashboardUser) {
        try {
          await logActivity({
            performedBy: req.dashboardUser,
            action: 'UPDATE',
            resource: 'QUERY',
            resourceId: id,
            metadata: {
              description: `Added follow-up to query ${id}`,
              followUpAdded: true,
              statusCode: 200
            },
            req
          });
        } catch (logError) {
          console.error(' Query Controller - Failed to log follow-up activity:', logError);
        }
      }

      return res.json(updatedQuery);
    }

    updatedQuery = await Query.findOneAndUpdate({ queryId: id }, update, { new: true });

    // Log the update activity
    if (req.dashboardUser) {
      try {
        const changes = getChanges(sanitizeData(originalQuery.toObject()), sanitizeData(updatedQuery.toObject()));
        await logActivity({
          performedBy: req.dashboardUser,
          action: 'UPDATE',
          resource: 'QUERY',
          resourceId: id,
          changes,
          metadata: {
            description: `Updated query ${id}`,
            statusCode: 200
          },
          req
        });
      } catch (logError) {
        console.error(' Query Controller - Failed to log update activity:', logError);
      }
    }

    res.json(updatedQuery);
  } catch (err) {
    console.error('Update Query Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// delete the query (only admin can delete the query)
exports.deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    // Get query details before deletion for logging
    const query = await Query.findOne({ queryId: id });
    if (!query) return res.status(404).json({ error: 'Query not found' });

    // Store query info for logging
    const queryInfo = {
      queryId: query.queryId,
      name: query.name,
      phone: query.phone,
      type: query.type
    };

    await Query.findOneAndDelete({ queryId: id });

    // Log the delete activity
    if (req.dashboardUser) {
      try {
        await logActivity({
          performedBy: req.dashboardUser,
          action: 'DELETE',
          resource: 'QUERY',
          resourceId: id,
          metadata: {
            description: `Deleted query ${id} for ${queryInfo.name} (${queryInfo.phone})`,
            deletedQueryInfo: queryInfo,
            statusCode: 200
          },
          req
        });
      } catch (logError) {
        console.error(' Query Controller - Failed to log delete activity:', logError);
      }
    }

    res.json({ message: 'Query Deleted' });
  } catch (err) {
    console.error('Delete Query Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
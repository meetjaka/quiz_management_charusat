const Group = require('../models/Group');
const User = require('../models/User');

// Get all groups with filtering and pagination
exports.getAllGroups = async (req, res) => {
  try {
    const {
      groupType,
      isActive,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const query = {};

    if (groupType) query.groupType = groupType;
    if (isActive !== undefined) query.isActive = isActive === "true";

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const groups = await Group.find(query)
      .populate('createdBy', 'fullName email')
      .populate('members.user', 'fullName email role studentId')
      .populate('members.addedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Group.countDocuments(query);

    res.status(200).json({
      success: true,
      count: groups.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching groups",
      error: error.message,
    });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('members.user', 'fullName email role studentId department semester')
      .populate('members.addedBy', 'fullName email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group",
      error: error.message,
    });
  }
};

// Create new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, groupType } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide group name",
      });
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: "Group name already exists",
      });
    }

    // Create group
    const group = await Group.create({
      name,
      description: description || '',
      groupType: groupType || 'batch',
      createdBy: req.user._id,
    });

    // Populate the created group
    const populatedGroup = await Group.findById(group._id)
      .populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating group",
      error: error.message,
    });
  }
};

// Update group
exports.updateGroup = async (req, res) => {
  try {
    const { name, description, groupType, isActive } = req.body;

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if new name already exists (excluding current group)
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ name, _id: { $ne: req.params.id } });
      if (existingGroup) {
        return res.status(400).json({
          success: false,
          message: "Group name already exists",
        });
      }
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (groupType) group.groupType = groupType;
    if (isActive !== undefined) group.isActive = isActive;

    await group.save();

    // Populate the updated group
    const updatedGroup = await Group.findById(group._id)
      .populate('createdBy', 'fullName email')
      .populate('members.user', 'fullName email role studentId');

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating group",
      error: error.message,
    });
  }
};

// Delete group
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Remove group reference from all users
    await User.updateMany(
      { groups: req.params.id },
      { $pull: { groups: req.params.id } }
    );

    // Reset primary group for users who had this as primary
    await User.updateMany(
      { primaryGroup: req.params.id },
      { $unset: { primaryGroup: "" } }
    );

    await Group.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting group",
      error: error.message,
    });
  }
};

// Add member to group
exports.addMemberToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide user ID",
      });
    }

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already in group
    const isAlreadyMember = group.members.some(
      member => member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this group",
      });
    }

    // Add member to group
    group.addMember(userId, req.user._id);
    await group.save();

    // Add group to user's groups array
    if (!user.groups.includes(groupId)) {
      user.groups.push(groupId);
      
      // Set as primary group if user doesn't have one
      if (!user.primaryGroup) {
        user.primaryGroup = groupId;
      }
      
      await user.save();
    }

    const updatedGroup = await Group.findById(groupId)
      .populate('members.user', 'fullName email role studentId');

    res.status(200).json({
      success: true,
      message: "Member added to group successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding member to group",
      error: error.message,
    });
  }
};

// Remove member from group
exports.removeMemberFromGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);

    if (!group || !user) {
      return res.status(404).json({
        success: false,
        message: "Group or user not found",
      });
    }

    // Remove member from group
    group.removeMember(userId);
    await group.save();

    // Remove group from user's groups array
    user.groups = user.groups.filter(g => g.toString() !== groupId);
    
    // Reset primary group if this was the primary
    if (user.primaryGroup && user.primaryGroup.toString() === groupId) {
      user.primaryGroup = user.groups.length > 0 ? user.groups[0] : null;
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: "Member removed from group successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing member from group",
      error: error.message,
    });
  }
};

// Bulk add members to group
exports.bulkAddMembersToGroup = async (req, res) => {
  try {
    const { userIds } = req.body;
    const groupId = req.params.id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide array of user IDs",
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const users = await User.find({ _id: { $in: userIds } });
    
    let addedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      const isAlreadyMember = group.members.some(
        member => member.user.toString() === user._id.toString()
      );

      if (!isAlreadyMember) {
        group.addMember(user._id, req.user._id);
        
        // Add group to user's groups array
        if (!user.groups.includes(groupId)) {
          user.groups.push(groupId);
          
          // Set as primary group if user doesn't have one
          if (!user.primaryGroup) {
            user.primaryGroup = groupId;
          }
          
          await user.save();
        }
        
        addedCount++;
      } else {
        skippedCount++;
      }
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: `Successfully added ${addedCount} members to group. ${skippedCount} were already members.`,
      data: {
        addedCount,
        skippedCount,
        totalRequested: userIds.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error bulk adding members to group",
      error: error.message,
    });
  }
};

module.exports = {
  getAllGroups: exports.getAllGroups,
  getGroupById: exports.getGroupById,
  createGroup: exports.createGroup,
  updateGroup: exports.updateGroup,
  deleteGroup: exports.deleteGroup,
  addMemberToGroup: exports.addMemberToGroup,
  removeMemberFromGroup: exports.removeMemberFromGroup,
  bulkAddMembersToGroup: exports.bulkAddMembersToGroup
};
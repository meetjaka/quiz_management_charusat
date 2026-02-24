const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Admin-only routes for group management
router.use(authorize("admin"));

// ============================================
// GROUP MANAGEMENT
// ============================================
router.get("/", groupController.getAllGroups);
router.post("/", groupController.createGroup);

// Member management (must come before /:id route)
router.get("/:id/members", groupController.getGroupMembers);
router.post("/:id/members", groupController.addMemberToGroup);
router.delete("/:id/members", groupController.removeMemberFromGroup);
router.post("/:id/members/bulk", groupController.bulkAddMembersToGroup);

// Group-specific routes
router.get("/:id", groupController.getGroupById);
router.put("/:id", groupController.updateGroup);
router.delete("/:id/with-users", groupController.deleteGroupWithUsers);
router.delete("/:id", groupController.deleteGroup);

module.exports = router;

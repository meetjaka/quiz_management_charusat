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
router.get("/:id", groupController.getGroupById);
router.post("/", groupController.createGroup);
router.put("/:id", groupController.updateGroup);
router.delete("/:id", groupController.deleteGroup);

// Member management
router.post("/:id/members", groupController.addMemberToGroup);
router.delete("/:id/members", groupController.removeMemberFromGroup);
router.post("/:id/members/bulk", groupController.bulkAddMembersToGroup);

module.exports = router;
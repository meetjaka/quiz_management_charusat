const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  groupType: {
    type: String,
    enum: ['batch', 'department', 'course', 'custom'],
    default: 'batch'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
groupSchema.index({ name: 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ 'members.user': 1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Method to add member
groupSchema.methods.addMember = function(userId, addedBy) {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      addedBy: addedBy,
      addedAt: new Date()
    });
    return true;
  }
  return false;
};

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
};

// Ensure virtual fields are serialized
groupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
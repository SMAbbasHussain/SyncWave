const User = require('../models/User');
const Group = require('../models/Group');

exports.checkBlocked = async (req, res, next) => {
  try {
    const receiver = await User.findById(req.params.userId || req.body.receiverId);
    if (!receiver) return res.status(404).json({ error: 'User not found' });
    
    if (receiver.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are blocked by this user' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkGroupMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId || req.body.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMember = group.members.some(m => m.userId.equals(req.user._id));
    if (!isMember) return res.status(403).json({ error: 'Not a group member' });
    
    req.group = group;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In chatMiddleware.js
exports.checkGroupAdmin = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isAdmin = group.members.some(member => 
      member.userId.equals(req.user._id) && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    
    req.group = group;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
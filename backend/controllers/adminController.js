import User from '../models/User.js';

// Get pending users (staff awaiting approval)
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: 'staff',
      isApproved: false,
    }).select('-password');

    res.status(200).json({
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching pending users',
      error: error.message,
    });
  }
};

// Approve a staff member
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'staff') {
      return res.status(400).json({ message: 'Only staff members can be approved' });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error approving user',
      error: error.message,
    });
  }
};

// Reject a staff member (delete)
export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User rejected and removed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting user',
      error: error.message,
    });
  }
};

// Get all approved staff
export const getApprovedStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: 'staff',
      isApproved: true,
    }).select('-password');

    res.status(200).json({
      count: staff.length,
      staff,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching approved staff',
      error: error.message,
    });
  }
};

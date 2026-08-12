const Complaint = require('../models/Complaint');

// --- User & Driver endpoints ---

// Create a new complaint/ticket
exports.createComplaint = async (req, res) => {
  try {
    const { type, subject, description, bookingId, priority, attachments } = req.body;
    
    // Determine user type from the route/auth context
    // Assuming req.user is set for customers and req.driver is set for drivers
    let userId;
    let userType;

    if (req.user) {
        userId = req.user._id;
        userType = 'User';
    } else if (req.driver) {
        userId = req.driver._id;
        userType = 'Driver';
    } else {
        return res.status(401).json({ message: 'Unauthorized. Only users and drivers can create complaints.' });
    }

    const complaint = new Complaint({
      user: userId,
      userType: userType,
      type: type || 'other',
      subject,
      description,
      priority: priority || 'medium',
      attachments: attachments || []
    });

    if (bookingId) {
        complaint.bookingId = bookingId;
    }

    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Error creating complaint' });
  }
};

// Get all complaints for the logged-in user or driver
exports.getMyComplaints = async (req, res) => {
  try {
    let userId;
    if (req.user) {
        userId = req.user._id;
    } else if (req.driver) {
        userId = req.driver._id;
    } else {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    const complaints = await Complaint.find({ user: userId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// --- Admin endpoints ---

// Get all complaints (admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, userType, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (userType) filter.userType = userType;
    if (type) filter.type = type;

    const complaints = await Complaint.find(filter)
        .sort({ createdAt: -1 })
        .populate({ path: 'user', select: 'name email phone' });

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// Update complaint status (admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const updateData = { status };
    if (resolution) updateData.resolution = resolution;
    
    if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({ path: 'user', select: 'name email phone' });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Error updating complaint' });
  }
};

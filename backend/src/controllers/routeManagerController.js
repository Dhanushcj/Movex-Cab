const Junction = require('../models/Junction');
const Route = require('../models/Route');
const Driver = require('../models/Driver');

// @desc    Create a new junction
// @route   POST /api/route-manager/junctions
// @access  Admin
exports.createJunction = async (req, res, next) => {
  try {
    const { name, coordinates, description } = req.body;
    const junction = await Junction.create({
      name,
      location: {
        type: 'Point',
        coordinates
      },
      description
    });
    res.status(201).json({ success: true, data: junction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all junctions
// @route   GET /api/route-manager/junctions
// @access  Public
exports.getJunctions = async (req, res, next) => {
  try {
    const junctions = await Junction.find({ isActive: true });
    res.status(200).json({ success: true, count: junctions.length, data: junctions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new route
// @route   POST /api/route-manager/routes
// @access  Admin
exports.createRoute = async (req, res, next) => {
  try {
    const { name, junctions, polyline } = req.body;
    const route = await Route.create({ name, junctions, polyline });
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active routes
// @route   GET /api/route-manager/routes
// @access  Public
exports.getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ isActive: true }).populate('junctions');
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a route
// @route   DELETE /api/route-manager/routes/:id
// @access  Admin
exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ success: false, error: 'Route not found' });
    }

    await route.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a driver to a route
// @route   PUT /api/route-manager/drivers/:id/assign
// @access  Admin
exports.assignDriverToRoute = async (req, res, next) => {
  try {
    const { routeId } = req.body;
    
    // Check if route exists
    if (routeId) {
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({ success: false, error: 'Route not found' });
      }
    }
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { assignedRoute: routeId || null }, // pass null to unassign
      { new: true, runValidators: true }
    );
    
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }
    
    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

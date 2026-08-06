import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Plus, MapPin, Navigation, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [junctions, setJunctions] = useState([]);
  
  // Dialog States
  const [openJunctionDialog, setOpenJunctionDialog] = useState(false);
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  
  // Form States
  const [newJunction, setNewJunction] = useState({ name: '', lat: '', lng: '', description: '' });
  const [newRoute, setNewRoute] = useState({ name: '', selectedJunctions: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Assuming public endpoints or admin endpoints return these
      const [routeRes, juncRes] = await Promise.all([
        axios.get('http://localhost:5000/api/route-manager/routes'),
        axios.get('http://localhost:5000/api/route-manager/junctions')
      ]);
      setRoutes(routeRes.data.data || []);
      setJunctions(juncRes.data.data || []);
    } catch (err) {
      console.error('Error fetching routing data', err);
      // Fallback mocks for UI dev
      setRoutes([{ _id: '1', name: 'Downtown to Airport (Route A)', junctions: [{name: 'Central Station'}, {name: 'Airport T2'}] }]);
      setJunctions([{ _id: '1', name: 'Central Station' }, { _id: '2', name: 'Airport T2' }]);
    }
  };

  const handleCreateJunction = async () => {
    try {
      // Note: Admin token should be in axios interceptor ideally
      await axios.post('http://localhost:5000/api/route-manager/junctions', {
        name: newJunction.name,
        coordinates: [parseFloat(newJunction.lng), parseFloat(newJunction.lat)],
        description: newJunction.description
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      toast.success('Junction created!');
      setOpenJunctionDialog(false);
      setNewJunction({ name: '', lat: '', lng: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to create junction');
    }
  };

  const handleCreateRoute = async () => {
    try {
      await axios.post('http://localhost:5000/api/route-manager/routes', {
        name: newRoute.name,
        junctions: newRoute.selectedJunctions
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      toast.success('Route created!');
      setOpenRouteDialog(false);
      setNewRoute({ name: '', selectedJunctions: [] });
      fetchData();
    } catch (err) {
      toast.error('Failed to create route');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="600">Route & Junction Manager</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<MapPin size={20} />}
            onClick={() => setOpenJunctionDialog(true)}
          >
            New Junction
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Navigation size={20} />}
            onClick={() => setOpenRouteDialog(true)}
          >
            New Route
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Active Routes Table */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" mb={3} fontWeight="600">Active Routes</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Route Name</TableCell>
                    <TableCell>Junctions</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route._id}>
                      <TableCell sx={{ fontWeight: '500' }}>{route.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {route.junctions.map((j, i) => (
                            <Chip key={i} label={j.name} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Active" color="success" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary"><Edit size={18} /></IconButton>
                        <IconButton size="small" color="error"><Trash2 size={18} /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {routes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No routes created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Junctions List */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" mb={3} fontWeight="600">All Junctions</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Junction Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {junctions.map((junc) => (
                    <TableRow key={junc._id}>
                      <TableCell sx={{ fontWeight: '500' }}>{junc.name}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error"><Trash2 size={18} /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {junctions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No junctions created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* New Junction Dialog */}
      <Dialog open={openJunctionDialog} onClose={() => setOpenJunctionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Junction</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Junction Name" 
            fullWidth 
            value={newJunction.name}
            onChange={(e) => setNewJunction({...newJunction, name: e.target.value})}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField 
                label="Latitude" 
                fullWidth 
                type="number"
                value={newJunction.lat}
                onChange={(e) => setNewJunction({...newJunction, lat: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="Longitude" 
                fullWidth 
                type="number"
                value={newJunction.lng}
                onChange={(e) => setNewJunction({...newJunction, lng: e.target.value})}
              />
            </Grid>
          </Grid>
          <TextField 
            label="Description (Optional)" 
            fullWidth 
            multiline rows={2}
            value={newJunction.description}
            onChange={(e) => setNewJunction({...newJunction, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenJunctionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateJunction}>Create Junction</Button>
        </DialogActions>
      </Dialog>

      {/* New Route Dialog */}
      <Dialog open={openRouteDialog} onClose={() => setOpenRouteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Route</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField 
            label="Route Name" 
            fullWidth 
            value={newRoute.name}
            onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
          />
          
          <FormControl fullWidth>
            <InputLabel>Select Junctions</InputLabel>
            <Select
              multiple
              value={newRoute.selectedJunctions}
              label="Select Junctions"
              onChange={(e) => setNewRoute({...newRoute, selectedJunctions: e.target.value})}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const jName = junctions.find(j => j._id === value)?.name || value;
                    return <Chip key={value} label={jName} size="small" />;
                  })}
                </Box>
              )}
            >
              {junctions.map((junc) => (
                <MenuItem key={junc._id} value={junc._id}>
                  {junc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRouteDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRoute}>Create Route</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteManager;

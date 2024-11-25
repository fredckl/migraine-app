import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HeadachesIcon from '@mui/icons-material/Sick';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
          Diet Tracker
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/food"
            startIcon={<RestaurantIcon />}
          >
            Repas
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/migraines"
            startIcon={<HeadachesIcon />}
          >
            Migraines
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

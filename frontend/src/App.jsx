import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import Navbar from './components/Navbar'
import FoodEntries from './components/FoodEntries'
import MigraineLog from './components/MigraineLog'
import Dashboard from './components/Dashboard'
import RegisterForm from './components/auth/RegisterForm'
import LoginForm from './components/auth/LoginForm'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          height: '100%',
        },
      },
    },
  },
})

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <Container maxWidth={false} sx={{ 
          flexGrow: 1, 
          p: 3, 
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/food"
              element={
                <PrivateRoute>
                  <FoodEntries />
                </PrivateRoute>
              }
            />
            <Route
              path="/migraines"
              element={
                <PrivateRoute>
                  <MigraineLog />
                </PrivateRoute>
              }
            />
          </Routes>
        </Container>
      </Box>
    </>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App

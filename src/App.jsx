import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Heading, Link, Spacer, Container, useColorModeValue } from '@chakra-ui/react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const isAuth = () => !!localStorage.getItem('rg_session')
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, gray.100)',
    'linear(to-br, gray.800, gray.700)'
  )
  const headerBg = useColorModeValue('white', 'rgba(255,255,255,0.04)')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Box minH="100vh" bgGradient={bgGradient} color={textColor} className="gym-gradient">
      <Container maxW="100%" py={6}>
        <ErrorBoundary>
          <Flex 
            as="header" 
            mb={6} 
            align="center" 
            bg={headerBg}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            className="gym-card"
          >
            <Heading size="md" color="green.400" fontWeight="bold">
              💪 Reynal-GYM
            </Heading>
            <Spacer />
            {!isAuth() && (
              <>
                <Link 
                  as={RouterLink} 
                  to="/login" 
                  mr={4} 
                  color="green.400"
                  fontWeight="medium"
                  _hover={{ color: 'green.300', textDecoration: 'none' }}
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  as={RouterLink} 
                  to="/register" 
                  color="green.400"
                  fontWeight="medium"
                  _hover={{ color: 'green.300', textDecoration: 'none' }}
                >
                  Registrarse
                </Link>
              </>
            )}
          </Flex>

          <Box 
            bg={headerBg} 
            p={6} 
            borderRadius="lg" 
            boxShadow="md"
            className="gym-card fade-in"
          >
            <Routes>
              <Route path="/" element={isAuth() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </ErrorBoundary>
      </Container>
    </Box>
  )
}

export default App

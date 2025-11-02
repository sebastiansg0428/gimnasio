import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Heading, Link, Spacer, Container } from '@chakra-ui/react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const isAuth = () => !!localStorage.getItem('rg_session')

  return (
    <Box minH="100vh" bgGradient="linear(to-br, gray.800, gray.700)" color="white">
      <Container maxW="container.xl" py={6}>
        <ErrorBoundary>
          <Flex as="header" mb={6} align="center">
            <Heading size="md" color="green.300">Reynal-GYM</Heading>
            <Spacer />
            <Link as={RouterLink} to="/login" mr={4} color="green.300">
              Login
            </Link>
            <Link as={RouterLink} to="/register" color="green.300">
              Registrarse
            </Link>
          </Flex>

          <Box bg="rgba(255,255,255,0.04)" p={6} borderRadius="md">
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

import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
    Box,
    Heading,
    Input,
    Button,
    VStack,
    Text,
    Link,
    useToast,
} from '@chakra-ui/react'
import { loginUser } from '../utils/auth'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await loginUser({ email, password })
            toast({ title: 'Bienvenido', status: 'success', duration: 2000 })
            navigate('/dashboard')
        } catch (err) {
            toast({ title: err.message, status: 'error', duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box maxW="md" mx="auto">
            <Heading mb={6} color="green.400" textAlign="center" fontSize="2xl">
                🔐 Iniciar Sesión
            </Heading>
            <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
                    <Input 
                        placeholder="Correo electrónico" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: 'gray.500' }}
                        _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #48bb78' }}
                        size="lg"
                        required
                    />
                    <Input 
                        placeholder="Contraseña" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: 'gray.500' }}
                        _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #48bb78' }}
                        size="lg"
                        required
                    />
                    <Button 
                        type="submit" 
                        colorScheme="green" 
                        isLoading={loading}
                        size="lg"
                        className="gym-button-hover"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    >
                        Entrar al Gimnasio
                    </Button>
                    <Text textAlign="center" color="gray.600">
                        ¿No tienes cuenta?{' '}
                        <Link 
                            as={RouterLink} 
                            to="/register" 
                            color="green.400"
                            fontWeight="semibold"
                            _hover={{ color: 'green.300', textDecoration: 'underline' }}
                        >
                            Regístrate aquí
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    )
}

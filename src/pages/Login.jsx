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
            <Heading mb={6} color="green.300"> Iniciar sesión</Heading>
            <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                    <Input placeholder="Ingresa tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input placeholder="Ingresa tu contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button type="submit" colorScheme="green" isLoading={loading}>
                        Entrar
                    </Button>
                    <Text>
                        ¿No tienes cuenta?{' '}
                        <Link as={RouterLink} to="/register" color="green.200">
                            Regístrate
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    )
}

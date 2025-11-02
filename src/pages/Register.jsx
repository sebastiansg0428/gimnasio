import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Heading,
    Input,
    Button,
    VStack,
    useToast,
} from '@chakra-ui/react'
import { registerUser } from '../utils/auth'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await registerUser({ name, email, password })
            toast({ title: 'Registro correcto', status: 'success', duration: 2000 })
            navigate('/dashboard')
        } catch (err) {
            toast({ title: err.message, status: 'error', duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box maxW="md" mx="auto">
            <Heading mb={6}>Crear cuenta</Heading>
            <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                    <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button type="submit" colorScheme="purple" isLoading={loading}>
                        Registrarse
                    </Button>
                </VStack>
            </Box>
        </Box>
    )
}

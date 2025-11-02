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
            <Heading mb={6} color="green.400" textAlign="center" fontSize="2xl">
                🏋️ Crear Cuenta
            </Heading>
            <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
                    <Input 
                        placeholder="Nombre completo" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: 'gray.500' }}
                        _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #48bb78' }}
                        size="lg"
                        required
                    />
                    <Input 
                        placeholder="Correo electrónico" 
                        type="email"
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
                        placeholder="Contraseña (mínimo 6 caracteres)" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: 'gray.500' }}
                        _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #48bb78' }}
                        size="lg"
                        minLength={6}
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
                        Unirse al Gimnasio
                    </Button>
                </VStack>
            </Box>
        </Box>
    )
}

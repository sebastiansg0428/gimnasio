import {
    Box,
    Container,
    Stack,
    Text,
    Link,
    HStack,
    IconButton,
    Divider,
    Heading,
    useColorModeValue,
} from '@chakra-ui/react'
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'

export default function Footer() {
    const bg = useColorModeValue('gray.50', 'gray.900')
    const color = useColorModeValue('gray.700', 'gray.200')

    return (
        <Box bg={bg} color={color} py={10}>
            <Container maxW="6xl">
                <Stack spacing={8}>
                    {/* Logo y descripción */}
                    <Stack align="center" spacing={4}>
                        <Heading 
                            size="lg" 
                            bgGradient="linear(to-r, #24A148, #38B2AC)"
                            bgClip="text"
                            fontWeight="bold"
                        >
                            💪 REYNAL-GYM
                        </Heading>
                        <Text textAlign="center" maxW="md">
                            Tu gimnasio de confianza. Transformamos vidas a través del fitness y el bienestar.
                        </Text>
                    </Stack>

                    <Divider />

                    {/* Enlaces legales */}
                    <HStack justify="center" spacing={8} wrap="wrap">
                        <Link 
                            href="#" 
                            color="green.500" 
                            _hover={{ color: "green.600", textDecoration: "underline" }}
                        >
                            Términos y Condiciones
                        </Link>
                        <Link 
                            href="#" 
                            color="green.500" 
                            _hover={{ color: "green.600", textDecoration: "underline" }}
                        >
                            Política de Privacidad
                        </Link>
                        <Link 
                            href="#" 
                            color="green.500" 
                            _hover={{ color: "green.600", textDecoration: "underline" }}
                        >
                            Contacto
                        </Link>
                    </HStack>

                    {/* Redes sociales */}
                    <Stack align="center" spacing={4}>
                        <Text fontWeight="medium">Síguenos en redes sociales</Text>
                        <HStack spacing={4}>
                            <IconButton
                                aria-label="Facebook"
                                icon={<FaFacebook />}
                                size="lg"
                                colorScheme="facebook"
                                variant="ghost"
                                _hover={{ transform: "scale(1.1)" }}
                            />
                            <IconButton
                                aria-label="Instagram"
                                icon={<FaInstagram />}
                                size="lg"
                                colorScheme="pink"
                                variant="ghost"
                                _hover={{ transform: "scale(1.1)" }}
                            />
                            <IconButton
                                aria-label="Twitter"
                                icon={<FaTwitter />}
                                size="lg"
                                colorScheme="twitter"
                                variant="ghost"
                                _hover={{ transform: "scale(1.1)" }}
                            />
                            <IconButton
                                aria-label="YouTube"
                                icon={<FaYoutube />}
                                size="lg"
                                colorScheme="red"
                                variant="ghost"
                                _hover={{ transform: "scale(1.1)" }}
                            />
                        </HStack>
                    </Stack>

                    <Divider />

                    {/* Copyright */}
                    <Text textAlign="center" fontSize="sm" color="gray.500">
                        © 2025 Reynal-GYM. Todos los derechos reservados.
                    </Text>
                </Stack>
            </Container>
        </Box>
    )
}
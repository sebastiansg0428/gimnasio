import {
    Box,
    VStack,
    HStack,
    Avatar,
    Heading,
    Text,
    Button,
    FormControl,
    FormLabel,
    Input,
    Card,
    CardBody,
    Grid,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Divider,
} from '@chakra-ui/react'
import { FiEdit, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { getCurrentUser, updateUser } from '../utils/auth'

export default function PerfilTab() {
    const user = getCurrentUser()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        bio: ''
    })

    useEffect(() => {
        const savedProfile = localStorage.getItem('rg_profile')
        if (savedProfile) {
            const profile = JSON.parse(savedProfile)
            setFormData(prev => ({ ...prev, ...profile }))
        }
    }, [])

    function handleSave() {
        try {
            localStorage.setItem('rg_profile', JSON.stringify(formData))
            updateUser({ ...user, name: formData.name, email: formData.email })
            toast({ title: 'Perfil actualizado', status: 'success', duration: 2000 })
            onClose()
        } catch (error) {
            toast({ title: 'Error al guardar', status: 'error', duration: 2000 })
        }
    }

    const joinDate = new Date(user?.createdAt || Date.now()).toLocaleDateString()

    return (
        <VStack spacing={6} align="stretch">
            <Card>
                <CardBody>
                    <VStack spacing={6}>
                        <Avatar size="2xl" bg="green.400" name={formData.name} />
                        <VStack spacing={2}>
                            <Heading size="lg">{formData.name}</Heading>
                            <Text color="gray.500">{formData.email}</Text>
                        </VStack>
                        <Button leftIcon={<FiEdit />} colorScheme="green" onClick={onOpen}>
                            Editar Perfil
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <Card>
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            <Heading size="md">Información Personal</Heading>
                            <Divider />
                            <HStack>
                                <FiUser />
                                <Text fontWeight="medium">Nombre:</Text>
                                <Text>{formData.name}</Text>
                            </HStack>
                            <HStack>
                                <FiMail />
                                <Text fontWeight="medium">Email:</Text>
                                <Text>{formData.email}</Text>
                            </HStack>
                            <HStack>
                                <FiPhone />
                                <Text fontWeight="medium">Teléfono:</Text>
                                <Text>{formData.phone || 'No especificado'}</Text>
                            </HStack>
                            <HStack>
                                <FiCalendar />
                                <Text fontWeight="medium">Miembro desde:</Text>
                                <Text>{joinDate}</Text>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            <Heading size="md">Acerca de mí</Heading>
                            <Divider />
                            <Text>{formData.bio || 'No hay información adicional'}</Text>
                        </VStack>
                    </CardBody>
                </Card>
            </Grid>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Editar Perfil</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Nombre</FormLabel>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input 
                                    type="email"
                                    value={formData.email} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Teléfono</FormLabel>
                                <Input 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Acerca de mí</FormLabel>
                                <Input 
                                    value={formData.bio} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Membresia</FormLabel>
                                <Input 
                                    value={user?.membresia || 'No especificada'} 
                                    isDisabled
                                />
                            </FormControl>

                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
                        <Button colorScheme="green" onClick={handleSave}>Guardar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    )
}
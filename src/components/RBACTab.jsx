import { useState, useEffect } from 'react'
import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Badge,
    IconButton,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    HStack,
    Text,
    Heading,
    SimpleGrid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Spinner,
    Center,
    Wrap,
    WrapItem,
    Divider,
    Alert,
    AlertIcon
} from '@chakra-ui/react'
import { FiShield, FiUsers, FiKey, FiPlus, FiTrash2, FiUserPlus, FiUserMinus } from 'react-icons/fi'
import { rbacAPI, usuariosAPI } from '../services/api'

export default function RBACTab() {
    const [roles, setRoles] = useState([])
    const [permisos, setPermisos] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedRole, setSelectedRole] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const toast = useToast()

    // Modales
    const { isOpen: isRoleOpen, onOpen: onRoleOpen, onClose: onRoleClose } = useDisclosure()
    const { isOpen: isPermisoOpen, onOpen: onPermisoOpen, onClose: onPermisoClose } = useDisclosure()
    const { isOpen: isAsignarOpen, onOpen: onAsignarOpen, onClose: onAsignarClose } = useDisclosure()

    // Estados para formularios
    const [nuevoRol, setNuevoRol] = useState({ nombre: '', descripcion: '' })
    const [nuevoPermiso, setNuevoPermiso] = useState({ nombre: '', descripcion: '' })
    const [asignacionData, setAsignacionData] = useState({ usuario_id: '', rol: '' })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const [rolesData, permisosData, usuariosData, estadisticasData] = await Promise.all([
                rbacAPI.getRoles().catch(() => []),
                rbacAPI.getPermisos().catch(() => []),
                usuariosAPI.getUsuarios().catch(() => []),
                rbacAPI.getEstadisticas().catch(() => null)
            ])

            setRoles(rolesData)
            setPermisos(permisosData)
            setUsuarios(usuariosData)
            setEstadisticas(estadisticasData)
        } catch (error) {
            toast({
                title: 'Error al cargar datos',
                description: error.message,
                status: 'error',
                duration: 3000
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCrearRol = async () => {
        if (!nuevoRol.nombre) {
            toast({ title: 'El nombre del rol es requerido', status: 'warning', duration: 2000 })
            return
        }

        try {
            await rbacAPI.createRol(nuevoRol)
            toast({ title: '✅ Rol creado exitosamente', status: 'success', duration: 2000 })
            setNuevoRol({ nombre: '', descripcion: '' })
            onRoleClose()
            cargarDatos()
        } catch (error) {
            toast({ title: 'Error al crear rol', description: error.message, status: 'error', duration: 3000 })
        }
    }

    const handleCrearPermiso = async () => {
        if (!nuevoPermiso.nombre) {
            toast({ title: 'El nombre del permiso es requerido', status: 'warning', duration: 2000 })
            return
        }

        try {
            await rbacAPI.createPermiso(nuevoPermiso)
            toast({ title: '✅ Permiso creado exitosamente', status: 'success', duration: 2000 })
            setNuevoPermiso({ nombre: '', descripcion: '' })
            onPermisoClose()
            cargarDatos()
        } catch (error) {
            toast({ title: 'Error al crear permiso', description: error.message, status: 'error', duration: 3000 })
        }
    }

    const handleAsignarRol = async () => {
        if (!asignacionData.usuario_id || !asignacionData.rol) {
            toast({ title: 'Selecciona usuario y rol', status: 'warning', duration: 2000 })
            return
        }

        try {
            await rbacAPI.assignRolToUser(asignacionData.usuario_id, asignacionData.rol)
            toast({ title: '✅ Rol asignado exitosamente', status: 'success', duration: 2000 })
            setAsignacionData({ usuario_id: '', rol: '' })
            onAsignarClose()
            cargarDatos()
        } catch (error) {
            toast({ title: 'Error al asignar rol', description: error.message, status: 'error', duration: 3000 })
        }
    }

    const handleRevocarRol = async (usuarioId, rolNombre) => {
        if (!window.confirm(`¿Revocar rol "${rolNombre}"?`)) return

        try {
            await rbacAPI.revokeRolFromUser(usuarioId, rolNombre)
            toast({ title: '✅ Rol revocado', status: 'success', duration: 2000 })
            cargarDatos()
        } catch (error) {
            toast({ title: 'Error al revocar rol', description: error.message, status: 'error', duration: 3000 })
        }
    }

    const verPermisosRol = async (rolNombre) => {
        try {
            const permisosRol = await rbacAPI.getRolePermisos(rolNombre)
            setSelectedRole({ nombre: rolNombre, permisos: permisosRol })
        } catch (error) {
            toast({ title: 'Error al cargar permisos', description: error.message, status: 'error', duration: 3000 })
        }
    }

    const verRolesUsuario = async (usuarioId) => {
        try {
            const rolesUsuario = await rbacAPI.getUserRoles(usuarioId)
            const usuario = usuarios.find(u => u.id === usuarioId)
            setSelectedUser({ ...usuario, roles: rolesUsuario })
        } catch (error) {
            toast({ title: 'Error al cargar roles del usuario', description: error.message, status: 'error', duration: 3000 })
        }
    }

    if (loading) {
        return (
            <Center h="400px">
                <VStack>
                    <Spinner size="xl" color="purple.500" thickness="4px" />
                    <Text>Cargando sistema RBAC...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <Box>
            {/* Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
                <Card borderLeft="4px" borderLeftColor="purple.400">
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Roles</StatLabel>
                            <StatNumber color="purple.600">{estadisticas?.total_roles || roles.length}</StatNumber>
                            <StatHelpText><FiShield style={{ display: 'inline' }} /> Activos</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderLeft="4px" borderLeftColor="blue.400">
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Permisos</StatLabel>
                            <StatNumber color="blue.600">{estadisticas?.total_permisos || permisos.length}</StatNumber>
                            <StatHelpText><FiKey style={{ display: 'inline' }} /> Disponibles</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderLeft="4px" borderLeftColor="green.400">
                    <CardBody>
                        <Stat>
                            <StatLabel>Usuarios con Roles</StatLabel>
                            <StatNumber color="green.600">{estadisticas?.usuarios_con_roles || 0}</StatNumber>
                            <StatHelpText><FiUsers style={{ display: 'inline' }} /> Asignados</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderLeft="4px" borderLeftColor="orange.400">
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Asignaciones</StatLabel>
                            <StatNumber color="orange.600">{estadisticas?.total_asignaciones || 0}</StatNumber>
                            <StatHelpText>Roles asignados</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Tabs */}
            <Tabs variant="enclosed" colorScheme="purple">
                <TabList>
                    <Tab><FiShield /> <Text ml={2}>Roles</Text></Tab>
                    <Tab><FiKey /> <Text ml={2}>Permisos</Text></Tab>
                    <Tab><FiUsers /> <Text ml={2}>Usuarios</Text></Tab>
                </TabList>

                <TabPanels>
                    {/* Tab: Roles */}
                    <TabPanel>
                        <HStack mb={4} justify="space-between">
                            <Heading size="md">Gestión de Roles</Heading>
                            <Button leftIcon={<FiPlus />} colorScheme="purple" onClick={onRoleOpen}>
                                Nuevo Rol
                            </Button>
                        </HStack>

                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Rol</Th>
                                    <Th>Descripción</Th>
                                    <Th>Permisos</Th>
                                    <Th>Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {roles.map((rol) => (
                                    <Tr key={rol.id || rol.nombre}>
                                        <Td>
                                            <Badge colorScheme="purple" fontSize="md">{rol.nombre}</Badge>
                                        </Td>
                                        <Td>{rol.descripcion || '-'}</Td>
                                        <Td>
                                            <Button size="sm" variant="ghost" onClick={() => verPermisosRol(rol.nombre)}>
                                                Ver Permisos
                                            </Button>
                                        </Td>
                                        <Td>
                                            <IconButton
                                                icon={<FiTrash2 />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                isDisabled={['admin', 'usuario', 'entrenador'].includes(rol.nombre)}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>

                        {/* Vista de permisos del rol seleccionado */}
                        {selectedRole && (
                            <Box mt={6} p={4} borderWidth="1px" borderRadius="md" bg="purple.50">
                                <HStack justify="space-between" mb={3}>
                                    <Heading size="sm">Permisos de: {selectedRole.nombre}</Heading>
                                    <Button size="sm" onClick={() => setSelectedRole(null)}>Cerrar</Button>
                                </HStack>
                                <Wrap>
                                    {selectedRole.permisos?.map((permiso) => (
                                        <WrapItem key={permiso.id || permiso.nombre}>
                                            <Badge colorScheme="blue">{permiso.nombre}</Badge>
                                        </WrapItem>
                                    ))}
                                    {(!selectedRole.permisos || selectedRole.permisos.length === 0) && (
                                        <Text color="gray.500">Sin permisos asignados</Text>
                                    )}
                                </Wrap>
                            </Box>
                        )}
                    </TabPanel>

                    {/* Tab: Permisos */}
                    <TabPanel>
                        <HStack mb={4} justify="space-between">
                            <Heading size="md">Gestión de Permisos</Heading>
                            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onPermisoOpen}>
                                Nuevo Permiso
                            </Button>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            {permisos.map((permiso) => (
                                <Card key={permiso.id || permiso.nombre}>
                                    <CardBody>
                                        <VStack align="stretch" spacing={2}>
                                            <HStack justify="space-between">
                                                <Badge colorScheme="blue">{permiso.nombre}</Badge>
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    size="xs"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                />
                                            </HStack>
                                            <Text fontSize="sm" color="gray.600">
                                                {permiso.descripcion || 'Sin descripción'}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </TabPanel>

                    {/* Tab: Usuarios */}
                    <TabPanel>
                        <HStack mb={4} justify="space-between">
                            <Heading size="md">Asignación de Roles a Usuarios</Heading>
                            <Button leftIcon={<FiUserPlus />} colorScheme="green" onClick={onAsignarOpen}>
                                Asignar Rol
                            </Button>
                        </HStack>

                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Usuario</Th>
                                    <Th>Email</Th>
                                    <Th>Roles</Th>
                                    <Th>Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {usuarios.slice(0, 20).map((usuario) => (
                                    <Tr key={usuario.id}>
                                        <Td>{usuario.nombre} {usuario.apellido}</Td>
                                        <Td>{usuario.email}</Td>
                                        <Td>
                                            <Button size="sm" variant="ghost" onClick={() => verRolesUsuario(usuario.id)}>
                                                Ver Roles
                                            </Button>
                                        </Td>
                                        <Td>
                                            <IconButton
                                                icon={<FiUserPlus />}
                                                size="sm"
                                                colorScheme="green"
                                                variant="ghost"
                                                title="Asignar rol"
                                                onClick={() => {
                                                    setAsignacionData({ usuario_id: usuario.id, rol: '' })
                                                    onAsignarOpen()
                                                }}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>

                        {/* Vista de roles del usuario seleccionado */}
                        {selectedUser && (
                            <Box mt={6} p={4} borderWidth="1px" borderRadius="md" bg="green.50">
                                <HStack justify="space-between" mb={3}>
                                    <Heading size="sm">Roles de: {selectedUser.nombre} {selectedUser.apellido}</Heading>
                                    <Button size="sm" onClick={() => setSelectedUser(null)}>Cerrar</Button>
                                </HStack>
                                <VStack align="stretch" spacing={2}>
                                    {selectedUser.roles?.roles?.map((rol) => (
                                        <HStack key={rol.nombre} justify="space-between" p={2} bg="white" borderRadius="md">
                                            <Badge colorScheme="purple">{rol.nombre}</Badge>
                                            <IconButton
                                                icon={<FiUserMinus />}
                                                size="xs"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleRevocarRol(selectedUser.id, rol.nombre)}
                                            />
                                        </HStack>
                                    ))}
                                    {(!selectedUser.roles?.roles || selectedUser.roles.roles.length === 0) && (
                                        <Alert status="info">
                                            <AlertIcon />
                                            Usuario sin roles asignados
                                        </Alert>
                                    )}
                                </VStack>
                            </Box>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Modal: Crear Rol */}
            <Modal isOpen={isRoleOpen} onClose={onRoleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Crear Nuevo Rol</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nombre del Rol</FormLabel>
                                <Input
                                    placeholder="ej: moderador"
                                    value={nuevoRol.nombre}
                                    onChange={(e) => setNuevoRol({ ...nuevoRol, nombre: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Input
                                    placeholder="Descripción del rol"
                                    value={nuevoRol.descripcion}
                                    onChange={(e) => setNuevoRol({ ...nuevoRol, descripcion: e.target.value })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onRoleClose}>Cancelar</Button>
                        <Button colorScheme="purple" onClick={handleCrearRol}>Crear Rol</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal: Crear Permiso */}
            <Modal isOpen={isPermisoOpen} onClose={onPermisoClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Crear Nuevo Permiso</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nombre del Permiso</FormLabel>
                                <Input
                                    placeholder="ej: ver_reportes"
                                    value={nuevoPermiso.nombre}
                                    onChange={(e) => setNuevoPermiso({ ...nuevoPermiso, nombre: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Input
                                    placeholder="Descripción del permiso"
                                    value={nuevoPermiso.descripcion}
                                    onChange={(e) => setNuevoPermiso({ ...nuevoPermiso, descripcion: e.target.value })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onPermisoClose}>Cancelar</Button>
                        <Button colorScheme="blue" onClick={handleCrearPermiso}>Crear Permiso</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal: Asignar Rol */}
            <Modal isOpen={isAsignarOpen} onClose={onAsignarClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Asignar Rol a Usuario</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Usuario</FormLabel>
                                <Select
                                    placeholder="Selecciona un usuario"
                                    value={asignacionData.usuario_id}
                                    onChange={(e) => setAsignacionData({ ...asignacionData, usuario_id: e.target.value })}
                                >
                                    {usuarios.map((usuario) => (
                                        <option key={usuario.id} value={usuario.id}>
                                            {usuario.nombre} {usuario.apellido} ({usuario.email})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Rol</FormLabel>
                                <Select
                                    placeholder="Selecciona un rol"
                                    value={asignacionData.rol}
                                    onChange={(e) => setAsignacionData({ ...asignacionData, rol: e.target.value })}
                                >
                                    {roles.map((rol) => (
                                        <option key={rol.id || rol.nombre} value={rol.nombre}>
                                            {rol.nombre}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAsignarClose}>Cancelar</Button>
                        <Button colorScheme="green" onClick={handleAsignarRol}>Asignar Rol</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}

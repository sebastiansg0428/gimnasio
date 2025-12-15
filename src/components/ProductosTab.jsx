import { useEffect, useState } from 'react'
import {
    VStack,
    Box,
    Heading,
    Text,
    HStack,
    Button,
    Input,
    SimpleGrid,
    useToast,
    NumberInput,
    NumberInputField,
    FormControl,
    FormLabel,
    Card,
    CardBody,
} from '@chakra-ui/react'
import api from '../utils/api'

export default function ProductosTab() {
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ nombre: '', descripcion: '', categoria: '', stock: 0, precio_compra: 0, precio_venta: 0 })
    const toast = useToast()

    async function fetchProductos() {
        setLoading(true)
        try {
            const data = await api.getProductos()
            setProductos(data || [])
        } catch (e) {
            toast({ title: e.message, status: 'error', duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchProductos() }, [])

    async function handleCreate(e) {
        e.preventDefault()
        try {
            await api.createProducto(form)
            toast({ title: 'Producto creado', status: 'success', duration: 2000 })
            setForm({ nombre: '', descripcion: '', categoria: '', stock: 0, precio_compra: 0, precio_venta: 0 })
            fetchProductos()
        } catch (err) {
            toast({ title: err.message, status: 'error', duration: 3000 })
        }
    }

    async function handleDelete(id) {
        try {
            await api.deleteProducto(id)
            toast({ title: 'Producto eliminado', status: 'info', duration: 2000 })
            fetchProductos()
        } catch (err) {
            toast({ title: err.message, status: 'error', duration: 3000 })
        }
    }

    async function handleGanancia(id) {
        try {
            const res = await api.getGananciaProducto(id)
            toast({ title: `Ganancia: ${res.ganancia ?? JSON.stringify(res)}`, status: 'success', duration: 4000 })
        } catch (err) {
            toast({ title: err.message, status: 'error', duration: 3000 })
        }
    }

    return (
        <VStack spacing={6} align="stretch">
            <Heading size="md">Productos</Heading>

            <Card>
                <CardBody>
                    <form onSubmit={handleCreate}>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                            <FormControl>
                                <FormLabel>Nombre</FormLabel>
                                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Categoria</FormLabel>
                                <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Stock</FormLabel>
                                <NumberInput min={0} value={form.stock} onChange={(v) => setForm({ ...form, stock: Number(v) })}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Precio compra</FormLabel>
                                <NumberInput min={0} value={form.precio_compra} onChange={(v) => setForm({ ...form, precio_compra: Number(v) })}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Precio venta</FormLabel>
                                <NumberInput min={0} value={form.precio_venta} onChange={(v) => setForm({ ...form, precio_venta: Number(v) })}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                            </FormControl>
                        </SimpleGrid>
                        <HStack mt={4}>
                            <Button type="submit" colorScheme="green">Crear producto</Button>
                            <Button onClick={fetchProductos} isLoading={loading}>Refrescar</Button>
                        </HStack>
                    </form>
                </CardBody>
            </Card>

            <VStack spacing={3} align="stretch">
                {productos.length === 0 && <Text color="gray.500">No hay productos</Text>}
                {productos.map((p) => (
                    <Box key={p.id} p={4} borderWidth="1px" borderRadius="md">
                        <HStack justify="space-between">
                            <Box>
                                <Text fontWeight="semibold">{p.nombre}</Text>
                                <Text fontSize="sm" color="gray.600">{p.descripcion}</Text>
                                <Text fontSize="sm" color="gray.600">Categoria: {p.categoria} • Stock: {p.stock}</Text>
                                <Text fontSize="sm" color="gray.700">Venta: ${p.precio_venta} • Compra: ${p.precio_compra}</Text>
                            </Box>
                            <HStack>
                                <Button size="sm" colorScheme="blue" onClick={() => handleGanancia(p.id)}>Ver ganancia</Button>
                                <Button size="sm" colorScheme="red" onClick={() => handleDelete(p.id)}>Eliminar</Button>
                            </HStack>
                        </HStack>
                    </Box>
                ))}
            </VStack>
        </VStack>
    )
}

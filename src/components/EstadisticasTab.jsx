import { Box, VStack, Grid, Card, CardBody, Heading, Stat, StatLabel, StatNumber, StatHelpText, Text, useColorModeValue, Spinner, Alert, AlertIcon, SimpleGrid } from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { estadisticasAPI, pagosAPI, usuariosAPI } from '../services/api'

// Pequeñas utilidades de fecha
function parseDate(iso) {
    try {
        return new Date(iso)
    } catch {
        return null
    }
}

function monthKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Dibujar un simple sparkline (línea) usando SVG
function Sparkline({ values = [], color = '#24A148', height = 40 }) {
    if (!values.length) return null
    const w = Math.max(80, values.length * 10)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${height - ((v - min) / range) * height}`).join(' ')
    return (
        <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
            <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        </svg>
    )
}

// Barra simple para distribución
function HorizontalBar({ label, value, total, color = '#24A148' }) {
    const pct = total ? Math.round((value / total) * 100) : 0
    return (
        <Box>
            <Text fontSize="sm">{label} — {value} ({pct}%)</Text>
            <div style={{ background: '#eee', height: 8, borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color }} />
            </div>
        </Box>
    )
}

export default function EstadisticasTab() {
    const bg = useColorModeValue('white', 'gray.700')
    const [loading, setLoading] = useState(true)
    const [ingresosUnificados, setIngresosUnificados] = useState(null)
    const [estadisticasPagos, setEstadisticasPagos] = useState(null)
    const [usuarios, setUsuarios] = useState([])

    useEffect(() => {
        cargarEstadisticas()
    }, [])

    const cargarEstadisticas = async () => {
        try {
            setLoading(true)
            console.log('📊 Cargando estadísticas unificadas...')
            
            const [ingresos, stats, users] = await Promise.all([
                estadisticasAPI.getIngresosUnificados().catch(() => null),
                pagosAPI.getEstadisticas().catch(() => null),
                usuariosAPI.getUsuarios().catch(() => [])
            ])
            
            console.log('💰 Ingresos unificados:', ingresos)
            console.log('📈 Estadísticas de pagos:', stats)
            console.log('👥 Usuarios:', users.length)
            
            setIngresosUnificados(ingresos)
            setEstadisticasPagos(stats)
            setUsuarios(users)
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error)
        } finally {
            setLoading(false)
        }
    }

    const { totalClientes, clientesPorMembresia, ingresosPorMes, ingresosMesActual, asistencia } = useMemo(() => {
        // Usar datos del backend si están disponibles
        if (ingresosUnificados && usuarios.length > 0) {
            const totalClientes = usuarios.length

            // Distribución por membresía
            const clientesPorMembresia = usuarios.reduce((acc, c) => {
                const key = (c.membresia || 'Sin membresía')
                acc[key] = (acc[key] || 0) + 1
                return acc
            }, {})

            // Usar ingresos del backend (ya unificados: pagos + ventas)
            const ingresosMesActual = ingresosUnificados.mes_actual?.total || 0
            const ingresosPorMes = [ingresosMesActual] // Simplificado, podrías obtener histórico del backend

            // Asistencia estimada
            const clientesActivos = usuarios.filter(u => u.estado === 'activo').length
            const asistencia = Array.from({ length: 14 }).map((_, i) => {
                const base = Math.max(5, Math.round(clientesActivos / 10))
                return base + Math.round(Math.sin(i / 2) * 5 + (Math.random() * 4 - 2))
            })

            return {
                totalClientes,
                clientesPorMembresia,
                ingresosPorMes,
                ingresosMesActual,
                asistencia,
            }
        }
        
        // Fallback a localStorage si no hay datos del backend
        let clients = []
        let pagos = []
        try { clients = JSON.parse(localStorage.getItem('rg_clients') || '[]') } catch { }
        try { pagos = JSON.parse(localStorage.getItem('rg_pagos') || '[]') } catch { }

        const totalClientes = clients.length

        // Distribución por membresía
        const clientesPorMembresia = clients.reduce((acc, c) => {
            const key = (c.membresia || 'Otros')
            acc[key] = (acc[key] || 0) + 1
            return acc
        }, {})

        // Ingresos por mes (últimos 6 meses)
        const now = new Date()
        const months = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            months.push(monthKey(d))
        }

        const ingresosPorMesMap = {}
        for (const p of pagos) {
            if (p.estado && p.estado.toLowerCase() !== 'pagado') continue
            const d = parseDate(p.fecha)
            if (!d) continue
            const key = monthKey(d)
            ingresosPorMesMap[key] = (ingresosPorMesMap[key] || 0) + Number(p.monto || 0)
        }

        const ingresosPorMonthArr = months.map(m => ingresosPorMesMap[m] || 0)
        const ingresosMesActual = ingresosPorMonthArr[ingresosPorMonthArr.length - 1] || 0

        // Asistencia: generar un pequeño histórico mock basado en clientes activos
        const asistencia = Array.from({ length: 14 }).map((_, i) => {
            const base = Math.max(5, Math.round((clients.filter(c => c.estado === 'Activo').length || 20) / 10))
            return base + Math.round(Math.sin(i / 2) * 5 + (Math.random() * 4 - 2))
        })

        return {
            totalClientes,
            clientesPorMembresia,
            ingresosPorMes: ingresosPorMonthArr,
            ingresosMesActual,
            asistencia,
        }
    }, [ingresosUnificados, estadisticasPagos, usuarios])

    const totalMembresias = Object.values(clientesPorMembresia).reduce((s, v) => s + v, 0) || 0

    if (loading) {
        return (
            <Box textAlign="center" py={20}>
                <Spinner size="xl" color="blue.500" />
                <Text mt={4}>Cargando estadísticas...</Text>
            </Box>
        )
    }

    return (
        <VStack spacing={6} align="stretch">
            {ingresosUnificados && (
                <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <Text fontWeight="bold">Ingresos Unificados (Pagos + Ventas)</Text>
                        <Text fontSize="sm">
                            Mes actual: ${ingresosUnificados.mes_actual?.total?.toLocaleString() || 0} • 
                            Año: ${ingresosUnificados.anio_actual?.total?.toLocaleString() || 0} • 
                            Hoy: ${ingresosUnificados.hoy?.total?.toLocaleString() || 0}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                            Desglose mes: Pagos ${ingresosUnificados.mes_actual?.pagos?.toLocaleString() || 0} + 
                            Ventas ${ingresosUnificados.mes_actual?.ventas?.toLocaleString() || 0}
                        </Text>
                    </Box>
                </Alert>
            )}
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                <Card bg={bg}>
                    <CardBody>
                        <Stat>
                            <StatLabel>Total clientes</StatLabel>
                            <StatNumber>{totalClientes}</StatNumber>
                            <StatHelpText>Clientes registrados</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={bg}>
                    <CardBody>
                        <Stat>
                            <StatLabel>Ingresos (mes)</StatLabel>
                            <StatNumber>${ingresosMesActual}</StatNumber>
                            <StatHelpText>Ingresos cobrados este mes</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={bg}>
                    <CardBody>
                        <Stat>
                            <StatLabel>Asistencia (últ. 2 semanas)</StatLabel>
                            <StatNumber>{asistencia[asistencia.length - 1] || 0}</StatNumber>
                            <StatHelpText>Visitas hoy (estimado)</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </Grid>

            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                <Card bg={bg}>
                    <CardBody>
                        <Heading size="sm" mb={4}>Ingresos últimos 6 meses</Heading>
                        <div style={{ width: '100%', overflow: 'auto' }}>
                            {/* Simple bars */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'end', padding: '12px 0' }}>
                                {ingresosPorMes.map((val, i) => {
                                    const max = Math.max(...ingresosPorMes, 1)
                                    const h = (val / max) * 120
                                    return (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <div style={{ width: 28, height: 120, display: 'flex', alignItems: 'flex-end' }}>
                                                <div style={{ width: '100%', height: `${Math.max(6, h)}px`, background: '#24A148', borderRadius: 6 }} />
                                            </div>
                                            <div style={{ fontSize: 12, marginTop: 6 }}>{/* month label */}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card bg={bg}>
                    <CardBody>
                        <Heading size="sm" mb={4}>Distribución por membresía</Heading>
                        <VStack spacing={3} align="stretch">
                            {Object.entries(clientesPorMembresia).map(([k, v]) => (
                                <HorizontalBar key={k} label={k} value={v} total={totalMembresias} color="#24A148" />
                            ))}
                        </VStack>
                    </CardBody>
                </Card>
            </Grid>

            <Card bg={bg}>
                <CardBody>
                    <Heading size="sm" mb={4}>Tendencia de asistencia</Heading>
                    <Sparkline values={asistencia} color="#48BB78" height={48} />
                    <Text fontSize="sm" color="gray">Datos estimados basados en clientes activos</Text>
                </CardBody>
            </Card>
        </VStack>
    )
}

// (HorizontalBar ya está definida arriba — no declarar de nuevo)

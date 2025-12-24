// 🧪 Script de prueba rápida para verificar conexión con el backend
// Ejecutar en la consola del navegador (F12)

// ============== PRUEBA DE EJERCICIOS ==============
console.log('🏋️ Probando endpoints de Ejercicios...')

// 1. Listar ejercicios
fetch('http://localhost:3001/ejercicios')
  .then(r => r.json())
  .then(data => console.log('✅ GET /ejercicios:', data))
  .catch(err => console.error('❌ Error:', err))

// 2. Crear ejercicio de prueba
fetch('http://localhost:3001/ejercicios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Press de Banca - Prueba',
    descripcion: 'Ejercicio de prueba',
    grupo_muscular: 'pecho',
    tipo: 'fuerza',
    nivel: 'intermedio',
    equipo_necesario: 'Barra',
    instrucciones: 'Acostarse en banco...'
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ POST /ejercicios:', data))
  .catch(err => console.error('❌ Error:', err))

// ============== PRUEBA DE RUTINAS ==============
console.log('📋 Probando endpoints de Rutinas...')

// 1. Listar rutinas
fetch('http://localhost:3001/rutinas')
  .then(r => r.json())
  .then(data => console.log('✅ GET /rutinas:', data))
  .catch(err => console.error('❌ Error:', err))

// 2. Crear rutina de prueba
fetch('http://localhost:3001/rutinas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Full Body - Prueba',
    descripcion: 'Rutina de prueba',
    objetivo: 'fuerza',
    nivel: 'principiante',
    duracion_semanas: 8,
    frecuencia_por_semana: 3,
    tipo: 'publica'
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ POST /rutinas:', data))
  .catch(err => console.error('❌ Error:', err))

// ============== PRUEBA DE USUARIOS ==============
console.log('👥 Probando endpoints de Usuarios...')

fetch('http://localhost:3001/usuarios')
  .then(r => r.json())
  .then(data => console.log('✅ GET /usuarios:', data))
  .catch(err => console.error('❌ Error:', err))

// ============== PRUEBA DE PRODUCTOS ==============
console.log('🛒 Probando endpoints de Productos...')

fetch('http://localhost:3001/productos')
  .then(r => r.json())
  .then(data => console.log('✅ GET /productos:', data))
  .catch(err => console.error('❌ Error:', err))

console.log('⏳ Esperando respuestas del backend...')
console.log('Si ves ✅, todo está funcionando correctamente')
console.log('Si ves ❌, verifica que el backend esté corriendo en http://localhost:3001')

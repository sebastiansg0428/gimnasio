// 🧪 TEST: Verificar qué devuelve el backend al obtener entrenadores
// Ejecutar este código en la consola del navegador (F12) con el backend corriendo

console.clear()
console.log('🔍 INICIANDO PRUEBA DE BACKEND - ENTRENADORES')
console.log('=' .repeat(60))

// Test 1: Obtener todos los entrenadores
console.log('\n📋 TEST 1: GET /entrenadores')
fetch('http://localhost:3001/entrenadores')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Respuesta recibida:', data)
    console.log('📊 Cantidad de entrenadores:', data.length)
    
    if (data.length > 0) {
      console.log('\n🔍 PRIMER ENTRENADOR (estructura):')
      console.table(data[0])
      
      console.log('\n🔍 ANÁLISIS DE CAMPOS:')
      const primer = data[0]
      console.log('📌 ID:', primer.id)
      console.log('📌 Nombre:', primer.nombre)
      console.log('📌 Apellido:', primer.apellido)
      console.log('📌 Email:', primer.email)
      console.log('💰 tarifa_hora:', primer.tarifa_hora, typeof primer.tarifa_hora)
      console.log('💰 tarifa_rutina:', primer.tarifa_rutina, typeof primer.tarifa_rutina)
      console.log('📝 biografia:', primer.biografia)
      console.log('📝 certificaciones:', primer.certificaciones)
      console.log('⚡ especialidad_principal:', primer.especialidad_principal)
      console.log('📅 experiencia_anios:', primer.experiencia_anios)
      
      console.log('\n📋 TODOS LOS CAMPOS DISPONIBLES:')
      console.log(Object.keys(primer))
      
      // Buscar JACOB SANCHEZ
      const jacob = data.find(e => e.nombre?.toUpperCase().includes('JACOB'))
      if (jacob) {
        console.log('\n👤 JACOB SANCHEZ ENCONTRADO:')
        console.table(jacob)
        console.log('💰 Su tarifa_hora:', jacob.tarifa_hora)
        console.log('💰 Su tarifa_rutina:', jacob.tarifa_rutina)
        console.log('📝 Su biografía:', jacob.biografia)
      } else {
        console.log('\n⚠️ JACOB SANCHEZ no encontrado en la respuesta')
      }
    }
  })
  .catch(err => console.error('❌ Error:', err))

// Test 2: Crear un entrenador de prueba y ver qué devuelve
console.log('\n📋 TEST 2: POST /entrenadores (crear de prueba)')
setTimeout(() => {
  const testEntrenador = {
    nombre: 'TEST',
    apellido: 'PRUEBA',
    email: 'test@prueba.com',
    telefono: '555-9999',
    genero: 'M',
    especialidad_principal: 'fuerza',
    experiencia_anios: 5,
    tarifa_hora: 50000,
    estado: 'activo',
    certificaciones: 'TEST CERT',
    biografia: 'Esta es una biografía de prueba'
  }
  
  console.log('📤 Enviando:', testEntrenador)
  
  fetch('http://localhost:3001/entrenadores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testEntrenador)
  })
    .then(r => r.json())
    .then(data => {
      console.log('✅ Entrenador creado, respuesta del backend:')
      console.table(data)
      console.log('\n🔍 CAMPOS RECIBIDOS:')
      console.log('💰 tarifa_hora devuelto:', data.tarifa_hora)
      console.log('💰 tarifa_rutina devuelto:', data.tarifa_rutina)
      console.log('📝 biografia devuelta:', data.biografia)
      
      // Eliminar el entrenador de prueba
      if (data.id) {
        console.log(`\n🗑️ Eliminando entrenador de prueba (ID: ${data.id})...`)
        fetch(`http://localhost:3001/entrenadores/${data.id}`, { method: 'DELETE' })
          .then(() => console.log('✅ Entrenador de prueba eliminado'))
          .catch(err => console.error('❌ Error eliminando:', err))
      }
    })
    .catch(err => console.error('❌ Error:', err))
}, 2000)

console.log('\n⏳ Esperando respuestas del backend...')
console.log('💡 Si ves ❌ verifica que el backend esté corriendo en http://localhost:3001')
console.log('=' .repeat(60))

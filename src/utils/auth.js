// Utilities for simple client-side auth using Web Crypto API + localStorage

function bufToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

function hexToBuf(hex) {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)))
    return bytes.buffer
}

export async function generateSalt() {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    return bufToHex(arr.buffer)
}

export async function hashPassword(password, saltHex) {
    // Combine salt + password (simple scheme) and SHA-256
    const enc = new TextEncoder()
    const saltBuf = hexToBuf(saltHex)
    const pwdBuf = enc.encode(password)
    const combined = new Uint8Array(saltBuf.byteLength + pwdBuf.byteLength)
    combined.set(new Uint8Array(saltBuf), 0)
    combined.set(pwdBuf, saltBuf.byteLength)
    const digest = await crypto.subtle.digest('SHA-256', combined)
    return bufToHex(digest)
}

function readUsers() {
    try {
        return JSON.parse(localStorage.getItem('rg_users') || '[]')
    } catch (e) {
        return []
    }
}

function writeUsers(users) {
    localStorage.setItem('rg_users', JSON.stringify(users))
}

export async function registerUser({ name, email, password }) {
    const users = readUsers()
    if (users.some((u) => u.email === email)) {
        throw new Error('El correo ya está registrado')
    }

    const salt = await generateSalt()
    const hash = await hashPassword(password, salt)
    const user = {
        id: Date.now().toString(),
        name,
        email,
        salt,
        hash,
    }
    users.push(user)
    writeUsers(users)
    return user
}

export async function loginUser({ email, password }) {
    const users = readUsers()
    const user = users.find((u) => u.email === email)
    if (!user) throw new Error('Usuario no encontrado')
    const calc = await hashPassword(password, user.salt)
    if (calc !== user.hash) throw new Error('Contraseña incorrecta')
    // Set session (simple)
    localStorage.setItem('rg_session', JSON.stringify({ userId: user.id }))
    return user
}

export function logout() {
    localStorage.removeItem('rg_session')
}

export function getCurrentUser() {
    try {
        const sess = JSON.parse(localStorage.getItem('rg_session') || 'null')
        if (!sess) return null
        const users = readUsers()
        return users.find((u) => u.id === sess.userId) || null
    } catch (e) {
        return null
    }
}

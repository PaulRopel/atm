import { json } from '@sveltejs/kit'
import { registerUserSchema } from '$lib/schemas/auth'
import type { RequestHandler } from './$types'
import { AuthServer } from '$lib/domain/auth/auth.server'
import { AuthRepository } from '$lib/domain/auth/auth.repository'

const authServer = new AuthServer(new AuthRepository())

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        // Clear any existing session
        cookies.delete('session', { path: '/' });

        const body = await request.json()
        const result = registerUserSchema.safeParse(body)

        if (!result.success) {
            return json({ error: result.error.format() }, { status: 400 })
        }

        const user = await authServer.register({
            email: result.data.email,
            password: result.data.password,
            name: result.data.name
        })

        return json({ user })
    } catch (error) {
        console.error('Registration error:', error)
        return json({ error: 'Registration failed' }, { status: 400 })
    }
} 
// src/supabase/functions/delete-account/index.js

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return new Response('Unauthorized', { status: 401 })
    }

    const userClient = createClient(
        Deno.env.get('SUPABASE_URL'),
        Deno.env.get('SUPABASE_ANON_KEY'),
        { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await userClient.auth.getUser()

    if (authError || !user) {
        return new Response('Unauthorized', { status: 401 })
    }

    const adminClient = createClient(
        Deno.env.get('SUPABASE_URL'),
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const { error } = await adminClient.auth.admin.deleteUser(user.id)

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })
})
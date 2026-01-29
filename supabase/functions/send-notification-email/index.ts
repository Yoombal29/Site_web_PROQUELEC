
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailPayload {
  to: string[]
  subject: string
  html: string
  from?: string
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { to, subject, html, from = 'noreply@proquelec.sn' }: EmailPayload = await req.json()

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not found')
      return new Response('Email service not configured', { status: 500 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Resend API error:', error)
      return new Response('Failed to send email', { status: 500 })
    }

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response('Internal server error', { status: 500 })
  }
})

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from '@/lib/auth';
import { serve } from '@hono/node-server'
import { POST as chatPOST } from './routes/chat';
const app = new Hono()

// Enable CORS for Next.js frontend
app.use('/*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono API!' })
})

app.post("/api/chat", (c) => chatPOST(c));

const port = 3001

console.log(`✅ Hono API server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
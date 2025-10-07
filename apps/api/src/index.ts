import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import {
  POST as chatPOST,
  GET as chatGET,
  getMessages,
  updateVisibility,
  getMessage,
  deleteTrailing
} from '@/features/chat/chat.routes';
import { auth } from './core/auth';

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
app.get("/api/chat/:id", (c) => chatGET(c));
app.get("/api/chat/:id/messages", (c) => getMessages(c));
app.patch("/api/chat/:id/visibility", (c) => updateVisibility(c));
app.get("/api/message/:id", (c) => getMessage(c));
app.delete("/api/message/:id/trailing", (c) => deleteTrailing(c));

const port = 3001

console.log(`✅ Hono API server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})

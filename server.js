import fastify from 'fastify';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyFormbody from '@fastify/formbody';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pug from 'pug';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = fastify({ logger: false });

let users = [
  { id: 1, name: 'ivan ivan', email: 'ivan@a.com' },
  { id: 2, name: 'dan dan', email: 'dan@a.com' }
];

await app.register(fastifyFormbody);

await app.register(fastifyView, {
  engine: { pug: pug },
  root: join(__dirname, 'views')
});

await app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/static/'
});

app.get('/users', async (req, reply) => {
  return reply.view('users.pug', { users });
});

app.get('/users/create', async (req, reply) => {
  return reply.view('create.pug', {});
});

app.post('/users', async (req, reply) => {
  const { name, email } = req.body;
  
  const newUser = { id: users.length + 1, name: name, email: email };
  
  users.push(newUser);
  return reply.redirect('/users');
});

await app.listen({ port: 3000, host: '0.0.0.0' });
console.log('server: http://localhost:3000/users');
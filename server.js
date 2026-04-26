import fastify from 'fastify';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyFormbody from '@fastify/formbody';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pug from 'pug';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = fastify({ logger: false });

const db = await open({
  filename: join(__dirname, 'database.db'),
  driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  )
`);

const count = await db.get('SELECT COUNT(*) as count FROM users');
if (count.count === 0) {
  await db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['ivan ivan', 'ivan@a.com']);
  await db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['dan dan', 'dan@a.com']);
}

await app.register(fastifyFormbody);

await app.register(fastifyView, {
  engine: { pug: pug },
  root: join(__dirname, 'views')
});

await app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/static/'
});

app.get('/', async (req, reply) => {
  return reply.redirect('/users');
});

app.get('/users', async (req, reply) => {
  const users = await db.all('SELECT * FROM users ORDER BY id');
  return reply.view('users.pug', { users });
});

app.get('/users/create', async (req, reply) => {
  return reply.view('create.pug', {});
});

app.post('/users', async (req, reply) => {
  const { name, email } = req.body;
  await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  return reply.redirect('/users');
});

app.get('/users/:id/edit', async (req, reply) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return reply.status(404).send('Not found');
  return reply.view('edit.pug', { user });
});

app.post('/users/:id/edit', async (req, reply) => {
  const { name, email } = req.body;
  await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
  return reply.redirect('/users');
});

app.post('/users/:id/delete', async (req, reply) => {
  await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
  return reply.redirect('/users');
});

await app.listen({ port: 3000, host: '0.0.0.0' });
console.log('server: http://localhost:3000/users');
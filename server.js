import fastify from 'fastify';

const app = fastify({ logger: true });

app.get('/', async (req, reply) => {
  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fastify Task</title>
    </head>
    <body>
        <button id="apiBtn">запрос</button>
        <script>
            document.getElementById('apiBtn').addEventListener('click', async () => {
                try {
                    const response = await fetch('/api');
                    
                    if (response.ok) {
                        const message = await response.text();
                        console.log(message)
                        alert(message)
                    } else {
                        console.error('ошибка запроса', response.status)
                    }
                } catch (error) {
                    console.error(ошибка соединения', error)
                }
            });
        </script>
    </body>
    </html>
  `;

  reply.type('text/html').send(html);
});

app.get('/api', async (request, reply) => {
  return 'запрос прошел';
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('сервер запущен http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

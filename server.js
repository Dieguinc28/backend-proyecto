const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { syncDatabase } = require('./models');
const recomendacionService = require('./services/recomendacion.service');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

recomendacionService.setSocketIO(io);

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://cotizador-lady.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.set('io', io);

syncDatabase();

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  socket.on('recomendaciones:subscribe', () => {
    socket.join('recomendaciones');
    console.log('Cliente suscrito a recomendaciones:', socket.id);
  });

  socket.on('recomendaciones:unsubscribe', () => {
    socket.leave('recomendaciones');
    console.log('Cliente desuscrito de recomendaciones:', socket.id);
  });

  // Room para administradores - notificaciones de cotizaciones
  socket.on('admin:subscribe', () => {
    socket.join('admin-notifications');
    console.log('Admin suscrito a notificaciones:', socket.id);
  });

  socket.on('admin:unsubscribe', () => {
    socket.leave('admin-notifications');
    console.log('Admin desuscrito de notificaciones:', socket.id);
  });
});

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/users', require('./routes/users.route'));
app.use('/api/products', require('./routes/products.route'));
app.use('/api/quotes', require('./routes/quotes.route'));
app.use('/api/cart', require('./routes/cart.route'));
app.use('/api/pdf-quote', require('./routes/pdfQuote.route'));
app.use('/api/image-quote', require('./routes/imageQuote.route'));
app.use('/api/estados', require('./routes/estado.route'));
app.use('/api/listas', require('./routes/listaescolar.route'));
app.use('/api/items', require('./routes/itemlista.route'));
app.use('/api/proveedores', require('./routes/proveedor.route'));
app.use('/api/precios', require('./routes/precioproveedor.route'));
app.use('/api/detalles', require('./routes/detallecotizacion.route'));
app.use('/api/ventas', require('./routes/ventas.route'));
app.use('/api/recomendaciones', require('./routes/recomendacion.route'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`WebSocket habilitado en puerto ${PORT}`);

  // Iniciar sincronización automática de recomendaciones
  const SYNC_INTERVAL_HOURS = parseInt(process.env.SYNC_INTERVAL_HOURS) || 1;
  recomendacionService.iniciarSincronizacionAutomatica(SYNC_INTERVAL_HOURS);
  console.log(
    `Sincronización automática configurada (cada ${SYNC_INTERVAL_HOURS} hora(s))`
  );
});

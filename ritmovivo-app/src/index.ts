import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // tu frontend
    credentials: true,
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Importa tus rutas existentes
// Ejemplo: import authRoutes from './routes/auth';
// app.use('/api/auth', authRoutes);
// app.use('/api/usuarios', usuarioRoutes);
// ... etc.

// Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-class', (claseId: string) => {
    socket.join(`clase-${claseId}`);
    console.log(`Socket ${socket.id} se unió a clase-${claseId}`);
  });

  socket.on('send-message', (data) => {
    io.to(`clase-${data.claseId}`).emit('new-message', {
      user: data.user,
      message: data.message,
      time: new Date(),
    });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
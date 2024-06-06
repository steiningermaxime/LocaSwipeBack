const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

const indexRoutes = require('./api/routes/routes')(db, io);
app.use('/api', indexRoutes);

app.use('/api-locaswipe', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// Socket.IO configuration
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('sendMessage', async (message) => {
    console.log('Message reçu du client:', message);
    const { conversation_id, sender_id, content } = message;
    const query = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
    try {
      const [results] = await db.execute(query, [conversation_id, sender_id, content]);
      const newMessageId = results.insertId;
      const fetchMessageQuery = `
        SELECT m.*, u.firstname AS sender_firstname, u.lastname AS sender_lastname
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `;
      const [fetchResults] = await db.execute(fetchMessageQuery, [newMessageId]);
      const newMessage = fetchResults[0];
      console.log('Nouveau message inséré et émis:', newMessage);
      io.emit('newMessage', newMessage);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  });
});

const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

dotenv.config();

const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();

// Load SSL certificates
const httpsOptions = {
  key: fs.readFileSync('/root/key.pem'),
  cert: fs.readFileSync('/root/cert.pem')
};

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

const indexRoutes = require('./api/routes/routes')(db, socketIo);
app.use('/api', indexRoutes);

app.use('/api-locaswipe', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3000;

// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(port, () => {
  console.log(`App listening at https://locaswipe.fr:${port}`);
});

// Socket.IO configuration
const io = socketIo(httpsServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow requests with no origin
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  // No logging for user connection and disconnection

  socket.on('disconnect', () => {
    // No logging for user disconnection
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
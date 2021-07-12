require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');
const conversationsRoute = require('./routes/conversations');
const messagesRoute = require('./routes/messages');

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  () => {
    console.log('Connected to MONGO 🥭');
  }
);

// path for images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// middleware
app.use(cors());
app.use(express.json()); // body parses for requests
app.use(helmet());
app.use(morgan('common'));

// uploading images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  }
});
const upload = multer({storage});
// this should in another route, but for the sake of time, it is here
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    return res.status(200).json('File uploaded!');
  } catch (err) {
    console.log(err);
  }
});

// routes
app.get('/', (req, res) => {
  res.status(200).json({
    home: 'Social Network API',
    auth: '/api/auth',
    users: '/api/users',
    posts: '/api/posts'
  });
});

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationsRoute);
app.use('/api/messages', messagesRoute);

app.listen(process.env.PORT, () => {
  console.log('Backend server is running 🏃!');
});

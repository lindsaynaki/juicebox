require('dotenv').config();
const express = require('express');
const app = express();
const { client } = require('./db');
const morgan = require('morgan');
const { PORT } = process.env;

app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
        console.log("<____Body Logger START____>");
        console.log(req.body);
        console.log("<_____Body Logger END_____>");
  
    next();
});

app.use('/api', require('./api'))

// 404 handler
app.use('*', (req, res, next) => {
  res.status(404).send({
    name: "404",
    message: "Page Not Found"
  })
});

app.listen(PORT, () => {
  console.log('The server is up on port', `http://localhost:${PORT}`)
  client.connect();
});
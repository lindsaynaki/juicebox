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

// const router = require('./api')
// app.use('/api', router)
app.use('/api', require('./api'))

// app.use((req, res, next) => {
//   const token = jwt.sign({ 
//     "username": "albert", 
//     "password": "bertie99",
//     "id": 1,
//     }, JWT_SECRET);
//   console.log(token)
//   next();
// });

app.listen(PORT, () => {
  console.log('The server is up on port', `http://localhost:${PORT}`)
  client.connect();
});
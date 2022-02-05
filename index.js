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

// app.get('/background/:color', (req, res, next) => {
//   res.send(`
//     <body style="background: ${ req.params.color };">
//       <h1>Hello World</h1>
//     </body>
//   `);
// });

// app.get('/add/:first/to/:second', (req, res, next) => {
//   res.send(`<h1>${ req.params.first } + ${ req.params.second } = ${
//     Number(req.params.first) + Number(req.params.second)
//    }</h1>`);
// });

app.listen(PORT, () => {
  console.log('The server is up on port', `http://localhost:${PORT}`)
  client.connect();
});
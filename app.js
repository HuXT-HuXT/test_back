/*
npm init -y
npm install express
npm install nodemon -D
npm install multer
*/

const express = require('express');
const mongoose = require('mongoose'); /* npm i mongoose */
const bodyParser = require('body-parser'); /* npm i body-parser */
const { cors } = require('./middleware/cors');

const PORT = 80;

mongoose.connect('mongodb://127.0.0.1:27017/newdbinsta', {
  useNewUrlParser: true,
  autoIndex: true,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(cors);

app.use(require('./routes/sign'));
app.use(require('./middleware/auth'));
app.use(require('./routes/users'));
app.use(require('./routes/photos'));

app.listen(PORT, () => {
  console.log('Server up');
});

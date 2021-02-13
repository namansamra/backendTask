const express = require('express');
const schoolRoutes = require('./routes/school');
const userRoutes = require('./routes/user')
const db = require('./db');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  // Set CORS headers so that the React SPA is able to communicate with this server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.use('/user',userRoutes)
app.use('/school', schoolRoutes);



db.initDb((err, db) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(3100);
  }
});

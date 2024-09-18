const socketIO = require('socket.io');
const express = require('express');
const db = require('../src/DAL/db')
const http = require('http');
const app = express();
const routes = require('../api/routes.js')
const jwtWrapper = require('../src/middlewares/jwtWrapper.js');
const config = require('../private/configuration.json')
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

let server = http.createServer(app);


db.instantiate()
app.enable('trust proxy');
app.use(cors({origin:"*", optionsSuccessStatus: 200}));
app.use(helmet({contentSecurityPolicy: false}));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(bodyParser.json({limit:"500mb"}));
app.use(express.static('public'));
app.use(jwtWrapper.verifyToken);
app.use("/", routes)


const port = process.env.PORT || 80;






server.listen(port, (err) => {
    
    if (err) throw new Error(err);
    
    console.log(`Servidor corriendo en puerto ${ port }`);
    
});


// IO = esta es la comunicacion del backend
module.exports.io = socketIO(server);
require('./sockets/socket');
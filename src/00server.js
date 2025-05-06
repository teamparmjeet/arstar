import express from 'express';
import cors from "cors";
import configViewEngine from './config/configEngine';
import cronJobContronler from './controllers/cronJobContronler';
import socketIoController from './controllers/socketIoController';
import routes from './routes/web';
require('dotenv').config();
let cookieParser = require('./config/connectDB');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

const corsOptions ={
    origin:'http://localhost:3024', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
// app.use(cors());

app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup viewEngine
configViewEngine(app);
// init Web Routes
routes.initWebRouter(app);

// Cron game 1 Phut 
cronJobContronler.cronJobGame1p(io);

// Check xem ai connect vào sever 
socketIoController.sendMessageAdmin(io);

// app.all('*', (req, res) => {
//     return res.render("404.ejs"); 
// });

server.listen(port, () => {
    console.log("Connected success port: " + port);
});


import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import { chatRouter } from './routes/v1/chat/index.js';
import { authRouter } from './routes/v1/auth/index.js';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";
import { ManagerController } from './controller/room.controller.js';
import uploadRouter from './routes/v1/upload/index.js';
import userRouter from './routes/v1/user/user.route.js';
import path from 'path';
import { fileURLToPath } from 'url';


const app: Express = express();
const server = createServer(app);

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, '../uploads')));

app.use('/hello-world', (_req, res) => {
    res.send('Hello World');
});

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))

app.use('/api/v1/room', chatRouter);
app.use('/api/v1/auth', authRouter);

app.use("/upload", uploadRouter);
app.use("/user", userRouter)

/* 
    SOCKET.IO
*/
const Manager = new ManagerController(new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
}));


export default server;
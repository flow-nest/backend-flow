import express from 'express';
import authRouter from './routes/auth.route';
import adminRouter from './routes/admin.route'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors'

const app = express();

// middlewares
app.use(cors({origin:"http://localhost:3001", credentials: true}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth",authRouter)
app.use("/api/admin", adminRouter)

export default app;

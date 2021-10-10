import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/board.js";
import db from './models/index.js';
const app = express();


//db 연결
// seq.authenticate()
//     .then(() => {
//         console.log('연결 성공');
//     })
//     .catch(err => {
//         console.error('연결 실패', err);
//     }
//     )
db.sequelize.sync().then(()=>{
    console.log("sync 끝")
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/users", userRouter);
    app.use("/boards", boardRouter);
    app.listen(3000);
    });
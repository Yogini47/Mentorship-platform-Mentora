import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { messageSocketHandler } from "./sockets/chat.socket.js"
//import { messageSocketHandler } from "./sockets/message.socket.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        const httpServer = createServer(app);

        const io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            },
        });

        // Initialize socket handlers
        messageSocketHandler(io);

        const startServer = () => {
            try {
                httpServer.listen(process.env.PORT || 8000, () => {
                    console.log(`⚙️ Server is running on port: ${process.env.PORT}`);
                });
            } catch (error) {
                console.log("⚠️ Error:", error);
                process.exit(1);
            }
        };

        startServer();
    })
    .catch((err) => {
        console.log("MONGO DB connection failed !!! ", err);
    })



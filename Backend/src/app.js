import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express()
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
// app.use(express.json({ limit: "16kb" }))
app.use(express.json({limit: "10mb"}))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static("public"))
app.use(cookieParser())
//routes
import userRouter from "./routers/user.router.js"
import mentorRoutes from "./routers/mentor.router.js";
import sessionRouter from "./routers/session.router.js";
import blogRouter from "./routers/blog.router.js";
import chatRouter from "./routers/chat.router.js";
import messageRoutes from "./routers/message.router.js";
import menteeRouter from "./routers/mentee.router.js";
import uploadRouter from "./routers/upload.router.js";
app.use("/api/v2/upload", uploadRouter);


app.use("/api/v2/users/mentees", menteeRouter);

app.use("/api/v2/users/messages", messageRoutes);
//chat route
app.use("/api/v2/users/chat", chatRouter);
//blog route
app.use("/api/v2/users/blogs", blogRouter);
//session route
app.use("/api/v2/users/session", sessionRouter);

// Use Routes
app.use("/api/v2/users/mentors", mentorRoutes);

//routes declaration
app.use("/api/v2/users", userRouter)


// http://localhost:8000/api/v2/users/mentees/:id
// http://localhost:8000/api/v2/users/mentor/:mentorId/connected-mentees
export { app }

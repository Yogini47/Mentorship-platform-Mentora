import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";  // <-- wherever your multer config is
import { uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/", verifyJWT, upload.single("file"), uploadFile);

export default router;

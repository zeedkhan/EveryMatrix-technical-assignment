import { Router } from "express";
import { useMulter } from "../../../controller/multer.js";

const uploadRouter = Router();

uploadRouter.post("/", useMulter.single("image"), (req, res) => {
    if (req.file) {
        
        const storePath = `/uploads/${req.file.filename}`;
        
        res.status(200).json({ storePath: storePath, message: 'Image uploaded successfully', file: req.file });
    } else {
        res.status(400).json({ message: 'Image upload failed' });
    }
});


export default uploadRouter;
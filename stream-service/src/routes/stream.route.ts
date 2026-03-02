import { Router } from "express";
import { streamBook } from "../controller/stream.controller";

const router = Router();

router.get("/:id", streamBook);

export default router;
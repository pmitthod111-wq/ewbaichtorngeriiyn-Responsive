import { Router, type IRouter } from "express";
import announcementsRouter from "./announcements";
import healthRouter from "./health";
import inquiriesRouter from "./inquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inquiriesRouter);
router.use(announcementsRouter);

export default router;

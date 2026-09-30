import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateAnnouncementBody,
  CreateAnnouncementResponse,
  DeleteAnnouncementParams,
  ListAdminAnnouncementsResponse,
  ListPublicAnnouncementsResponse,
  UpdateAnnouncementBody,
  UpdateAnnouncementParams,
  UpdateAnnouncementResponse,
} from "@workspace/api-zod";
import { announcementsTable, db } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/announcements", async (_req, res): Promise<void> => {
  const announcements = await db
    .select()
    .from(announcementsTable)
    .where(eq(announcementsTable.published, true))
    .orderBy(desc(announcementsTable.createdAt));

  res.json(ListPublicAnnouncementsResponse.parse(announcements));
});

router.get(
  "/admin/announcements",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const announcements = await db
      .select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.createdAt));

    res.json(ListAdminAnnouncementsResponse.parse(announcements));
  },
);

router.post(
  "/admin/announcements",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = CreateAnnouncementBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [announcement] = await db
      .insert(announcementsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json(CreateAnnouncementResponse.parse(announcement));
  },
);

router.patch(
  "/admin/announcements/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateAnnouncementParams.safeParse(req.params);
    const parsed = UpdateAnnouncementBody.safeParse(req.body);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [announcement] = await db
      .update(announcementsTable)
      .set(parsed.data)
      .where(eq(announcementsTable.id, params.data.id))
      .returning();

    if (!announcement) {
      res.status(404).json({ error: "Announcement not found" });
      return;
    }

    res.json(UpdateAnnouncementResponse.parse(announcement));
  },
);

router.delete(
  "/admin/announcements/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = DeleteAnnouncementParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [announcement] = await db
      .delete(announcementsTable)
      .where(eq(announcementsTable.id, params.data.id))
      .returning();

    if (!announcement) {
      res.status(404).json({ error: "Announcement not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
import { desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateInquiryBody,
  CreateInquiryResponse,
  GetAdminSummaryResponse,
  ListAdminInquiriesResponse,
  UpdateInquiryStatusBody,
  UpdateInquiryStatusParams,
  UpdateInquiryStatusResponse,
} from "@workspace/api-zod";
import { db, inquiriesTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inquiry] = await db
    .insert(inquiriesTable)
    .values({
      ...parsed.data,
      message: parsed.data.message ?? null,
    })
    .returning();

  res.status(201).json(CreateInquiryResponse.parse(inquiry));
});

router.get(
  "/admin/inquiries",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const inquiries = await db
      .select()
      .from(inquiriesTable)
      .orderBy(desc(inquiriesTable.createdAt));

    res.json(ListAdminInquiriesResponse.parse(inquiries));
  },
);

router.get(
  "/admin/summary",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        newCount: sql<number>`count(*) filter (where ${inquiriesTable.status} = 'new')::int`,
        inProgressCount: sql<number>`count(*) filter (where ${inquiriesTable.status} = 'in_progress')::int`,
        resolvedCount: sql<number>`count(*) filter (where ${inquiriesTable.status} = 'resolved')::int`,
      })
      .from(inquiriesTable);
    const recentInquiries = await db
      .select()
      .from(inquiriesTable)
      .orderBy(desc(inquiriesTable.createdAt))
      .limit(5);

    res.json(
      GetAdminSummaryResponse.parse({
        totalInquiries: counts.total,
        newInquiries: counts.newCount,
        inProgressInquiries: counts.inProgressCount,
        resolvedInquiries: counts.resolvedCount,
        recentInquiries,
      }),
    );
  },
);

router.patch(
  "/admin/inquiries/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateInquiryStatusParams.safeParse(req.params);
    const body = UpdateInquiryStatusBody.safeParse(req.body);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [inquiry] = await db
      .update(inquiriesTable)
      .set({ status: body.data.status })
      .where(eq(inquiriesTable.id, params.data.id))
      .returning();

    if (!inquiry) {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }

    res.json(UpdateInquiryStatusResponse.parse(inquiry));
  },
);

export default router;
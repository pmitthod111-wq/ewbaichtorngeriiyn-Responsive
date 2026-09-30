import { clerkClient, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in is required" });
    return;
  }

  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) {
    req.log.error("ADMIN_EMAIL is not configured");
    res.status(503).json({ error: "Administrator access is not configured" });
    return;
  }

  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId,
  )?.emailAddress;

  if (primaryEmail?.trim().toLowerCase() !== allowedEmail) {
    res.status(403).json({ error: "Administrator access required" });
    return;
  }

  next();
};
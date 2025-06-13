import "dotenv/config";
import { defineApp } from "convex/server";
import clerk from "@convex-dev/clerk";

const app = defineApp();
app.use(clerk, {
  domain: process.env.CLERK_DOMAIN!,
});

export default app;
import Fastify from "fastify";
import cors from "@fastify/cors";
import { clerkPlugin, getAuth, clerkClient } from "@clerk/fastify";
import { verifyToken } from "@clerk/backend";
import { z } from "zod";

const MAX_WORKSPACES_PER_USER = 49;

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required.")
    .max(999, "Workspace name must be 999 characters or fewer."),
  orgType: z.enum(["school", "training_institute", "online_institute"] as const, {
    error: "A valid workspace type is required.",
  }),
  address: z.object({
    line1: z.string().min(1, "Address line 1 is required."),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required."),
    state: z.string().min(1, "State / region is required."),
    postalCode: z.string().min(1, "Postal code is required."),
    country: z.string().min(1, "Country is required."),
  }),
});

const fastify = Fastify({
  logger: true,
});

const startServer = async () => {
  // 1. Enable CORS for the client SPA
  await fastify.register(cors, {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // 2. Register Clerk authentication plugin globally
  await fastify.register(clerkPlugin);

  // Public Home Route
  fastify.get("/", async () => {
    return {
      message: "Hello from Fastify + Bun + Turborepo!",
      time: new Date().toISOString(),
      authStatus: "Clerk Authentication Loaded Successfully",
    };
  });

  // Health Route
  fastify.get("/health", async () => ({ status: "ok" }));

  // 3. Protected API Endpoint
  fastify.get("/api/protected", async (request, reply) => {
    const authState = getAuth(request);

    // If userId is missing, request is not authenticated
    if (!authState.userId) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Access Denied: You must be logged in to access this secure endpoint.",
      });
    }

    // Return secure payload and user auth session metadata
    return {
      success: true,
      message: "Hello from the secure Fastify API endpoint!",
      timestamp: new Date().toISOString(),
      auth: {
        userId: authState.userId,
        sessionId: authState.sessionId,
        orgId: authState.orgId,
        sessionClaims: authState.sessionClaims,
      },
    };
  });

  // 4. Create a Workspace (Clerk Organization) — see docs/adr/0002
  fastify.post("/api/workspaces", async (request, reply) => {
    // Authorize by verifying the bearer token directly rather than getAuth().
    // Creating the first Workspace is what resolves Clerk's `choose-organization`
    // session task, so the caller's session is still `pending` at this point —
    // and getAuth() treats pending sessions as signed out (userId null).
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const secretKey = process.env.CLERK_SECRET_KEY;

    let userId: string | undefined;
    if (token && secretKey) {
      try {
        const payload = await verifyToken(token, { secretKey });
        userId = payload.sub;
      } catch (err) {
        fastify.log.warn({ err }, "Workspace create: token verification failed");
      }
    }

    if (!userId) {
      return reply.status(401).send({ message: "You must be signed in to create a workspace." });
    }

    const parsed = createWorkspaceSchema.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request body.";
      return reply.status(400).send({ message });
    }

    const { name, orgType, address } = parsed.data;

    try {
      const { totalCount } = await clerkClient.users.getOrganizationMembershipList({ userId, limit: 1 });
      if (totalCount >= MAX_WORKSPACES_PER_USER) {
        return reply
          .status(403)
          .send({ message: `You can belong to at most ${MAX_WORKSPACES_PER_USER} workspaces.` });
      }

      const organization = await clerkClient.organizations.createOrganization({
        name,
        createdBy: userId,
        publicMetadata: { orgType, address },
      });
      return reply.status(201).send({ orgId: organization.id });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(502).send({ message: "Failed to create workspace. Please try again." });
    }
  });

  try {
    await fastify.listen({ port: 4000, host: "0.0.0.0" });
    console.log("🚀 Fastify server running at http://localhost:4000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

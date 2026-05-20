import Fastify from "fastify";
import cors from "@fastify/cors";
import { clerkPlugin, getAuth } from "@clerk/fastify";

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

  try {
    await fastify.listen({ port: 4000, host: "0.0.0.0" });
    console.log("🚀 Fastify server running at http://localhost:4000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

import { getAuth } from "@clerk/fastify";
import {
  createAcademicYearSchema,
  createClassSectionSchema,
  createGradeLevelSchema,
  createStreamSchema,
  createStudentSchema,
  enrollStudentSchema,
  promoteStudentSchema,
} from "@repo/contracts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import { CreateStudent } from "./application/commands/create-student";
import { EnrollStudent } from "./application/commands/enroll-student";
import { PromoteStudent } from "./application/commands/promote-student";
import { DomainError } from "./domain/shared/errors";
import { toAcademicYearDto, toClassSectionDto, toGradeLevelDto, toStreamDto } from "./dto";
import { DrizzleClassSectionLookup } from "./infrastructure/drizzle-class-section-lookup";
import { DrizzleEnrolmentRepository } from "./infrastructure/drizzle-enrolment-repository";
import { DrizzleStudentRepository } from "./infrastructure/drizzle-student-repository";
import * as read from "./infrastructure/queries";
import * as setup from "./infrastructure/setup-store";

/** Resolve the active workspace from the Clerk session, then run the handler with domain-error mapping. */
async function withWorkspace(
  request: FastifyRequest,
  reply: FastifyReply,
  fn: (workspaceId: string) => Promise<void>,
): Promise<void> {
  const { orgId } = getAuth(request);
  if (!orgId) {
    reply.status(403).send({ message: "No active workspace. Select or create a workspace first." });
    return;
  }
  try {
    await fn(orgId);
  } catch (err) {
    if (err instanceof DomainError) {
      const status = err.code === "not_found" ? 404 : err.code === "conflict" ? 409 : 400;
      reply.status(status).send({ message: err.message });
      return;
    }
    request.log.error(err);
    reply.status(500).send({ message: "Internal server error." });
  }
}

function parseBody<S extends z.ZodType>(schema: S, body: unknown, reply: FastifyReply): z.infer<S> | null {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    reply.status(400).send({ message: parsed.error.issues[0]?.message ?? "Invalid request body." });
    return null;
  }
  return parsed.data;
}

function idParam(request: FastifyRequest): string {
  return (request.params as { id: string }).id;
}

export async function schoolRoutes(fastify: FastifyInstance): Promise<void> {
  // Composition root for the School module.
  const studentRepo = new DrizzleStudentRepository();
  const enrolmentRepo = new DrizzleEnrolmentRepository();
  const classSectionLookup = new DrizzleClassSectionLookup();

  const createStudent = new CreateStudent(studentRepo);
  const enrollStudent = new EnrollStudent(enrolmentRepo, studentRepo, classSectionLookup);
  const promoteStudent = new PromoteStudent(enrolmentRepo, classSectionLookup);

  /* ---------------------------------- Setup ---------------------------------- */

  fastify.post("/api/academic-years", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const body = parseBody(createAcademicYearSchema, request.body, reply);
      if (!body) return;
      reply.status(201).send(toAcademicYearDto(await setup.createAcademicYear(workspaceId, body)));
    }),
  );
  fastify.get("/api/academic-years", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      reply.send((await setup.listAcademicYears(workspaceId)).map(toAcademicYearDto));
    }),
  );

  fastify.post("/api/grade-levels", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const body = parseBody(createGradeLevelSchema, request.body, reply);
      if (!body) return;
      reply.status(201).send(toGradeLevelDto(await setup.createGradeLevel(workspaceId, body)));
    }),
  );
  fastify.get("/api/grade-levels", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      reply.send((await setup.listGradeLevels(workspaceId)).map(toGradeLevelDto));
    }),
  );

  fastify.post("/api/streams", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const body = parseBody(createStreamSchema, request.body, reply);
      if (!body) return;
      reply.status(201).send(toStreamDto(await setup.createStream(workspaceId, body)));
    }),
  );
  fastify.get("/api/streams", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      reply.send((await setup.listStreams(workspaceId)).map(toStreamDto));
    }),
  );

  fastify.post("/api/class-sections", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const body = parseBody(createClassSectionSchema, request.body, reply);
      if (!body) return;
      reply.status(201).send(toClassSectionDto(await setup.createClassSection(workspaceId, body)));
    }),
  );
  fastify.get("/api/class-sections", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      reply.send((await setup.listClassSections(workspaceId)).map(toClassSectionDto));
    }),
  );

  /* --------------------------------- Students -------------------------------- */

  fastify.post("/api/students", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const body = parseBody(createStudentSchema, request.body, reply);
      if (!body) return;
      reply.status(201).send(await createStudent.execute(workspaceId, body));
    }),
  );
  fastify.get("/api/students", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      reply.send(await read.listStudents(workspaceId));
    }),
  );
  fastify.get("/api/students/:id", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const student = await read.getStudentById(workspaceId, idParam(request));
      if (!student) {
        reply.status(404).send({ message: "Student not found." });
        return;
      }
      reply.send(student);
    }),
  );

  /* -------------------------------- Enrolments ------------------------------- */

  fastify.post("/api/enrolments", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const body = parseBody(enrollStudentSchema, request.body, reply);
      if (!body) return;
      reply.status(201).send(await enrollStudent.execute(workspaceId, body));
    }),
  );

  fastify.post("/api/students/:id/promotion", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      const body = parseBody(promoteStudentSchema, request.body, reply);
      if (!body) return;
      reply
        .status(201)
        .send(await promoteStudent.execute(workspaceId, { studentId: idParam(request), ...body }));
    }),
  );

  fastify.get("/api/class-sections/:id/students", (request, reply) =>
    withWorkspace(request, reply, async (workspaceId) => {
      reply.send(await read.getStudentsByClassSection(workspaceId, idParam(request)));
    }),
  );
}

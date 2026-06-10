import { and, classSections, db, eq } from "@repo/db";
import type { DB } from "@repo/db";
import type { ClassSectionLookup, ClassSectionRef } from "../application/ports";

export class DrizzleClassSectionLookup implements ClassSectionLookup {
  readonly #db: DB;

  constructor(database: DB = db) {
    this.#db = database;
  }

  async findRef(workspaceId: string, classSectionId: string): Promise<ClassSectionRef | null> {
    const [row] = await this.#db
      .select({
        id: classSections.id,
        academicYearId: classSections.academicYearId,
        status: classSections.status,
      })
      .from(classSections)
      .where(and(eq(classSections.workspaceId, workspaceId), eq(classSections.id, classSectionId)))
      .limit(1);
    return row ?? null;
  }
}

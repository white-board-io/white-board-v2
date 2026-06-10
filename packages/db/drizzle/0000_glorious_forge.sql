CREATE TYPE "public"."academic_year_status" AS ENUM('draft', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."grade_level_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."stream_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."class_section_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."enrolment_status" AS ENUM('active', 'promoted', 'transferred', 'left', 'repeated');--> statement-breakpoint
CREATE TABLE "academic_years" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"status" "academic_year_status" DEFAULT 'draft' NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_years_starts_before_ends_chk" CHECK ("academic_years"."starts_on" < "academic_years"."ends_on")
);
--> statement-breakpoint
CREATE TABLE "grade_levels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "grade_level_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "stream_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_sections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"grade_level_id" uuid NOT NULL,
	"stream_id" uuid,
	"section_name" text NOT NULL,
	"display_name" text,
	"class_teacher_id" text,
	"capacity" integer,
	"status" "class_section_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_sections_identity_uq" UNIQUE NULLS NOT DISTINCT("workspace_id","academic_year_id","grade_level_id","stream_id","section_name")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"admission_number" text,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text,
	"date_of_birth" date NOT NULL,
	"status" "student_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_enrolments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"class_section_id" uuid NOT NULL,
	"roll_number" text,
	"status" "enrolment_status" DEFAULT 'active' NOT NULL,
	"enrolled_on" date,
	"exited_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_grade_level_id_grade_levels_id_fk" FOREIGN KEY ("grade_level_id") REFERENCES "public"."grade_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_class_section_id_class_sections_id_fk" FOREIGN KEY ("class_section_id") REFERENCES "public"."class_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academic_years_workspace_name_uq" ON "academic_years" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "academic_years_one_current_per_workspace_uq" ON "academic_years" USING btree ("workspace_id") WHERE "academic_years"."is_current" = true;--> statement-breakpoint
CREATE INDEX "academic_years_workspace_idx" ON "academic_years" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grade_levels_workspace_name_uq" ON "grade_levels" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "grade_levels_workspace_idx" ON "grade_levels" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "streams_workspace_name_uq" ON "streams" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "streams_workspace_idx" ON "streams" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "class_sections_workspace_idx" ON "class_sections" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "class_sections_academic_year_idx" ON "class_sections" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "class_sections_grade_level_idx" ON "class_sections" USING btree ("grade_level_id");--> statement-breakpoint
CREATE INDEX "class_sections_stream_idx" ON "class_sections" USING btree ("stream_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_workspace_admission_no_uq" ON "students" USING btree ("workspace_id","admission_number") WHERE "students"."admission_number" is not null;--> statement-breakpoint
CREATE INDEX "students_workspace_idx" ON "students" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enrolments_one_active_per_student_year_uq" ON "student_enrolments" USING btree ("student_id","academic_year_id") WHERE "student_enrolments"."status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "enrolments_roll_no_per_section_uq" ON "student_enrolments" USING btree ("class_section_id","roll_number") WHERE "student_enrolments"."roll_number" is not null;--> statement-breakpoint
CREATE INDEX "enrolments_workspace_idx" ON "student_enrolments" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "enrolments_student_idx" ON "student_enrolments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "enrolments_class_section_idx" ON "student_enrolments" USING btree ("class_section_id");--> statement-breakpoint
CREATE INDEX "enrolments_academic_year_idx" ON "student_enrolments" USING btree ("academic_year_id");
# Requirement: Class, Section, and Student Model

## Status
Draft

## Purpose
Whiteboard needs a simple school structure that supports Indian school operations without locking the product into one board, state, or academic calendar. This requirement defines the first version of Classes, Sections, Students, and Student Enrolments for a school Workspace.

The model must support:

- Schools operating by academic year.
- Familiar class names such as LKG, UKG, Class 1, Class 10, Class 12.
- Sections such as A, B, C, Rose, Blue.
- Student movement from one class-section to another across academic years.
- Historical records for marks, attendance, fees, reports, and transfer certificates later.

## Scope
In scope for the first version:

- Academic years.
- Grade levels, called "Classes" in the user interface.
- Class sections for a specific academic year.
- Simple student identity fields.
- Student enrolment into a class section for an academic year.
- Promotion history through enrolment records.

Out of scope for the first version:

- Detailed student profile fields such as gender, blood group, religion, caste, address, parent contacts, Aadhaar, EMIS, admission category, transport, hostel, and medical details.
- Subjects, exams, timetable, attendance, fees, and report cards.
- Board-specific class structures.
- Multi-campus school hierarchy.
- Student login and parent login.

## Domain Language
**Workspace**
The tenant boundary of the product. For a school, the Workspace represents one educational institution.

**Academic Year**
The operational school year, such as `2026-27`. Dates are owned by the school and may differ by board or state. For example, one school may use April to March while another may use June to May.

**Grade Level**
The reusable class level inside a Workspace, such as `LKG`, `UKG`, `Class 1`, `Class 5`, or `Class 10`. In the user interface this should usually be shown as "Class".

**Class Section**
The actual teaching group for one Academic Year, such as `Class 5 - A` in `2026-27`. This is the unit used for attendance, timetable, class teacher assignment, exams, and student lists.

**Student**
The person studying in the school. The Student record stores identity information that is stable across years.

**Student Enrolment**
The record that places a Student into one Class Section for one Academic Year. A new enrolment is created when a student is promoted, repeated, transferred to another section, or admitted into a new academic year.

## Product Rules
1. A Grade Level is not tied to one Academic Year.
2. A Section name by itself is not treated as a major entity in the MVP.
3. A Class Section always belongs to one Academic Year and one Grade Level.
4. A Student may exist without an active enrolment, but should not appear in class lists until enrolled.
5. A Student should have at most one active enrolment per Academic Year.
6. Promotion must not overwrite old enrolments. Promotion creates a new enrolment for the next Academic Year.
7. Historical class membership must remain available after promotion.
8. The UI may display `Class 5 - A`, but the database should store grade level and section separately.

## Recommended Data Model
### academic_years
Stores the school-owned academic calendar.

```txt
academic_years
  id
  workspace_id
  name              // "2026-27"
  starts_on         // date
  ends_on           // date
  status            // draft, active, closed
  is_current        // boolean
  created_at
  updated_at
```

Rules:

- `workspace_id + name` should be unique.
- Only one Academic Year should be current per Workspace.
- `starts_on` must be before `ends_on`.

### grade_levels
Stores reusable class levels.

```txt
grade_levels
  id
  workspace_id
  name              // "LKG", "UKG", "Class 1", "Class 10"
  short_name        // optional: "1", "10", "LKG"
  sort_order        // controls display order
  status            // active, archived
  created_at
  updated_at
```

Rules:

- `workspace_id + name` should be unique.
- `sort_order` should be unique within a Workspace when possible.
- Archived grade levels should not be available for new Class Sections.

### class_sections
Stores the actual class-section for one academic year.

```txt
class_sections
  id
  workspace_id
  academic_year_id
  grade_level_id
  section_name      // "A", "B", "Rose", "Blue"
  display_name      // optional denormalized value: "Class 5 - A"
  class_teacher_id  // optional, future staff reference
  capacity          // optional
  status            // active, archived
  created_at
  updated_at
```

Rules:

- `workspace_id + academic_year_id + grade_level_id + section_name` should be unique.
- `section_name` is required.
- `display_name` can be generated from Grade Level and Section Name. It should not be the source of truth.
- Class Sections should not be deleted if students have enrolments. Archive instead.

Example:

```txt
Academic Year: 2026-27
Grade Level: Class 5
Section Name: A
Display: Class 5 - A
```

### students
Stores the student identity record. This is intentionally small for the first version.

```txt
students
  id
  workspace_id
  first_name
  middle_name       // optional
  last_name
  date_of_birth
  status            // active, inactive
  created_at
  updated_at
```

Rules:

- `first_name` is required.
- `last_name` is required for MVP unless the product later decides to support single-name students.
- `middle_name` is optional.
- `date_of_birth` is required.
- Student names should be stored as entered by the school, not automatically reformatted beyond trimming whitespace.
- Students should not be hard-deleted once they have enrolments. Mark inactive instead.

### student_enrolments
Connects a Student to a Class Section for an Academic Year.

```txt
student_enrolments
  id
  workspace_id
  student_id
  academic_year_id
  class_section_id
  roll_number       // optional for MVP
  status            // active, promoted, transferred, left, repeated
  enrolled_on       // optional date
  exited_on         // optional date
  created_at
  updated_at
```

Rules:

- `student_id`, `academic_year_id`, and `class_section_id` are required.
- `class_section_id` must belong to the same `academic_year_id`.
- `student_id` must belong to the same `workspace_id`.
- A student should have at most one `active` enrolment in the same Academic Year.
- Roll number can be optional initially, but if provided it should be unique within one Class Section.
- When a student is promoted, the previous enrolment remains as history and a new enrolment is created in the next Academic Year.

## Why Section Is Not a Separate MVP Table
A plain section value like `A` does not have enough meaning by itself. `Class 1 - A`, `Class 5 - A`, and `Class 10 - A` are different operational groups. The same is true across academic years.

For the MVP, store the section name directly on `class_sections`.

A future `section_templates` table may be added if schools need standard reusable section labels:

```txt
section_templates
  id
  workspace_id
  name        // "A", "B", "Rose"
  sort_order
  status
```

This is deferred until there is a real product need.

## Core Workflows
### Set Up Academic Year
The school admin creates or confirms the current Academic Year.

Example:

```txt
Name: 2026-27
Starts On: 2026-06-01
Ends On: 2027-05-31
Status: active
Current: true
```

### Set Up Classes
The school admin creates Grade Levels once for the Workspace.

Example:

```txt
LKG
UKG
Class 1
Class 2
Class 3
...
Class 12
```

### Set Up Sections
For the current Academic Year, the school admin creates Class Sections.

Example:

```txt
2026-27
  Class 1
    Section A
    Section B

  Class 5
    Section A

  Class 10
    Section A
    Section B
```

### Create Student
The school admin creates a Student with minimal required details.

Required fields:

- First Name
- Last Name
- Date of Birth

Optional fields:

- Middle Name

### Enrol Student
The school admin selects:

- Academic Year
- Class
- Section

The system creates a Student Enrolment linking the Student to the selected Class Section.

### Promote Student
The school admin promotes a student from one Academic Year to the next.

Example:

```txt
2025-26: Student X -> Class 5 - A
2026-27: Student X -> Class 6 - B
```

The old enrolment remains unchanged. The new enrolment records the new class placement.

## UI Requirements
1. In setup screens, use the label "Class" for Grade Level because that matches school vocabulary.
2. In technical documentation and code, prefer `GradeLevel` to avoid confusion with programming classes.
3. In student lists, show the current Class Section as `Class 5 - A`.
4. When creating a section, the admin should select Academic Year and Class, then enter Section Name.
5. The system should prevent duplicate sections for the same Class and Academic Year.
6. The student profile should show the current enrolment and, later, past enrolment history.

## MVP Acceptance Criteria
1. Admin can create an Academic Year.
2. Admin can create Grade Levels for the Workspace.
3. Admin can create Class Sections under an Academic Year and Grade Level.
4. Admin can create a Student with first name, optional middle name, last name, and date of birth.
5. Admin can enrol a Student into a Class Section.
6. Admin cannot create duplicate Class Sections for the same Academic Year, Grade Level, and Section Name.
7. Admin cannot actively enrol the same Student into two Class Sections in the same Academic Year.
8. Admin can view students by Class Section.
9. Student class history is preserved across academic years.

## Open Questions
1. Should `last_name` be required for all students, or should the system support single-name students from day one?
2. Should admission number be added now, even if other student profile fields are deferred?
3. Should roll number be required during enrolment or optional until class lists are finalized?
4. Should the first version support multiple boards within one Workspace, such as CBSE and State Board running together?
5. Should Class 11 and Class 12 require stream/group fields in MVP, or can that wait until subject setup?

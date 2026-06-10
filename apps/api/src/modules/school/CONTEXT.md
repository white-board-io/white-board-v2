# School

The academic-operations context for a school Workspace. Models how a school
organizes its year, its classes, and the students moving through them. Operates
entirely inside one Workspace and owns its own Student — see
[CONTEXT-MAP.md](../../../../../CONTEXT-MAP.md).

## Language

**Academic Year**:
The operational school year owned by the school, e.g. `2026-27`. Its start/end
dates are school-defined and may differ by board or state. At most one is current
per Workspace.

**Grade Level**:
A reusable class level inside a Workspace, e.g. `LKG`, `Class 1`, `Class 10`. Not
tied to any one Academic Year.
_Avoid_: "Class" in code (use only in UI), "Standard", "Grade" alone.

**Class Section**:
The actual teaching group for one Academic Year — one Grade Level plus a section
name, e.g. `Class 5 - A` in `2026-27`. The unit students are listed under.
_Avoid_: "Class" (ambiguous with Grade Level), "Division", "Batch" (that's a
Training Institute term).

**Section Name**:
The label distinguishing parallel groups of the same Grade Level in the same year,
e.g. `A`, `B`, `Rose`. Not a standalone entity in the MVP — stored on the Class
Section.

**Stream**:
A configurable, per-Workspace academic track for higher grades, e.g. `Science`,
`Commerce`, `Arts`. A reusable lookup (like Grade Level), referenced by a Class
Section. Optional — null for grades that have no streams (LKG–Class 10). When
present, it is part of the Class Section's identity, so `Class 11 - A (Science)`
and `Class 11 - A (Commerce)` are distinct sections.
_Avoid_: "Group", "Branch".

**Student**:
A person studying at the school, holding identity fields stable across years.
School-owned; there is no cross-vertical shared learner.
_Avoid_: "Learner", "Pupil", "Trainee" (Training Institute), "Member" (Online).

**Student Enrolment**:
The record placing one Student into one Class Section for one Academic Year. The
join that carries roll number and lifecycle status. History, not overwrite.
_Avoid_: "Admission" (that's the first-ever enrolment, a narrower idea),
"Registration".

**Promotion**:
Advancing a Student to the next Academic Year by _closing_ the current Enrolment
(status `active → promoted`) and opening a new `active` Enrolment in the next
year. The prior placement is never overwritten — only its status advances.

## Relationships

- A **Workspace** has many **Academic Years**, **Grade Levels**, **Students**.
- A **Class Section** belongs to exactly one **Academic Year** and one **Grade
  Level**, and optionally one **Stream**; its Academic Year must match the
  Enrolment's.
- A **Student Enrolment** links one **Student** to one **Class Section** for one
  **Academic Year**.
- A **Student** has exactly one _active_ **Student Enrolment** at a time, and
  many terminal ones across years (their history). Promotion, transfer, and
  repeat close the active one and open a new active one; leaving only closes.
- **Promotion** produces a new **Student Enrolment** in the next **Academic
  Year**, never mutating the prior one.

## Example dialogue

> **Dev:** "When the admin promotes a Student, do we update their Enrolment's
> class to the new one?"
> **Domain expert:** "No — the old Enrolment stays exactly as it was. Promotion
> _creates a new Enrolment_ in the next Academic Year. We need the history for
> transfer certificates and report cards."
> **Dev:** "And a Student with no Enrolment?"
> **Domain expert:** "Allowed — they exist but don't show up in any class list
> until they're enrolled."

## Flagged ambiguities

- "Class" means **Grade Level** to a school but a **Class Section** in operations,
  and a `class` in code. Resolved: UI says "Class"; code says `GradeLevel` and
  `ClassSection`; never bare "Class" in code.
- "Enrolment" vs "Admission": Admission is the _first_ Enrolment into the school.
  MVP treats both as Student Enrolment records and does not model Admission
  separately.

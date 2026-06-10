import { zodResolver } from "@hookform/resolvers/zod";
import {
  enrollStudentSchema,
  promoteStudentSchema,
  type ClassSectionDto,
  type EnrollStudentInput,
  type GradeLevelDto,
  type PromoteStudentInput,
  type StreamDto,
} from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field } from "../../../../../components/field";
import { PageHeader } from "../../../../../components/page-header";
import { ErrorState, Spinner, errorMessage } from "../../../../../components/states";
import { useClassSections } from "../../../../../features/class-sections/api";
import { useGradeLevels } from "../../../../../features/grade-levels/api";
import { useEnrollStudent, usePromoteStudent, useStudent } from "../../../../../features/students/api";
import { useStreams } from "../../../../../features/streams/api";
import { useAcademicYearStore } from "../../../../../store/academic-year";

export const Route = createFileRoute("/_authenticated/people/students/$studentId")({
  component: StudentDetailPage,
});

function nameOf(p: { firstName: string; middleName: string | null; lastName: string | null }): string {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
}

function sectionLabel(s: ClassSectionDto, grades?: GradeLevelDto[], streams?: StreamDto[]): string {
  const grade = grades?.find((g) => g.id === s.gradeLevelId)?.name ?? "Class";
  const stream = s.streamId ? (streams?.find((x) => x.id === s.streamId)?.name ?? null) : null;
  return `${grade} - ${s.sectionName}${stream ? ` (${stream})` : ""}`;
}

function EnrolDialog({
  studentId,
  open,
  onOpenChange,
}: {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const selectedYearId = useAcademicYearStore((s) => s.selectedYearId);
  const enroll = useEnrollStudent(studentId);
  const sections = useClassSections();
  const grades = useGradeLevels();
  const streams = useStreams();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnrollStudentInput>({ resolver: zodResolver(enrollStudentSchema), defaultValues: { studentId } });

  const options = (sections.data ?? []).filter((s) => !selectedYearId || s.academicYearId === selectedYearId);

  const onSubmit = async (values: EnrollStudentInput) => {
    try {
      await enroll.mutateAsync(values);
      reset({ studentId });
      onOpenChange(false);
    } catch (err) {
      setError("root", { message: errorMessage(err) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enrol student</DialogTitle>
          <DialogDescription>Place this student into a section for the selected academic year.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
          <Field label="Section" error={errors.classSectionId?.message}>
            <Controller
              control={control}
              name="classSectionId"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {sectionLabel(s, grades.data, streams.data)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Roll number (optional)" htmlFor="rollNumber" error={errors.rollNumber?.message}>
            <Input id="rollNumber" {...register("rollNumber")} />
          </Field>
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Enrol
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PromoteDialog({
  studentId,
  currentYearId,
  open,
  onOpenChange,
}: {
  studentId: string;
  currentYearId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const promote = usePromoteStudent(studentId);
  const sections = useClassSections();
  const grades = useGradeLevels();
  const streams = useStreams();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PromoteStudentInput>({ resolver: zodResolver(promoteStudentSchema) });

  // Promotion targets a different year than the current placement.
  const options = (sections.data ?? []).filter((s) => s.academicYearId !== currentYearId);

  const onSubmit = async (values: PromoteStudentInput) => {
    try {
      await promote.mutateAsync(values);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError("root", { message: errorMessage(err) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote student</DialogTitle>
          <DialogDescription>
            Close the current enrolment and open a new one in a later academic year.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
          <Field label="Target section" error={errors.toClassSectionId?.message}>
            <Controller
              control={control}
              name="toClassSectionId"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {sectionLabel(s, grades.data, streams.data)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Roll number (optional)" htmlFor="promoteRoll" error={errors.rollNumber?.message}>
            <Input id="promoteRoll" {...register("rollNumber")} />
          </Field>
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Promote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudentDetailPage() {
  const { studentId } = Route.useParams();
  const { data: student, isPending, error } = useStudent(studentId);
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);

  if (isPending) {
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={errorMessage(error)} />
      </div>
    );
  }
  const current = student.currentEnrolment;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <PageHeader
        title={nameOf(student)}
        description={student.admissionNumber ? `Admission ${student.admissionNumber}` : undefined}
        action={
          <Button variant="secondary" asChild>
            <Link to="/people/students">Back</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-5 text-sm">
        <div>
          <p className="text-muted-foreground">Date of birth</p>
          <p className="font-medium text-foreground">{student.dateOfBirth}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="font-medium capitalize text-foreground">{student.status}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Current enrolment</h2>
          {current ? (
            <Button
              variant="secondary"
              onClick={() => {
                setPromoteOpen(true);
              }}
            >
              Promote
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEnrolOpen(true);
              }}
            >
              Enrol
            </Button>
          )}
        </div>
        {current ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {current.gradeLevel} - {current.sectionName}
            {current.stream ? ` (${current.stream})` : ""}
            {current.rollNumber ? ` · Roll ${current.rollNumber}` : ""}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Not enrolled in any section yet.</p>
        )}
      </div>

      <EnrolDialog studentId={studentId} open={enrolOpen} onOpenChange={setEnrolOpen} />
      <PromoteDialog
        studentId={studentId}
        currentYearId={current?.academicYearId ?? null}
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
      />
    </div>
  );
}

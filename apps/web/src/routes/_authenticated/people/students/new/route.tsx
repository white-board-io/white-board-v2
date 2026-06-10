import { zodResolver } from "@hookform/resolvers/zod";
import { createStudentSchema, type CreateStudentInput } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Field } from "../../../../../components/field";
import { errorMessage } from "../../../../../components/states";
import { useCreateStudent } from "../../../../../features/students/api";

export const Route = createFileRoute("/_authenticated/people/students/new")({
  component: NewStudentPage,
});

function NewStudentPage() {
  const navigate = useNavigate();
  const create = useCreateStudent();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentInput>({ resolver: zodResolver(createStudentSchema) });

  const onSubmit = async (values: CreateStudentInput) => {
    try {
      const result = await create.mutateAsync(values);
      await navigate({ to: "/people/students/$studentId", params: { studentId: result.studentId } });
    } catch (err) {
      setError("root", { message: errorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Add student</h1>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5" noValidate>
        <Field label="Admission number (optional)" htmlFor="admissionNumber" error={errors.admissionNumber?.message}>
          <Input id="admissionNumber" placeholder="ADM2026001" {...register("admissionNumber")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
            <Input id="firstName" {...register("firstName")} />
          </Field>
          <Field label="Middle name (optional)" htmlFor="middleName" error={errors.middleName?.message}>
            <Input id="middleName" {...register("middleName")} />
          </Field>
        </div>
        <Field label="Last name (optional)" htmlFor="lastName" error={errors.lastName?.message}>
          <Input id="lastName" {...register("lastName")} />
        </Field>
        <Field label="Date of birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
        </Field>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            Create student
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to="/people/students">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

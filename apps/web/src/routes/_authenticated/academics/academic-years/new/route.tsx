import { zodResolver } from "@hookform/resolvers/zod";
import { createAcademicYearSchema, type CreateAcademicYearInput } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Field } from "../../../../../components/field";
import { errorMessage } from "../../../../../components/states";
import { useCreateAcademicYear } from "../../../../../features/academic-years/api";

export const Route = createFileRoute("/_authenticated/academics/academic-years/new")({
  component: NewAcademicYearPage,
});

function NewAcademicYearPage() {
  const navigate = useNavigate();
  const create = useCreateAcademicYear();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAcademicYearInput>({ resolver: zodResolver(createAcademicYearSchema) });

  const onSubmit = async (values: CreateAcademicYearInput) => {
    try {
      await create.mutateAsync(values);
      await navigate({ to: "/academics/academic-years" });
    } catch (err) {
      setError("root", { message: errorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Add academic year</h1>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5" noValidate>
        <Field label="Name" htmlFor="name" error={errors.name?.message} hint="e.g. 2026-27">
          <Input id="name" placeholder="2026-27" {...register("name")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts on" htmlFor="startsOn" error={errors.startsOn?.message}>
            <Input id="startsOn" type="date" {...register("startsOn")} />
          </Field>
          <Field label="Ends on" htmlFor="endsOn" error={errors.endsOn?.message}>
            <Input id="endsOn" type="date" {...register("endsOn")} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" className="size-4 rounded border-border" {...register("isCurrent")} />
          Make this the current year
        </label>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            Create year
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to="/academics/academic-years">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

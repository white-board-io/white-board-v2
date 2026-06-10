import { zodResolver } from "@hookform/resolvers/zod";
import { createGradeLevelSchema, type CreateGradeLevelInput } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Field } from "../../../../../components/field";
import { errorMessage } from "../../../../../components/states";
import { useCreateGradeLevel } from "../../../../../features/grade-levels/api";

export const Route = createFileRoute("/_authenticated/academics/classes/new")({
  component: NewClassPage,
});

function NewClassPage() {
  const navigate = useNavigate();
  const create = useCreateGradeLevel();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateGradeLevelInput>({ resolver: zodResolver(createGradeLevelSchema) });

  const onSubmit = async (values: CreateGradeLevelInput) => {
    try {
      await create.mutateAsync(values);
      await navigate({ to: "/academics/classes" });
    } catch (err) {
      setError("root", { message: errorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Add class</h1>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5" noValidate>
        <Field label="Name" htmlFor="name" error={errors.name?.message} hint="e.g. Class 5">
          <Input id="name" placeholder="Class 5" {...register("name")} />
        </Field>
        <Field label="Short name (optional)" htmlFor="shortName" error={errors.shortName?.message}>
          <Input id="shortName" placeholder="5" {...register("shortName")} />
        </Field>
        <Field label="Sort order (optional)" htmlFor="sortOrder" error={errors.sortOrder?.message}>
          <Input
            id="sortOrder"
            type="number"
            placeholder="0"
            {...register("sortOrder", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
          />
        </Field>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            Create class
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to="/academics/classes">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

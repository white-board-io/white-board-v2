import { zodResolver } from "@hookform/resolvers/zod";
import { createClassSectionSchema, type CreateClassSectionInput } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { Field } from "../../../../../components/field";
import { errorMessage } from "../../../../../components/states";
import { useAcademicYears } from "../../../../../features/academic-years/api";
import { useCreateClassSection } from "../../../../../features/class-sections/api";
import { useGradeLevels } from "../../../../../features/grade-levels/api";
import { useStreams } from "../../../../../features/streams/api";
import { useAcademicYearStore } from "../../../../../store/academic-year";

export const Route = createFileRoute("/_authenticated/academics/sections/new")({
  component: NewSectionPage,
});

function NewSectionPage() {
  const navigate = useNavigate();
  const create = useCreateClassSection();
  const selectedYearId = useAcademicYearStore((s) => s.selectedYearId);
  const years = useAcademicYears();
  const grades = useGradeLevels();
  const streams = useStreams();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateClassSectionInput>({
    resolver: zodResolver(createClassSectionSchema),
    defaultValues: { academicYearId: selectedYearId ?? undefined },
  });

  const onSubmit = async (values: CreateClassSectionInput) => {
    try {
      await create.mutateAsync(values);
      await navigate({ to: "/academics/sections" });
    } catch (err) {
      setError("root", { message: errorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Add section</h1>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5" noValidate>
        <Field label="Academic year" error={errors.academicYearId?.message}>
          <Controller
            control={control}
            name="academicYearId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {(years.data ?? []).map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Class" error={errors.gradeLevelId?.message}>
          <Controller
            control={control}
            name="gradeLevelId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {(grades.data ?? []).map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Stream (optional)" error={errors.streamId?.message}>
          <Controller
            control={control}
            name="streamId"
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(v) => {
                  field.onChange(v === "none" ? undefined : v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No stream</SelectItem>
                  {(streams.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Section name" htmlFor="sectionName" error={errors.sectionName?.message} hint="e.g. A">
          <Input id="sectionName" placeholder="A" {...register("sectionName")} />
        </Field>

        <Field label="Capacity (optional)" htmlFor="capacity" error={errors.capacity?.message}>
          <Input
            id="capacity"
            type="number"
            placeholder="40"
            {...register("capacity", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
          />
        </Field>

        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            Create section
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to="/academics/sections">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

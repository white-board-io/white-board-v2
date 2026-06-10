import { zodResolver } from "@hookform/resolvers/zod";
import { createStreamSchema, type CreateStreamInput } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Field } from "../../../../../components/field";
import { errorMessage } from "../../../../../components/states";
import { useCreateStream } from "../../../../../features/streams/api";

export const Route = createFileRoute("/_authenticated/academics/streams/new")({
  component: NewStreamPage,
});

function NewStreamPage() {
  const navigate = useNavigate();
  const create = useCreateStream();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateStreamInput>({ resolver: zodResolver(createStreamSchema) });

  const onSubmit = async (values: CreateStreamInput) => {
    try {
      await create.mutateAsync(values);
      await navigate({ to: "/academics/streams" });
    } catch (err) {
      setError("root", { message: errorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Add stream</h1>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5" noValidate>
        <Field label="Name" htmlFor="name" error={errors.name?.message} hint="e.g. Science">
          <Input id="name" placeholder="Science" {...register("name")} />
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
            Create stream
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to="/academics/streams">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

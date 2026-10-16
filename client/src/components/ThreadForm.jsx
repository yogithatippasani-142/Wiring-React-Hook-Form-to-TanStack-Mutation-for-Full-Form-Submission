
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread } from "../services/threadApi";

export default function ThreadForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { title: "", body: "" },
  });

  const mutation = useMutation({
    mutationFn: (data) => createThread(data),

    onSuccess: () => {
      // Refresh the thread list and clear the form
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      reset();
    },

    onError: (error) => {
      // Read field-level validation errors from the server
      const serverErrors = error.response?.data?.errors;

      if (
        serverErrors &&
        Object.keys(serverErrors).length > 0
      ) {
        Object.entries(serverErrors).forEach(([field, message]) => {
          setError(field, {
            type: "server",
            message,
          });
        });
      } else {
        // Display a general error when no field details are provided
        setError("root.server", {
          message: "Could not save. Please try again.",
        });
      }
    },
  });

  // Submit only after React Hook Form validation succeeds
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          {...register("title", {
            required: "Title is required",
          })}
        />
        {errors.title && (
          <p role="alert">{errors.title.message}</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          {...register("body", {
            required: "Body is required",
          })}
        />
        {errors.body && (
          <p role="alert">{errors.body.message}</p>
        )}
      </div>

      {/* General server error */}
      {errors.root?.server && (
        <p role="alert">{errors.root.server.message}</p>
      )}

      {/* Loading state and double-submit prevention */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating…" : "Create thread"}
      </button>
    </form>
  );
}

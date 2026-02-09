import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/annotator/")({
  beforeLoad: () => {
    throw redirect({ to: "/annotator/dashboard" });
  },
});

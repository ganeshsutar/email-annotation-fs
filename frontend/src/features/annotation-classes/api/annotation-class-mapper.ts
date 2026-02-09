import type { AnnotationClass } from "@/types/models";

export function mapAnnotationClass(
  data: Record<string, unknown>,
): AnnotationClass {
  const createdBy = data.created_by as { id: string; name: string } | null;
  return {
    id: data.id as string,
    name: data.name as string,
    displayLabel: data.display_label as string,
    color: data.color as string,
    description: (data.description as string) ?? "",
    createdBy: createdBy
      ? ({
          id: createdBy.id,
          name: createdBy.name,
        } as AnnotationClass["createdBy"])
      : null,
    createdAt: data.created_at as string,
  };
}

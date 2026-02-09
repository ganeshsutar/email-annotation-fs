import type { WorkspaceAnnotation } from "@/types/models";

/**
 * Replace annotated spans with [tag] placeholders, processing from end to start
 * so that earlier offsets remain valid. Mirrors backend _deidentify() logic.
 */
export function deidentify(
  rawContent: string,
  annotations: WorkspaceAnnotation[],
): string {
  const sorted = [...annotations].sort(
    (a, b) => b.startOffset - a.startOffset,
  );
  let content = rawContent;
  for (const ann of sorted) {
    const tag = ann.tag || ann.className;
    // tag already includes brackets like [email_1], use as-is
    const replacement = tag.startsWith("[") && tag.endsWith("]") ? tag : `[${tag}]`;
    content =
      content.slice(0, ann.startOffset) +
      replacement +
      content.slice(ann.endOffset);
  }
  return content;
}

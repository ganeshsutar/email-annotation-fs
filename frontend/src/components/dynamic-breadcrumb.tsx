import { useMatches } from "@tanstack/react-router";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  annotator: "Annotator",
  qa: "QA",
  dashboard: "Dashboard",
  datasets: "Datasets",
  "annotation-classes": "Annotation Classes",
  users: "Users",
  "job-assignment": "Job Assignment",
  export: "Export",
  settings: "Settings",
  history: "History",
};

function formatSegment(segment: string): string {
  if (segmentLabels[segment]) return segmentLabels[segment];
  // For dynamic segments like UUIDs, show shortened version
  if (segment.length > 20) return `${segment.slice(0, 8)}...`;
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DynamicBreadcrumb() {
  const matches = useMatches();

  // Build breadcrumb items from matched routes
  // Skip the root match and layout routes (which have the same path as their children)
  const crumbs: { label: string; path: string }[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const path = match.fullPath;
    // Skip root, __root__, and duplicates
    if (!path || path === "/" || seen.has(path)) continue;
    seen.add(path);

    // Extract the last meaningful segment for the label
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) continue;

    // Skip role-level breadcrumbs (admin, annotator, qa) — they're redundant
    if (segments.length === 1 && segmentLabels[lastSegment]) continue;

    // For dynamic segments ($id), try to get a label from loader data
    let label: string;
    if (lastSegment.startsWith("$")) {
      const paramName = lastSegment.slice(1);
      const paramValue = (match.params as Record<string, string>)[paramName];
      // Try to get a display name from loader data
      const loaderData = match.loaderData as Record<string, unknown> | undefined;
      if (loaderData && typeof loaderData.name === "string") {
        label = loaderData.name;
      } else if (paramValue) {
        label = paramValue.length > 20
          ? `${paramValue.slice(0, 8)}...`
          : paramValue;
      } else {
        label = "Detail";
      }
    } else {
      label = formatSegment(lastSegment);
    }

    crumbs.push({ label, path });
  }

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.path}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.path}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

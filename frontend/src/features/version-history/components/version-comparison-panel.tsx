import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnnotationsForVersion } from "../api/get-annotations-for-version";
import { computeVersionDiff, type DiffEntry } from "../utils/version-diff";
import type { AnnotationVersionSummary } from "../api/history-mapper";

interface VersionComparisonPanelProps {
  annotationVersions: AnnotationVersionSummary[];
  initialVersionAId?: string | null;
  initialVersionBId?: string | null;
}

export function VersionComparisonPanel({
  annotationVersions,
  initialVersionAId,
  initialVersionBId,
}: VersionComparisonPanelProps) {
  const [versionAId, setVersionAId] = useState<string>(
    initialVersionAId ?? "",
  );
  const [versionBId, setVersionBId] = useState<string>(
    initialVersionBId ?? "",
  );

  const { data: annotationsA } = useAnnotationsForVersion(
    versionAId || null,
  );
  const { data: annotationsB } = useAnnotationsForVersion(
    versionBId || null,
  );

  const diff = useMemo(() => {
    if (!annotationsA || !annotationsB) return null;
    return computeVersionDiff(annotationsA, annotationsB);
  }, [annotationsA, annotationsB]);

  const allEntries = useMemo(() => {
    if (!diff) return [];
    return [
      ...diff.added,
      ...diff.removed,
      ...diff.modified,
      ...diff.unchanged,
    ].sort(
      (a, b) => a.annotation.startOffset - b.annotation.startOffset,
    );
  }, [diff]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Compare Versions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Version A (base)
            </label>
            <Select value={versionAId} onValueChange={setVersionAId}>
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {annotationVersions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    v{v.versionNumber} ({v.source})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Version B (compare)
            </label>
            <Select value={versionBId} onValueChange={setVersionBId}>
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {annotationVersions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    v{v.versionNumber} ({v.source})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {diff && (
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
              Added: {diff.summary.added}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Removed: {diff.summary.removed}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500" />
              Modified: {diff.summary.modified}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />
              Unchanged: {diff.summary.unchanged}
            </span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {!versionAId || !versionBId ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Select two versions to compare
          </div>
        ) : !diff ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : allEntries.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            No annotations to compare
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Change</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Text</TableHead>
                <TableHead className="w-[80px]">Offsets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allEntries.map((entry, idx) => (
                <DiffRow key={idx} entry={entry} />
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  );
}

function DiffRow({ entry }: { entry: DiffEntry }) {
  const bgClass = {
    added: "bg-green-50 dark:bg-green-950/20",
    removed: "bg-red-50 dark:bg-red-950/20",
    modified: "bg-yellow-50 dark:bg-yellow-950/20",
    unchanged: "",
  }[entry.type];

  const badgeVariant = {
    added: "default" as const,
    removed: "destructive" as const,
    modified: "secondary" as const,
    unchanged: "outline" as const,
  }[entry.type];

  return (
    <TableRow className={bgClass}>
      <TableCell>
        <Badge variant={badgeVariant} className="text-xs capitalize">
          {entry.type}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm border"
            style={{ backgroundColor: entry.annotation.classColor }}
          />
          <span className="text-sm">{entry.annotation.classDisplayLabel}</span>
        </div>
        {entry.type === "modified" && entry.previousAnnotation && (
          <div className="flex items-center gap-1.5 mt-1 opacity-60">
            <span
              className="inline-block h-3 w-3 rounded-sm border"
              style={{
                backgroundColor: entry.previousAnnotation.classColor,
              }}
            />
            <span className="text-xs line-through">
              {entry.previousAnnotation.classDisplayLabel}
            </span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-sm">{entry.annotation.tag}</TableCell>
      <TableCell className="text-sm font-mono max-w-[200px] truncate">
        {entry.annotation.originalText}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground font-mono">
        {entry.annotation.startOffset}-{entry.annotation.endOffset}
      </TableCell>
    </TableRow>
  );
}

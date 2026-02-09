import { useMemo } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { splitTextAtAnnotations } from "@/lib/offset-utils";
import type { ExportPreview as ExportPreviewData } from "../api/export-mapper";

interface ExportPreviewProps {
  data: ExportPreviewData;
}

export function ExportPreview({ data }: ExportPreviewProps) {
  const segments = useMemo(
    () => splitTextAtAnnotations(data.original, data.annotations),
    [data.original, data.annotations],
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/50">
        <span className="text-sm font-medium">
          Preview: {data.fileName}
        </span>
        <Badge variant="outline" className="text-xs">
          {data.annotations.length} annotations
        </Badge>
      </div>
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-[400px] max-h-[600px]"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <div className="px-3 py-1.5 border-b text-xs font-medium text-muted-foreground bg-muted/30">
              Original (with highlights)
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-3 font-mono text-sm leading-5 whitespace-pre-wrap break-words">
                {segments.map((segment, idx) => {
                  if (!segment.isHighlight || !segment.annotation) {
                    return <span key={idx}>{segment.text}</span>;
                  }
                  const ann = segment.annotation;
                  return (
                    <span
                      key={idx}
                      style={{ backgroundColor: ann.classColor + "66" }}
                      className="rounded-sm"
                      title={`${ann.classDisplayLabel}: ${ann.tag}`}
                    >
                      {segment.text}
                    </span>
                  );
                })}
              </pre>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <div className="px-3 py-1.5 border-b text-xs font-medium text-muted-foreground bg-muted/30">
              De-identified
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-3 font-mono text-sm leading-5 whitespace-pre-wrap break-words">
                {data.deidentified}
              </pre>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

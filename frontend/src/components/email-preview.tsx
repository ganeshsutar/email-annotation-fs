import { useMemo, useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import {
  parseEml,
  buildCidMap,
  replaceCidReferences,
} from "@/lib/eml-parser";
import type { WorkspaceAnnotation } from "@/types/models";
import { deidentify } from "@/lib/deidentify";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailViewer, AttachmentsList } from "@/components/email-viewer";

interface EmailPreviewProps {
  rawContent: string;
  annotations?: WorkspaceAnnotation[];
}

export function EmailPreview({ rawContent, annotations }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"email" | "text">("email");

  // If no annotations, show original behavior (no toggle bar)
  if (!annotations || annotations.length === 0) {
    return <OriginalEmailPreview rawContent={rawContent} />;
  }

  const deidentifiedContent = deidentify(rawContent, annotations);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          De-identified Preview
        </span>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => {
            if (v) setViewMode(v as "email" | "text");
          }}
          size="sm"
          variant="outline"
        >
          <ToggleGroupItem value="email" className="text-xs px-2 h-6">
            Email
          </ToggleGroupItem>
          <ToggleGroupItem value="text" className="text-xs px-2 h-6">
            Text
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex-1 min-h-0">
        {viewMode === "email" ? (
          <DeidentifiedEmailView rawContent={deidentifiedContent} />
        ) : (
          <DeidentifiedTextView content={deidentifiedContent} />
        )}
      </div>
    </div>
  );
}

/** Original preview — used when no annotations are present */
function OriginalEmailPreview({ rawContent }: { rawContent: string }) {
  const email = useMemo(() => parseEml(rawContent), [rawContent]);
  const cidMapRef = useRef<{ cleanup: () => void } | null>(null);

  const iframeSrcDoc = useMemo(() => {
    if (!email.htmlBody) return null;

    const cidMap = buildCidMap(email.attachments);
    // Cleanup previous blob URLs
    cidMapRef.current?.cleanup();
    cidMapRef.current = cidMap;

    const withCids = replaceCidReferences(email.htmlBody, cidMap.urls);
    return DOMPurify.sanitize(withCids, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["style"],
      WHOLE_DOCUMENT: true,
      ALLOWED_URI_REGEXP: /^(?:blob:|data:|https?:|mailto:)/i,
    });
  }, [email.htmlBody, email.attachments]);

  useEffect(() => {
    return () => {
      cidMapRef.current?.cleanup();
      cidMapRef.current = null;
    };
  }, []);

  if (iframeSrcDoc) {
    return (
      <div className="flex flex-col h-full">
        <iframe
          srcDoc={iframeSrcDoc}
          sandbox="allow-same-origin"
          className="w-full flex-1 border-0 min-h-[400px]"
          title="Email preview"
        />
        <div className="px-4 pb-4">
          <AttachmentsList attachments={email.attachments} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <pre className="whitespace-pre-wrap text-sm font-mono">{email.body}</pre>
      <AttachmentsList attachments={email.attachments} />
    </div>
  );
}

/** Structured email view (From, To, Subject, Body) of de-identified content */
function DeidentifiedEmailView({ rawContent }: { rawContent: string }) {
  return <EmailViewer rawContent={rawContent} />;
}

/** Plain text view with line numbers */
function DeidentifiedTextView({ content }: { content: string }) {
  const lineNumberText = useMemo(() => {
    const count = content.split("\n").length;
    return Array.from({ length: count }, (_, i) => i + 1).join("\n");
  }, [content]);

  return (
    <ScrollArea className="h-full">
      <div className="flex">
        <pre className="select-none pr-2 text-right text-muted-foreground text-xs font-mono leading-5 pt-2 pb-2 pl-2 border-r min-w-[3rem]">
          {lineNumberText}
        </pre>
        <pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-5 p-2">
          {content}
        </pre>
      </div>
    </ScrollArea>
  );
}

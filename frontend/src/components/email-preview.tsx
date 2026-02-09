import { useMemo, useState } from "react";
import {
  parseEml,
  parseMultipart,
  decodeQuotedPrintable,
  decodeBase64,
} from "@/lib/eml-parser";
import type { MimePart } from "@/lib/eml-parser";
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

  if (email.isHtml) {
    const htmlContent = getOriginalHtmlBody(rawContent);
    if (htmlContent) {
      return (
        <div className="flex flex-col h-full">
          <iframe
            srcDoc={htmlContent}
            sandbox=""
            className="w-full flex-1 border-0 min-h-[400px]"
            title="Email preview"
          />
          <div className="px-4 pb-4">
            <AttachmentsList attachments={email.attachments} />
          </div>
        </div>
      );
    }
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

function findHtmlPart(parts: MimePart[]): MimePart | null {
  for (const part of parts) {
    const ct = (part.headers["content-type"] || "").toLowerCase();
    if (ct.includes("multipart/")) {
      const nestedBoundary = ct.match(/boundary="?([^";\s]+)"?/i);
      if (nestedBoundary) {
        const nestedParts = parseMultipart(part.body, nestedBoundary[1]);
        const found = findHtmlPart(nestedParts);
        if (found) return found;
      }
    } else if (ct.includes("text/html")) {
      return part;
    }
  }
  return null;
}

function decodePartBody(part: MimePart): string {
  const enc = (part.headers["content-transfer-encoding"] || "").toLowerCase();
  if (enc === "base64") return decodeBase64(part.body);
  if (enc === "quoted-printable") return decodeQuotedPrintable(part.body);
  return part.body;
}

function getOriginalHtmlBody(rawContent: string): string | null {
  const splitMatch = rawContent.match(/^([\s\S]*?)\r?\n\r?\n([\s\S]*)$/);
  if (!splitMatch) return null;

  const headerSection = splitMatch[1];
  const bodySection = splitMatch[2];

  const unfoldedHeaders = headerSection.replace(/\r?\n[ \t]+/g, " ");
  const headers: Record<string, string> = {};
  for (const line of unfoldedHeaders.split(/\r?\n/)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim().toLowerCase();
      headers[key] = line.substring(colonIdx + 1).trim();
    }
  }

  const contentType = headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/i);

  if (boundaryMatch) {
    const parts = parseMultipart(bodySection, boundaryMatch[1]);
    const htmlPart = findHtmlPart(parts);
    if (htmlPart) return decodePartBody(htmlPart);
  } else if (contentType.toLowerCase().includes("text/html")) {
    const enc = (headers["content-transfer-encoding"] || "").toLowerCase();
    if (enc === "base64") return decodeBase64(bodySection);
    if (enc === "quoted-printable") return decodeQuotedPrintable(bodySection);
    return bodySection;
  }

  return null;
}

import { useMemo, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import {
  buildCidMap,
  replaceCidReferences,
} from "@/lib/eml-parser";
import type { EmailAttachment } from "@/lib/eml-parser";

interface SanitizedHtmlRendererProps {
  html: string;
  attachments?: EmailAttachment[];
  className?: string;
}

export function SanitizedHtmlRenderer({
  html,
  attachments = [],
  className,
}: SanitizedHtmlRendererProps) {
  const cidMapRef = useRef<{ cleanup: () => void } | null>(null);

  const { sanitizedHtml, cidMap } = useMemo(() => {
    const map = buildCidMap(attachments);
    const withCids = replaceCidReferences(html, map.urls);
    const clean = DOMPurify.sanitize(withCids, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["style"],
      ALLOWED_URI_REGEXP: /^(?:blob:|data:|https?:|mailto:)/i,
    });
    return { sanitizedHtml: clean, cidMap: map };
  }, [html, attachments]);

  useEffect(() => {
    // Cleanup previous CID blob URLs
    cidMapRef.current?.cleanup();
    cidMapRef.current = cidMap;

    return () => {
      cidMapRef.current?.cleanup();
      cidMapRef.current = null;
    };
  }, [cidMap]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

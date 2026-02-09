import { useMemo } from "react";
import { Paperclip } from "lucide-react";
import { parseEml } from "@/lib/eml-parser";
import type { EmailAttachment } from "@/lib/eml-parser";
import { formatFileSize } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 55%)`;
}

function formatDate(date: Date | null): string {
  if (!date) return "Unknown";
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddresses(
  addrs: Array<{ name: string; email: string }>,
): string {
  return addrs
    .map((a) => (a.name ? `${a.name} <${a.email}>` : a.email))
    .join(", ");
}

interface EmailViewerProps {
  rawContent: string;
}

export function EmailViewer({ rawContent }: EmailViewerProps) {
  const email = useMemo(() => parseEml(rawContent), [rawContent]);
  const fromName = email.from.name || email.from.email;

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            style={{ backgroundColor: hashColor(fromName) }}
            className="text-white text-sm font-medium"
          >
            {getInitials(fromName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <dl className="text-sm space-y-1">
            <div className="flex gap-2">
              <dt className="font-medium text-muted-foreground w-16 shrink-0">
                From
              </dt>
              <dd className="truncate">
                {email.from.name
                  ? `${email.from.name} <${email.from.email}>`
                  : email.from.email}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-muted-foreground w-16 shrink-0">
                Date
              </dt>
              <dd>{formatDate(email.date)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-muted-foreground w-16 shrink-0">
                Subject
              </dt>
              <dd className="font-medium">{email.subject || "(No Subject)"}</dd>
            </div>
            {email.replyTo && (
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground w-16 shrink-0">
                  Reply-To
                </dt>
                <dd className="truncate">{email.replyTo}</dd>
              </div>
            )}
            {email.to.length > 0 && (
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground w-16 shrink-0">
                  To
                </dt>
                <dd className="truncate">{formatAddresses(email.to)}</dd>
              </div>
            )}
            {email.cc.length > 0 && (
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground w-16 shrink-0">
                  CC
                </dt>
                <dd className="truncate">{formatAddresses(email.cc)}</dd>
              </div>
            )}
            {email.bcc.length > 0 && (
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground w-16 shrink-0">
                  BCC
                </dt>
                <dd className="truncate">{formatAddresses(email.bcc)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <Separator />

      <div className="whitespace-pre-wrap text-sm">{email.body}</div>

      <AttachmentsList attachments={email.attachments} />
    </div>
  );
}

export function AttachmentsList({ attachments }: { attachments: EmailAttachment[] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Paperclip className="h-3.5 w-3.5" />
          <span>
            {attachments.length} attachment{attachments.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div
              key={`${att.filename}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs"
            >
              <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate max-w-[200px]">{att.filename}</span>
              <span className="text-muted-foreground">
                ({formatFileSize(att.size)})
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

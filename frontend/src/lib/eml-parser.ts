export interface ParsedEmailAddress {
  name: string;
  email: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number; // approximate decoded bytes
}

export interface ParsedEmail {
  from: ParsedEmailAddress;
  to: ParsedEmailAddress[];
  cc: ParsedEmailAddress[];
  bcc: ParsedEmailAddress[];
  subject: string;
  date: Date | null;
  replyTo: string | null;
  body: string;
  isHtml: boolean;
  attachments: EmailAttachment[];
}

function decodeRFC2047(value: string): string {
  return value.replace(
    /=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g,
    (_match, _charset, encoding, encoded) => {
      if (encoding.toUpperCase() === "B") {
        try {
          return atob(encoded);
        } catch {
          return encoded;
        }
      }
      // Quoted-printable
      return encoded
        .replace(/_/g, " ")
        .replace(/=([0-9A-Fa-f]{2})/g, (_: string, hex: string) =>
          String.fromCharCode(parseInt(hex, 16)),
        );
    },
  );
}

function parseAddresses(value: string): ParsedEmailAddress[] {
  if (!value.trim()) return [];

  const results: ParsedEmailAddress[] = [];
  // Split on commas not inside angle brackets or quotes
  const parts = value.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

  for (const part of parts) {
    const trimmed = decodeRFC2047(part.trim());
    // Match "Name" <email> or Name <email>
    const namedMatch = trimmed.match(
      /^"?([^"<]*?)"?\s*<([^>]+)>/,
    );
    if (namedMatch) {
      results.push({
        name: namedMatch[1].trim(),
        email: namedMatch[2].trim(),
      });
    } else {
      // Plain email
      const emailOnly = trimmed.replace(/[<>]/g, "").trim();
      if (emailOnly) {
        results.push({ name: "", email: emailOnly });
      }
    }
  }
  return results;
}

export function decodeQuotedPrintable(text: string): string {
  // Remove soft line breaks
  const unfolded = text.replace(/=\r?\n/g, "");
  return unfolded.replace(/=([0-9A-Fa-f]{2})/g, (_match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

export function decodeBase64(text: string): string {
  try {
    return atob(text.replace(/\s/g, ""));
  } catch {
    return text;
  }
}

function stripHtmlTags(html: string): string {
  // Basic HTML to text: replace <br>, <p>, <div> with newlines, strip rest
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function decodeBody(
  body: string,
  transferEncoding: string,
): string {
  const enc = transferEncoding.toLowerCase();
  if (enc === "base64") return decodeBase64(body);
  if (enc === "quoted-printable") return decodeQuotedPrintable(body);
  return body;
}

export interface MimePart {
  headers: Record<string, string>;
  body: string;
}

export function parseMultipart(body: string, boundary: string): MimePart[] {
  const parts: MimePart[] = [];
  const delimiter = `--${boundary}`;
  const endDelimiter = `--${boundary}--`;
  const sections = body.split(delimiter);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed || trimmed.startsWith("--") || trimmed === endDelimiter.slice(delimiter.length)) {
      continue;
    }
    // Remove trailing end delimiter
    const cleaned = trimmed.replace(/--\s*$/, "").trim();

    // Split headers/body
    const splitIndex = cleaned.search(/\r?\n\r?\n/);
    if (splitIndex === -1) continue;

    const headerStr = cleaned.substring(0, splitIndex);
    const partBody = cleaned.substring(splitIndex).replace(/^\r?\n\r?\n/, "");

    const headers: Record<string, string> = {};
    // Unfold headers
    const unfoldedHeaders = headerStr.replace(/\r?\n[ \t]+/g, " ");
    for (const line of unfoldedHeaders.split(/\r?\n/)) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toLowerCase();
        headers[key] = line.substring(colonIdx + 1).trim();
      }
    }

    parts.push({ headers, body: partBody });
  }
  return parts;
}

function extractFilename(headers: Record<string, string>): string {
  // Check Content-Disposition for filename
  const disposition = headers["content-disposition"] || "";
  const dispMatch = disposition.match(/filename="?([^";\n]+)"?/i);
  if (dispMatch) return decodeRFC2047(dispMatch[1].trim());

  // Fall back to Content-Type name parameter
  const ct = headers["content-type"] || "";
  const ctMatch = ct.match(/name="?([^";\n]+)"?/i);
  if (ctMatch) return decodeRFC2047(ctMatch[1].trim());

  return "unnamed";
}

function estimateDecodedSize(body: string, transferEncoding: string): number {
  const enc = (transferEncoding || "").toLowerCase();
  if (enc === "base64") {
    const stripped = body.replace(/\s/g, "");
    return Math.floor(stripped.length * 0.75);
  }
  return body.length;
}

function isAttachmentDisposition(headers: Record<string, string>): boolean {
  const disposition = (headers["content-disposition"] || "").toLowerCase();
  return disposition.startsWith("attachment");
}

interface FindPartsResult {
  textPart: MimePart | null;
  htmlPart: MimePart | null;
  attachments: EmailAttachment[];
}

function findParts(parts: MimePart[]): FindPartsResult {
  let textPart: MimePart | null = null;
  let htmlPart: MimePart | null = null;
  const attachments: EmailAttachment[] = [];

  for (const part of parts) {
    const ct = (part.headers["content-type"] || "").toLowerCase();
    if (ct.includes("multipart/")) {
      // Recurse into nested multipart
      const nestedBoundary = ct.match(/boundary="?([^";\s]+)"?/i);
      if (nestedBoundary) {
        const nestedParts = parseMultipart(part.body, nestedBoundary[1]);
        const found = findParts(nestedParts);
        if (!textPart && found.textPart) textPart = found.textPart;
        if (!htmlPart && found.htmlPart) htmlPart = found.htmlPart;
        attachments.push(...found.attachments);
      }
    } else if ((ct.includes("text/plain") || ct.includes("text/html")) && isAttachmentDisposition(part.headers)) {
      // Text parts explicitly marked as attachments
      attachments.push({
        filename: extractFilename(part.headers),
        contentType: ct.split(";")[0].trim(),
        size: estimateDecodedSize(part.body, part.headers["content-transfer-encoding"] || ""),
      });
    } else if (ct.includes("text/plain") && !textPart) {
      textPart = part;
    } else if (ct.includes("text/html") && !htmlPart) {
      htmlPart = part;
    } else if (!ct.includes("text/")) {
      // Non-text, non-multipart parts are attachments
      attachments.push({
        filename: extractFilename(part.headers),
        contentType: ct.split(";")[0].trim() || "application/octet-stream",
        size: estimateDecodedSize(part.body, part.headers["content-transfer-encoding"] || ""),
      });
    }
  }

  return { textPart, htmlPart, attachments };
}

export function parseEml(rawContent: string): ParsedEmail {
  const result: ParsedEmail = {
    from: { name: "", email: "" },
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    date: null,
    replyTo: null,
    body: "",
    isHtml: false,
    attachments: [],
  };

  // Split headers and body at first blank line
  const splitMatch = rawContent.match(/^([\s\S]*?)\r?\n\r?\n([\s\S]*)$/);
  if (!splitMatch) {
    result.body = rawContent;
    return result;
  }

  const headerSection = splitMatch[1];
  let bodySection = splitMatch[2];

  // Unfold multi-line headers
  const unfoldedHeaders = headerSection.replace(/\r?\n[ \t]+/g, " ");
  const headers: Record<string, string> = {};
  for (const line of unfoldedHeaders.split(/\r?\n/)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim().toLowerCase();
      headers[key] = line.substring(colonIdx + 1).trim();
    }
  }

  // Parse header fields
  if (headers["from"]) {
    const addrs = parseAddresses(headers["from"]);
    if (addrs.length > 0) result.from = addrs[0];
  }
  if (headers["to"]) result.to = parseAddresses(headers["to"]);
  if (headers["cc"]) result.cc = parseAddresses(headers["cc"]);
  if (headers["bcc"]) result.bcc = parseAddresses(headers["bcc"]);
  if (headers["subject"]) result.subject = decodeRFC2047(headers["subject"]);
  if (headers["date"]) {
    try {
      result.date = new Date(headers["date"]);
      if (isNaN(result.date.getTime())) result.date = null;
    } catch {
      result.date = null;
    }
  }
  if (headers["reply-to"]) result.replyTo = decodeRFC2047(headers["reply-to"]);

  const contentType = headers["content-type"] || "text/plain";
  const transferEncoding = headers["content-transfer-encoding"] || "7bit";

  // Check for multipart
  const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/i);
  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const parts = parseMultipart(bodySection, boundary);

    // Recursively find text/plain, text/html parts, and attachments
    const { textPart, htmlPart, attachments } = findParts(parts);
    result.attachments = attachments;

    if (textPart) {
      const enc = textPart.headers["content-transfer-encoding"] || "7bit";
      result.body = decodeBody(textPart.body, enc);
      result.isHtml = false;
    } else if (htmlPart) {
      const enc = htmlPart.headers["content-transfer-encoding"] || "7bit";
      const decoded = decodeBody(htmlPart.body, enc);
      result.body = stripHtmlTags(decoded);
      result.isHtml = true;
    }
  } else {
    // Single-part message
    bodySection = decodeBody(bodySection, transferEncoding);
    if (contentType.toLowerCase().includes("text/html")) {
      result.body = stripHtmlTags(bodySection);
      result.isHtml = true;
    } else {
      result.body = bodySection;
    }
  }

  return result;
}

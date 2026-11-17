import type { Deadline } from "@/lib/schema";
import type { Reference } from "@/lib/schema";

export interface CalendarEntry {
  deadline: Deadline;
  /** Data confirmada pelo usuário em formato YYYY-MM-DD */
  confirmedDateIso: string;
  /** Texto japonês do trecho de referência, se disponível */
  referenceText?: string;
  /** Título localizado do evento */
  title: string;
}

/** Formata YYYY-MM-DD como YYYYMMDD (formato all-day do iCal) */
function toIcalDate(iso: string): string {
  return iso.replace(/-/g, "");
}

/** Escapa texto para uso em propriedades iCal */
function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Dobra linhas longas conforme RFC 5545 (máx 75 octetos por linha) */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(" " + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join("\r\n");
}

/**
 * Gera um arquivo .ics no browser com um evento all-day por entrada.
 * Nenhum dado é enviado ao servidor.
 */
export function generateIcs(
  entries: CalendarEntry[],
  calendarName: string
): string {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const events = entries
    .map((entry, i) => {
      const dtstart = toIcalDate(entry.confirmedDateIso);
      // All-day: DTEND é o dia seguinte
      const dtend = toIcalDate(
        new Date(
          new Date(entry.confirmedDateIso + "T12:00:00Z").getTime() +
            86400000
        )
          .toISOString()
          .slice(0, 10)
      );

      const uid = `paper-lantern-${entry.deadline.id}-${i}-${dtstart}@paper-lantern`;

      const description = entry.referenceText
        ? `Trecho original: ${entry.referenceText}\nData no documento: ${entry.deadline.dateRaw}`
        : `Data no documento: ${entry.deadline.dateRaw}`;

      return [
        "BEGIN:VEVENT",
        foldLine(`UID:${uid}`),
        foldLine(`DTSTAMP:${now}Z`),
        foldLine(`DTSTART;VALUE=DATE:${dtstart}`),
        foldLine(`DTEND;VALUE=DATE:${dtend}`),
        foldLine(`SUMMARY:${escapeIcal(entry.title)}`),
        foldLine(`DESCRIPTION:${escapeIcal(description)}`),
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Paper Lantern//paper-lantern//EN",
    foldLine(`X-WR-CALNAME:${escapeIcal(calendarName)}`),
    "X-WR-TIMEZONE:Asia/Tokyo",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Dispara o download do arquivo .ics no browser.
 */
export function downloadIcs(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Monta CalendarEntries a partir de deadlines e referências, para uso nos componentes */
export function buildCalendarEntries(
  deadlines: Deadline[],
  references: Reference[],
  localizedDescriptions: { id: number; description: string }[]
): CalendarEntry[] {
  return deadlines
    .filter((d) => d.dateIso !== null)
    .map((d) => {
      const ref = references.find((r) => r.id === d.referenceId);
      const loc = localizedDescriptions.find((l) => l.id === d.id);
      return {
        deadline: d,
        confirmedDateIso: d.dateIso!,
        referenceText: ref?.japaneseText,
        title: loc?.description ?? d.description,
      };
    });
}

export function buildICS(events: { title: string; date: string }[]): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//Love App//Anniversaries//CN");
  for (const e of events) {
    const dt = e.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${dt}-${Math.random().toString(36).slice(2)}@love`);
    lines.push(`DTSTAMP:${dt}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`SUMMARY:${escapeText(e.title)}`);
    lines.push("RRULE:FREQ=YEARLY");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeText(input: string): string {
  return input.replace(/[,;\\]/g, (m) => ({ ",": "\\,", ";": "\\;", "\\": "\\\\" }[m]!));
}


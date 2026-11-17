import { describe, it, expect } from "vitest";
import { generateIcs, buildCalendarEntries } from "./icsGenerator";
import type { Deadline, Reference } from "./schema";

const mockRef: Reference = {
  id: 1,
  japaneseText: "支払期限：令和７年３月３１日",
  confidence: "ok",
};

const mockDeadlineWithDate: Deadline = {
  id: 1,
  description: "Pagamento da fatura",
  dateRaw: "令和７年３月３１日",
  dateIso: "2025-03-31",
  referenceId: 1,
};

const mockDeadlineNullDate: Deadline = {
  id: 2,
  description: "Prazo indefinido",
  dateRaw: "近日中",
  dateIso: null,
  referenceId: 1,
};

describe("generateIcs", () => {
  it("gera cabeçalho e rodapé corretos do iCal", () => {
    const ics = generateIcs([], "Test Calendar");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
  });

  it("cria evento all-day sem horário para prazo com data", () => {
    const entry = {
      deadline: mockDeadlineWithDate,
      confirmedDateIso: "2025-03-31",
      title: "Pagamento da fatura",
      referenceText: "支払期限：令和７年３月３１日",
    };
    const ics = generateIcs([entry], "Test");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:20250331");
    expect(ics).toContain("DTEND;VALUE=DATE:20250401");
    // Não deve conter horário no DTSTART
    expect(ics).not.toMatch(/DTSTART:\d{8}T/);
    expect(ics).toContain("END:VEVENT");
  });

  it("inclui trecho japonês na descrição", () => {
    const entry = {
      deadline: mockDeadlineWithDate,
      confirmedDateIso: "2025-03-31",
      title: "Pagamento",
      referenceText: "支払期限：令和７年３月３１日",
    };
    const ics = generateIcs([entry], "Test");
    expect(ics).toContain("支払期限");
  });

  it("gera múltiplos eventos", () => {
    const entries = [
      { deadline: mockDeadlineWithDate, confirmedDateIso: "2025-03-31", title: "Prazo 1" },
      {
        deadline: { ...mockDeadlineWithDate, id: 2 },
        confirmedDateIso: "2025-06-30",
        title: "Prazo 2",
      },
    ];
    const ics = generateIcs(entries, "Test");
    const matches = ics.match(/BEGIN:VEVENT/g);
    expect(matches?.length).toBe(2);
  });

  it("inclui o nome do calendário", () => {
    const ics = generateIcs([], "Meu Calendário");
    expect(ics).toContain("X-WR-CALNAME:Meu Calendário");
  });
});

describe("buildCalendarEntries", () => {
  it("inclui apenas deadlines com dateIso não nulo", () => {
    const entries = buildCalendarEntries(
      [mockDeadlineWithDate, mockDeadlineNullDate],
      [mockRef],
      [
        { id: 1, description: "Pagamento da fatura" },
        { id: 2, description: "Prazo indefinido" },
      ]
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].deadline.id).toBe(1);
  });

  it("associa o trecho de referência correto", () => {
    const entries = buildCalendarEntries(
      [mockDeadlineWithDate],
      [mockRef],
      [{ id: 1, description: "Pagamento da fatura" }]
    );
    expect(entries[0].referenceText).toBe("支払期限：令和７年３月３１日");
  });

  it("usa a descrição localizada no título", () => {
    const entries = buildCalendarEntries(
      [mockDeadlineWithDate],
      [mockRef],
      [{ id: 1, description: "Pagar até março" }]
    );
    expect(entries[0].title).toBe("Pagar até março");
  });

  it("retorna lista vazia quando todas as datas são nulas", () => {
    const entries = buildCalendarEntries([mockDeadlineNullDate], [mockRef], []);
    expect(entries).toHaveLength(0);
  });
});

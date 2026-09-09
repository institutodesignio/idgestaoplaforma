import { describe, expect, it } from "vitest";
import { appointmentBoundary } from "./api";

describe("contrato de filtros da agenda", () => {
  it("converte data inicial para timestamp aceito pelo backend", () => {
    expect(appointmentBoundary("2026-08-25")).toMatch(/^2026-08-25T/);
  });

  it("torna a data final inclusiva usando o início do dia seguinte", () => {
    expect(appointmentBoundary("2026-08-25", true)).toMatch(/^2026-08-26T/);
  });

  it("não envia datas inválidas", () => {
    expect(appointmentBoundary("inválida")).toBeUndefined();
  });
});

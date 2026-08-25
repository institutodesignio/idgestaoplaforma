import { describe, expect, it } from "vitest";
import {
  conditionsSummary,
  intakeProfile,
  intakeProtocol,
  submitProtocol,
  type NeurodivergentIntake,
} from "./types";

function baseIntake(overrides: Partial<NeurodivergentIntake> = {}): NeurodivergentIntake {
  return { id: "intake-1", status: "SUBMITTED", person_id: "person-1", ...overrides };
}

describe("intakeProtocol", () => {
  it("prefere protocol_number", () => {
    expect(intakeProtocol(baseIntake({ protocol_number: "ND-2026-0001" }))).toBe("ND-2026-0001");
  });

  it("usa protocol legado como fallback", () => {
    expect(intakeProtocol(baseIntake({ protocol: "LEGADO-9" }))).toBe("LEGADO-9");
  });

  it("cai para o id quando não há protocolo", () => {
    expect(intakeProtocol(baseIntake({ protocol_number: "  " }))).toBe("intake-1");
  });
});

describe("intakeProfile", () => {
  it("normaliza relação one-to-one em objeto", () => {
    const intake = baseIntake({ neurodivergent_profiles: { id: "p1", report_status: "YES" } });
    expect(intakeProfile(intake)?.id).toBe("p1");
  });

  it("normaliza relação em array", () => {
    const intake = baseIntake({ neurodivergent_profiles: [{ id: "p2" }] });
    expect(intakeProfile(intake)?.id).toBe("p2");
  });

  it("retorna null quando ausente ou array vazio", () => {
    expect(intakeProfile(baseIntake())).toBeNull();
    expect(intakeProfile(baseIntake({ neurodivergent_profiles: [] }))).toBeNull();
    expect(intakeProfile(baseIntake({ neurodivergent_profiles: null }))).toBeNull();
  });
});

describe("submitProtocol", () => {
  it("usa protocol_number do retorno oficial", () => {
    expect(submitProtocol({ intake_id: "i1", protocol_number: "ND-7" })).toBe("ND-7");
  });

  it("cai para intake_id quando protocol_number vem vazio", () => {
    expect(submitProtocol({ intake_id: "i1", protocol_number: null })).toBe("i1");
    expect(submitProtocol({ intake_id: "i1" })).toBe("i1");
  });
});

describe("conditionsSummary", () => {
  it("substitui OTHER pelo texto livre sem duplicar rótulo", () => {
    expect(conditionsSummary(["AUTISM", "OTHER"], "Epilepsia")).toBe("Autismo, Epilepsia");
  });

  it("mantém rótulo quando não há texto livre", () => {
    expect(conditionsSummary(["OTHER"], "")).toBe("Outra condição");
  });

  it("acrescenta texto livre mesmo sem OTHER marcado", () => {
    expect(conditionsSummary(["ADHD"], "Epilepsia")).toBe("TDAH, Epilepsia");
  });
});

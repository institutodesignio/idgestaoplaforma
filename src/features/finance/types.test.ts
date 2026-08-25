import { describe, expect, it } from "vitest";
import { moneyBRL, summaryNumber } from "./types";

describe("contratos de apresentação financeira", () => {
  it("formata valores em reais sem perder centavos", () => {
    expect(moneyBRL(1234.56)).toContain("1.234,56");
  });

  it("não propaga valores inválidos para a interface", () => {
    expect(moneyBRL("inválido")).toContain("0,00");
  });

  it("extrai apenas números conhecidos do resumo oficial", () => {
    expect(summaryNumber({ total_income: "42.50" }, ["total_income"])).toBe(42.5);
    expect(summaryNumber({ total_income: null }, ["total_income"])).toBe(0);
  });
});

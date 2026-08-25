import { describe, expect, it } from "vitest";
import { unwrapUnit } from "./api";
import type { Unit } from "./types";

const unit: Unit = {
  id: "unit-test-id",
  name: "Unidade de Teste",
  slug: "unidade-de-teste",
  email: null,
  phone: null,
  postal_code: null,
  street: null,
  street_number: null,
  address_complement: null,
  neighborhood: null,
  city: "Itapecerica da Serra",
  state_code: "SP",
  country_code: "BR",
  status: "ACTIVE",
  description: null,
  is_headquarters: false,
};

describe("unwrapUnit", () => {
  it("aceita o envelope oficial data", () => {
    expect(unwrapUnit({ data: unit })).toEqual(unit);
  });

  it("mantém compatibilidade com o envelope unit", () => {
    expect(unwrapUnit({ unit })).toEqual(unit);
  });

  it("mantém compatibilidade com o objeto direto", () => {
    expect(unwrapUnit(unit)).toEqual(unit);
  });

  it("rejeita respostas vazias", () => {
    expect(unwrapUnit(undefined)).toBeNull();
    expect(unwrapUnit({})).toBeNull();
  });
});

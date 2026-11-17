import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLanguage, interpolate } from "./useLanguage";

describe("interpolate", () => {
  it("substitui uma chave simples", () => {
    expect(interpolate("Olá, {name}!", { name: "Maria" })).toBe("Olá, Maria!");
  });

  it("substitui múltiplas chaves", () => {
    expect(interpolate("{done} de {total} concluídas", { done: 2, total: 5 })).toBe(
      "2 de 5 concluídas"
    );
  });

  it("mantém chave no texto se não houver valor correspondente", () => {
    expect(interpolate("{done} de {total}", { done: 1 })).toBe("1 de {total}");
  });
});

describe("useLanguage", () => {
  it("inicia com idioma padrão 'pt'", () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe("pt");
  });

  it("inicia com idioma fornecido", () => {
    const { result } = renderHook(() => useLanguage("en"));
    expect(result.current.language).toBe("en");
  });

  it("retorna string correta para chave existente em pt", () => {
    const { result } = renderHook(() => useLanguage("pt"));
    expect(result.current.t("home.title")).toBe("Paper Lantern");
  });

  it("retorna string correta para chave existente em en", () => {
    const { result } = renderHook(() => useLanguage("en"));
    expect(result.current.t("home.title")).toBe("Paper Lantern");
  });

  it("retorna string correta para chave existente em tl", () => {
    const { result } = renderHook(() => useLanguage("tl"));
    expect(result.current.t("home.demoButton")).toBe("Tingnan ang demo");
  });

  it("retorna a própria chave quando ela não existe", () => {
    const { result } = renderHook(() => useLanguage("pt"));
    expect(result.current.t("chave.inexistente")).toBe("chave.inexistente");
  });

  it("troca de idioma atualiza as traduções", () => {
    const { result } = renderHook(() => useLanguage("pt"));
    expect(result.current.t("home.demoButton")).toBe("Ver demonstração");

    act(() => {
      result.current.setLanguage("en");
    });

    expect(result.current.language).toBe("en");
    expect(result.current.t("home.demoButton")).toBe("View demo");
  });

  it("interpola valores em t()", () => {
    const { result } = renderHook(() => useLanguage("pt"));
    expect(result.current.t("checklist.progress", { done: 3, total: 5 })).toBe(
      "3 de 5 concluídas"
    );
  });
});

import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";
import { DEMO_DOCUMENTS } from "@/lib/demoData";
import { prepareImage } from "@/lib/prepareImage";
import UploadView from "./UploadView";

vi.mock("@/lib/prepareImage", () => ({ prepareImage: vi.fn() }));
const preview = "data:image/jpeg;base64,/9j/4A==";
async function choose() {
  fireEvent.change(screen.getByLabelText("Tirar foto ou escolher imagem"), { target: { files: [new File(["photo"], "letter.jpg", {type:"image/jpeg"})] } });
  await screen.findByRole("checkbox", { name: /Confirmo que a foto/ });
}
function setup() {
  const exit = vi.fn();
  vi.mocked(prepareImage).mockResolvedValue({preview, image:"/9j/4A==",mimeType:"image/jpeg"});
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  render(<LanguageProvider><UploadView onExit={exit} /></LanguageProvider>);
  return { fetch, exit };
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe("photo preview and analysis", () => {
  it("does not transmit a selected photo until consent and Analyze are clicked", async () => {
    const {fetch} = setup(); await choose();
    const analyze = screen.getByRole("button", {name:"Analisar carta"});
    expect(analyze).toBeDisabled(); expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", {name:/Confirmo que a foto/}));
    expect(analyze).toBeEnabled(); expect(fetch).not.toHaveBeenCalled();
    fetch.mockResolvedValue(Response.json(DEMO_DOCUMENTS[0].result)); fireEvent.click(analyze);
    await screen.findByRole("heading", {name:"Explicação da carta"});
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/DOCUMENTO FICTÍCIO/)).not.toBeInTheDocument();
    expect(screen.getByText("Prazo de pagamento: 31 de março de 2025 (segunda-feira)")).toBeInTheDocument();
  });
  it("shows the API configuration error with the photo still available for retry", async () => {
    const {fetch} = setup(); await choose();
    fetch.mockResolvedValue(Response.json({code:"API_NOT_CONFIGURED"},{status:503}));
    fireEvent.click(screen.getByRole("checkbox",{name:/Confirmo que a foto/}));
    fireEvent.click(screen.getByRole("button",{name:"Analisar carta"}));
    expect(await screen.findByRole("alert")).toHaveTextContent("não está disponível");
    expect(screen.getByAltText("Pré-visualização")).toBeInTheDocument();
  });
  it("rejects unreadable local files without contacting the server", async () => {
    const {fetch} = setup(); vi.mocked(prepareImage).mockRejectedValue(new Error("errorType"));
    fireEvent.change(screen.getByLabelText("Tirar foto ou escolher imagem"),{target:{files:[new File(["bad"],"bad.gif")]}});
    await screen.findByRole("alert"); expect(fetch).not.toHaveBeenCalled();
  });
  it("aborts an in-progress request when returning home", async () => {
    const {fetch,exit} = setup(); await choose(); fetch.mockReturnValue(new Promise(() => {}));
    fireEvent.click(screen.getByRole("checkbox",{name:/Confirmo que a foto/}));
    fireEvent.click(screen.getByRole("button",{name:"Analisar carta"}));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button",{name:/Início/}));
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true); expect(exit).toHaveBeenCalledTimes(1);
  });
});

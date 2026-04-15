import { test, expect, vi, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock heavy child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">HeaderActions</div>,
}));

// Mock context providers
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useChat: vi.fn(),
}));

// Mock resizable panels (layout-only, not relevant to toggle behavior)
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ResizablePanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ResizableHandle: () => <div />,
}));

afterEach(cleanup);

describe("MainContent toggle buttons", () => {
  test("shows preview content by default", () => {
    render(<MainContent />);
    expect(screen.getByTestId("preview-frame")).toBeDefined();
    expect(screen.queryByTestId("code-editor")).toBeNull();
    expect(screen.queryByTestId("file-tree")).toBeNull();
  });

  test("Preview tab is active by default", () => {
    render(<MainContent />);
    const previewTab = screen.getByRole("tab", { name: "Preview" });
    expect(previewTab.getAttribute("data-state")).toBe("active");
    const codeTab = screen.getByRole("tab", { name: "Code" });
    expect(codeTab.getAttribute("data-state")).toBe("inactive");
  });

  test("clicking Code tab switches to code view", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeTab = screen.getByRole("tab", { name: "Code" });
    await user.click(codeTab);

    expect(screen.queryByTestId("preview-frame")).toBeNull();
    expect(screen.getByTestId("code-editor")).toBeDefined();
    expect(screen.getByTestId("file-tree")).toBeDefined();
  });

  test("Code tab becomes active after clicking it", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeTab = screen.getByRole("tab", { name: "Code" });
    await user.click(codeTab);

    expect(codeTab.getAttribute("data-state")).toBe("active");
    const previewTab = screen.getByRole("tab", { name: "Preview" });
    expect(previewTab.getAttribute("data-state")).toBe("inactive");
  });

  test("clicking Preview tab after Code switches back to preview", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    // Switch to code first
    await user.click(screen.getByRole("tab", { name: "Code" }));
    expect(screen.getByTestId("code-editor")).toBeDefined();

    // Switch back to preview
    await user.click(screen.getByRole("tab", { name: "Preview" }));
    expect(screen.getByTestId("preview-frame")).toBeDefined();
    expect(screen.queryByTestId("code-editor")).toBeNull();
  });

  test("tabs can be toggled multiple times", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const previewTab = screen.getByRole("tab", { name: "Preview" });
    const codeTab = screen.getByRole("tab", { name: "Code" });

    // Start on preview
    expect(screen.getByTestId("preview-frame")).toBeDefined();

    // Switch to code
    await user.click(codeTab);
    expect(screen.getByTestId("code-editor")).toBeDefined();

    // Switch back to preview
    await user.click(previewTab);
    expect(screen.getByTestId("preview-frame")).toBeDefined();

    // Switch to code again
    await user.click(codeTab);
    expect(screen.getByTestId("code-editor")).toBeDefined();
  });
});

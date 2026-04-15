import { test, expect, describe, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ToolInvocation } from "ai";
import { ToolInvocationDisplay, getToolLabel } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

// ─── Unit tests for getToolLabel ──────────────────────────────────────────────

describe("getToolLabel — str_replace_editor", () => {
  test("create returns 'Creating {basename}'", () => {
    expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/App.jsx" }))
      .toBe("Creating App.jsx");
  });

  test("str_replace returns 'Editing {basename}'", () => {
    expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/components/Button.jsx" }))
      .toBe("Editing Button.jsx");
  });

  test("insert returns 'Updating {basename}'", () => {
    expect(getToolLabel("str_replace_editor", { command: "insert", path: "/styles/globals.css" }))
      .toBe("Updating globals.css");
  });

  test("view returns 'Reading {basename}'", () => {
    expect(getToolLabel("str_replace_editor", { command: "view", path: "/src/index.ts" }))
      .toBe("Reading index.ts");
  });

  test("undo_edit returns 'Reverting {basename}'", () => {
    expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/src/App.tsx" }))
      .toBe("Reverting App.tsx");
  });
});

describe("getToolLabel — file_manager", () => {
  test("rename returns 'Renaming {basename}'", () => {
    expect(getToolLabel("file_manager", { command: "rename", path: "/src/OldName.tsx" }))
      .toBe("Renaming OldName.tsx");
  });

  test("delete returns 'Deleting {basename}'", () => {
    expect(getToolLabel("file_manager", { command: "delete", path: "/styles/styles.css" }))
      .toBe("Deleting styles.css");
  });
});

describe("getToolLabel — basename extraction", () => {
  test("extracts basename from deeply nested path", () => {
    expect(getToolLabel("str_replace_editor", { command: "create", path: "/a/b/c/d/Component.tsx" }))
      .toBe("Creating Component.tsx");
  });

  test("handles path with leading slash only one level deep", () => {
    expect(getToolLabel("str_replace_editor", { command: "view", path: "/README.md" }))
      .toBe("Reading README.md");
  });

  test("handles bare filename without directory", () => {
    expect(getToolLabel("str_replace_editor", { command: "create", path: "index.html" }))
      .toBe("Creating index.html");
  });
});

describe("getToolLabel — unknown tool fallback", () => {
  test("returns tool name verbatim for unknown tool", () => {
    expect(getToolLabel("some_unknown_tool", { command: "do_something" }))
      .toBe("some_unknown_tool");
  });

  test("returns tool name verbatim for empty args", () => {
    expect(getToolLabel("bash", {})).toBe("bash");
  });

  test("returns str_replace_editor verbatim when args are empty (no command)", () => {
    expect(getToolLabel("str_replace_editor", {})).toBe("str_replace_editor");
  });
});

// ─── Component rendering tests ────────────────────────────────────────────────

describe("ToolInvocationDisplay — loading state", () => {
  test("shows label when state is 'call'", () => {
    const invocation: ToolInvocation = {
      state: "call",
      toolCallId: "id-1",
      toolName: "str_replace_editor",
      args: { command: "create", path: "/src/App.jsx" },
    };

    render(<ToolInvocationDisplay toolInvocation={invocation} />);

    expect(screen.getByText("Creating App.jsx")).toBeDefined();
    const container = screen.getByText("Creating App.jsx").closest("div");
    expect(container?.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("shows label when state is 'partial-call'", () => {
    const invocation: ToolInvocation = {
      state: "partial-call",
      toolCallId: "id-2",
      toolName: "file_manager",
      args: { command: "delete", path: "/styles/old.css" },
    };

    render(<ToolInvocationDisplay toolInvocation={invocation} />);

    expect(screen.getByText("Deleting old.css")).toBeDefined();
    const container = screen.getByText("Deleting old.css").closest("div");
    expect(container?.querySelector(".bg-emerald-500")).toBeNull();
  });
});

describe("ToolInvocationDisplay — completed state", () => {
  test("shows green dot when state is 'result' with a result", () => {
    const invocation: ToolInvocation = {
      state: "result",
      toolCallId: "id-3",
      toolName: "str_replace_editor",
      args: { command: "str_replace", path: "/src/Button.jsx" },
      result: "Success",
    };

    render(<ToolInvocationDisplay toolInvocation={invocation} />);

    expect(screen.getByText("Editing Button.jsx")).toBeDefined();
    const container = screen.getByText("Editing Button.jsx").closest("div");
    expect(container?.querySelector(".bg-emerald-500")).toBeDefined();
  });

  test("shows spinner (not green dot) when state is 'result' but result is null", () => {
    const invocation: ToolInvocation = {
      state: "result",
      toolCallId: "id-4",
      toolName: "str_replace_editor",
      args: { command: "view", path: "/src/index.ts" },
      result: null,
    };

    render(<ToolInvocationDisplay toolInvocation={invocation} />);

    expect(screen.getByText("Reading index.ts")).toBeDefined();
    const container = screen.getByText("Reading index.ts").closest("div");
    expect(container?.querySelector(".bg-emerald-500")).toBeNull();
  });
});

describe("ToolInvocationDisplay — file_manager commands", () => {
  test("rename shows 'Renaming' label with green dot on completion", () => {
    const invocation: ToolInvocation = {
      state: "result",
      toolCallId: "id-5",
      toolName: "file_manager",
      args: { command: "rename", path: "/src/OldComponent.tsx" },
      result: { success: true },
    };

    render(<ToolInvocationDisplay toolInvocation={invocation} />);

    expect(screen.getByText("Renaming OldComponent.tsx")).toBeDefined();
    const container = screen.getByText("Renaming OldComponent.tsx").closest("div");
    expect(container?.querySelector(".bg-emerald-500")).toBeDefined();
  });
});

describe("ToolInvocationDisplay — unknown tool fallback", () => {
  test("renders tool name verbatim for unknown tool", () => {
    const invocation: ToolInvocation = {
      state: "call",
      toolCallId: "id-6",
      toolName: "bash_runner",
      args: { command: "ls" },
    };

    render(<ToolInvocationDisplay toolInvocation={invocation} />);

    expect(screen.getByText("bash_runner")).toBeDefined();
  });
});

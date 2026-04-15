"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

type StrReplaceArgs = {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
};

type FileManagerArgs = {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
};

export function getToolLabel(toolName: string, args: unknown): string {
  const basename = (p: string) => p.split("/").filter(Boolean).at(-1) ?? p;

  if (toolName === "str_replace_editor") {
    const { command, path } = args as StrReplaceArgs;
    if (path) {
      const name = basename(path);
      switch (command) {
        case "create":      return `Creating ${name}`;
        case "str_replace": return `Editing ${name}`;
        case "insert":      return `Updating ${name}`;
        case "view":        return `Reading ${name}`;
        case "undo_edit":   return `Reverting ${name}`;
      }
    }
  }

  if (toolName === "file_manager") {
    const { command, path } = args as FileManagerArgs;
    if (path) {
      const name = basename(path);
      switch (command) {
        case "rename": return `Renaming ${name}`;
        case "delete": return `Deleting ${name}`;
      }
    }
  }

  return toolName;
}

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationDisplay({ toolInvocation }: ToolInvocationDisplayProps) {
  const label = getToolLabel(toolInvocation.toolName, toolInvocation.args);
  const isCompleted =
    toolInvocation.state === "result" &&
    (toolInvocation as { result?: unknown }).result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}

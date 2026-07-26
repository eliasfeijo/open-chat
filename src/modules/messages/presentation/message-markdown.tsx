"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypePrismCommon from "rehype-prism-plus/common";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { isValidElement, type ReactElement } from "react";

type MessageMarkdownProps = {
  children: string;
};

const components: Components = {
  a({ children, href }) {
    return (
      <a
        className="text-(--color-accent) underline decoration-(--color-accent)/30 underline-offset-2 transition hover:decoration-(--color-accent)"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  },

  blockquote({ children }) {
    return (
      <blockquote className="my-4 border-l-3 border-(--color-accent)/30 pl-4 italic text-(--color-muted)">
        {children}
      </blockquote>
    );
  },

  code({ className, children }) {
    if (className) {
      return <code className={className}>{children}</code>;
    }

    return (
      <code className="rounded-md bg-(--color-page) px-1.5 py-0.5 font-mono text-sm text-(--color-foreground)">
        {children}
      </code>
    );
  },

  del({ children }) {
    return (
      <del className="text-(--color-muted) line-through">{children}</del>
    );
  },

  h1({ children }) {
    return (
      <h1 className="mb-2 mt-5 text-xl font-bold leading-8 text-(--color-foreground) first:mt-0">
        {children}
      </h1>
    );
  },

  h2({ children }) {
    return (
      <h2 className="mb-2 mt-4 text-lg font-bold leading-7 text-(--color-foreground) first:mt-0">
        {children}
      </h2>
    );
  },

  h3({ children }) {
    return (
      <h3 className="mb-1.5 mt-4 text-base font-semibold leading-7 text-(--color-foreground) first:mt-0">
        {children}
      </h3>
    );
  },

  h4({ children }) {
    return (
      <h4 className="mb-1 mt-3 text-sm font-semibold leading-6 text-(--color-foreground) first:mt-0">
        {children}
      </h4>
    );
  },

  h5({ children }) {
    return (
      <h5 className="mb-1 mt-3 text-sm font-medium leading-6 text-(--color-muted) first:mt-0">
        {children}
      </h5>
    );
  },

  h6({ children }) {
    return (
      <h6 className="mb-1 mt-3 text-xs font-medium leading-5 text-(--color-muted) first:mt-0">
        {children}
      </h6>
    );
  },

  hr() {
    return <hr className="my-5 border-t border-(--color-border)" />;
  },

  img() {
    return null;
  },

  input({ disabled, checked }) {
    return (
      <input
        checked={checked}
        className="mr-1.5 inline-flex accent-(--color-accent)"
        disabled={disabled}
        readOnly
        type="checkbox"
      />
    );
  },

  li({ children, className }) {
    if (className?.includes("task-list-item")) {
      return <li className="list-none">{children}</li>;
    }

    return <li className="leading-7">{children}</li>;
  },

  ol({ children, className }) {
    if (className?.includes("contains-task-list")) {
      return <ol className="my-3 space-y-1.5 pl-0">{children}</ol>;
    }

    return <ol className="my-3 list-decimal pl-6 leading-7">{children}</ol>;
  },

  p({ children }) {
    return (
      <p className="break-words whitespace-pre-wrap text-base leading-7 text-(--color-foreground)">
        {children}
      </p>
    );
  },

  pre({ children }) {
    const codeChild = isValidElement(children) ? children : null;
    let language: string | null = null;

    if (codeChild) {
      const props = codeChild.props as Record<string, unknown>;
      const className =
        typeof props.className === "string" ? props.className : "";
      if (className.startsWith("language-")) {
        language = className.slice("language-".length);
      }
    }

    return (
      <div className="group relative my-4 min-w-0">
        {language ? (
          <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-(--color-border) px-2 py-0.5 text-[11px] font-medium uppercase tracking-widest text-(--color-muted)">
            {language}
          </div>
        ) : null}
        <pre className="min-w-0 overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-page) p-4 pt-8 font-mono text-sm leading-6">
          {children}
        </pre>
      </div>
    );
  },

  table({ children }) {
    return (
      <div className="my-4 min-w-0 overflow-x-auto">
        <table className="w-full border-collapse text-sm leading-6">
          {children}
        </table>
      </div>
    );
  },

  tbody({ children }) {
    return (
      <tbody className="divide-y divide-(--color-border)">{children}</tbody>
    );
  },

  td({ children }) {
    return (
      <td className="border border-(--color-border) px-3 py-2 text-(--color-foreground)">
        {children}
      </td>
    );
  },

  th({ children }) {
    return (
      <th className="border border-(--color-border) bg-(--color-surface) px-3 py-2 text-left text-sm font-semibold text-(--color-foreground)">
        {children}
      </th>
    );
  },

  thead({ children }) {
    return (
      <thead className="border-b border-(--color-border)">{children}</thead>
    );
  },

  tr({ children }) {
    return (
      <tr className="even:bg-(--color-surface)">{children}</tr>
    );
  },

  ul({ children, className }) {
    if (className?.includes("contains-task-list")) {
      return <ul className="my-3 space-y-1.5 pl-0">{children}</ul>;
    }

    return <ul className="my-3 list-disc pl-6 leading-7">{children}</ul>;
  },
};

export function MessageMarkdown({
  children,
}: MessageMarkdownProps): ReactElement {
  return (
    <ReactMarkdown
      components={components}
      rehypePlugins={[[rehypePrismCommon, { ignoreMissing: true }]]}
      remarkPlugins={[remarkBreaks, remarkGfm]}
      skipHtml
    >
      {children}
    </ReactMarkdown>
  );
}

import { memo } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Markdown from 'react-markdown';
import type { Components, ExtraProps, Options } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import CopyButton from '../CopyButton';

// Minimal shape of the HTML tree nodes react-markdown passes to components.
type TreeNode = { type: string; value?: string; tagName?: string; properties?: Record<string, unknown>; children?: TreeNode[] };

function textOf(node?: TreeNode): string {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

// Fenced code block: language label and copy button above the code.
function CodeBlock({ node, children }: ComponentPropsWithoutRef<'pre'> & ExtraProps) {
  const code = (node as TreeNode | undefined)?.children?.find((child) => child.tagName === 'code');
  const classes = code?.properties?.className;
  const languageClass = Array.isArray(classes) ? classes.find((name): name is string => typeof name === 'string' && name.startsWith('language-')) : undefined;
  const language = languageClass?.replace('language-', '');
  const raw = textOf(code).replace(/\n$/, '');

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-line bg-muted">
      <div className="flex items-center justify-between border-b border-line py-1 pr-1.5 pl-4">
        <span className="font-mono text-xs text-ink-faint">{language ?? 'code'}</span>
        <CopyButton text={raw} label="Copy code" showText />
      </div>
      <pre className="scrollbar-thin overflow-x-auto px-4 py-3.5 text-[13.5px] leading-6">{children}</pre>
    </div>
  );
}

const components: Components = {
  p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="poppins mt-6 mb-3 text-[22px] leading-snug font-semibold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="poppins mt-6 mb-2.5 text-[19px] leading-snug font-semibold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="poppins mt-5 mb-2 text-[17px] leading-snug font-semibold first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-4 mb-1.5 font-semibold first:mt-0">{children}</h4>,
  h5: ({ children }) => <h5 className="mt-4 mb-1.5 font-semibold first:mt-0">{children}</h5>,
  h6: ({ children }) => <h6 className="mt-4 mb-1.5 font-semibold text-ink-soft first:mt-0">{children}</h6>,
  ul: ({ children, className }) => (
    // GFM task lists get `contains-task-list`: no bullets, checkbox instead.
    <ul className={`my-3 grid gap-1.5 pl-6 first:mt-0 last:mb-0 ${className?.includes('contains-task-list') ? 'list-none pl-1' : 'list-disc marker:text-accent/70'}`}>
      {children}
    </ul>
  ),
  ol: ({ children, start }) => (
    <ol start={start} className="my-3 grid list-decimal gap-1.5 pl-6 marker:font-medium marker:text-accent-ink first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children, className }) => <li className={`pl-1 ${className?.includes('task-list-item') ? 'flex items-start gap-2' : ''}`}>{children}</li>,
  input: ({ checked, type }) =>
    type === 'checkbox' ? <input type="checkbox" checked={checked} disabled readOnly className="mt-[7px] size-4 shrink-0 accent-[#1b7f79]" /> : null,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline decoration-accent/30 underline-offset-[3px] transition hover:decoration-accent">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  blockquote: ({ children }) => <blockquote className="my-4 border-l-[3px] border-accent/40 py-0.5 pl-4 text-ink-soft">{children}</blockquote>,
  hr: () => <hr className="my-6 border-line" />,
  pre: CodeBlock,
  // Inline code only; code inside <pre> is styled by CodeBlock.
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.88em] text-accent-ink [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-inherit">
        {children}
      </code>
    ),
  table: ({ children }) => (
    <div className="scrollbar-thin my-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-left text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted text-foreground">{children}</thead>,
  th: ({ children, style }) => (
    <th style={style} className="border-b border-line px-3.5 py-2 font-semibold whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border-b border-line px-3.5 py-2 align-top [tr:last-child_&]:border-b-0">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (typeof src === 'string' ? <img src={src} alt={alt ?? ''} loading="lazy" className="my-3 max-h-96 rounded-xl border border-line" /> : null),
};

// Renders Missie's markdown replies: GitHub-flavoured markdown (tables, task
// lists, strikethrough, autolinks) with syntax-highlighted code. Inline HTML
// the model sometimes writes (e.g. <br> inside table cells) is rendered too,
// after sanitising it with GitHub's allow-list (no scripts, styles or handlers).
// Highlighting runs last so its classes aren't stripped.
const rehypePlugins = [rehypeRaw, rehypeSanitize, [rehypeHighlight, { detect: true }]] as Options['rehypePlugins'];

function MarkdownContent({ children }: { children: string }): ReactNode {
  return (
    <div className="markdown text-base leading-7 break-words text-foreground">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} components={components}>
        {children}
      </Markdown>
    </div>
  );
}

// Re-render only when the text changes (matters while a reply streams in).
export default memo(MarkdownContent);

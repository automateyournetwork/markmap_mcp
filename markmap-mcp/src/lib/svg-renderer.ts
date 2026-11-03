/**
 * Static SVG Renderer
 *
 * Lays out a markmap tree and writes it as a self-contained SVG string.
 * markmap-view needs a browser (it measures rendered HTML, observes resizes
 * and draws on animation frames), so it cannot render under Node or JSDOM.
 * This renderer computes the same left-to-right layout from estimated text
 * widths instead, so it runs anywhere and the result is deterministic.
 *
 * @module lib/svg-renderer
 */

/** Node shape produced by markmap-lib's Transformer */
export interface TransformedNode {
  content: string;
  children?: TransformedNode[];
  payload?: Record<string, unknown>;
}

/** Options for static rendering */
export interface StaticRenderOptions {
  /** Base font size in pixels (default: 16) */
  fontSize?: number;
  /** Wrap node text wider than this many pixels; 0 disables wrapping (default: 0) */
  maxWidth?: number;
  /** Vertical gap between sibling nodes (default: 8) */
  spacing?: number;
  /** Horizontal gap between a node and its children (default: 80) */
  paddingX?: number;
  /** Margin around the whole map (default: 20) */
  paddingY?: number;
  /** Nodes deeper than this level use their parent's color; 0 never freezes (default: 0) */
  colorFreezeLevel?: number;
  /** Branch colors, cycled in order */
  colors?: string[];
  /** Light text on a dark background */
  dark?: boolean;
}

/** d3's schemeCategory10, markmap's default palette */
const DEFAULT_COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

/** Hex (#rgb, #rrggbb, #rrggbbaa) or a plain CSS color name */
const SAFE_COLOR = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20})$/;

interface LayoutNode {
  lines: string[];
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  color: string;
  children: LayoutNode[];
}

/**
 * Reduce markmap's HTML node content to plain text.
 * Tags are dropped (link text and code are kept as text) and the common
 * entities decoded; the result is escaped again when written to SVG.
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Estimate rendered text width for a sans-serif font.
 * Without a layout engine this is an approximation; it errs wide so text
 * does not run into the links.
 */
export function textWidth(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x2e80) units += 1.0;            // CJK, full-width, emoji
    else if ('iljtfI.,;:!|\'`'.includes(ch)) units += 0.34;
    else if ('mwMW@'.includes(ch)) units += 0.95;
    else if (ch >= 'A' && ch <= 'Z') units += 0.72;
    else if (ch >= '0' && ch <= '9') units += 0.66;
    else if (ch === ' ') units += 0.34;
    else units += 0.62;
  }
  return Math.ceil(units * fontSize);
}

/** Split text into lines no wider than maxWidth (words longer than that stay whole) */
function wrap(text: string, maxWidth: number, fontSize: number): string[] {
  if (!maxWidth || textWidth(text, fontSize) <= maxWidth) return [text];
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Render a markmap-lib tree to an SVG document string.
 *
 * @param root - Root node from Transformer.transform()
 * @param options - Rendering options
 * @returns Complete SVG markup
 */
export function renderStaticSvg(root: TransformedNode, options: StaticRenderOptions = {}): string {
  const fontSize = options.fontSize && options.fontSize > 0 ? options.fontSize : 16;
  const lineHeight = Math.round(fontSize * 1.25);
  const maxWidth = options.maxWidth && options.maxWidth > 0 ? options.maxWidth : 0;
  const gapY = options.spacing ?? 8;
  const gapX = options.paddingX ?? 80;
  const margin = options.paddingY ?? 20;
  const freeze = options.colorFreezeLevel ?? 0;
  const colors = (options.colors ?? []).filter(c => SAFE_COLOR.test(c));
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS;
  const textColor = options.dark ? '#e6e6e6' : '#333333';
  const background = options.dark ? '#1e1e1e' : '#ffffff';
  let colorIndex = 0;

  const build = (node: TransformedNode, depth: number, parentColor: string): LayoutNode => {
    const lines = wrap(htmlToText(node.content) || ' ', maxWidth, fontSize);
    const color = freeze > 0 && depth > freeze
      ? parentColor
      : palette[colorIndex++ % palette.length];
    return {
      lines,
      // Room after the text for the junction circle.
      width: Math.max(...lines.map(l => textWidth(l, fontSize))) + Math.round(fontSize * 0.5),
      height: lines.length * lineHeight,
      depth,
      x: 0,
      y: 0,
      color,
      children: (node.children ?? []).map(child => build(child, depth + 1, color))
    };
  };

  // Places a subtree starting at `top`; returns the height it occupies.
  // Leaves stack downward; a parent is centred on its children.
  const place = (node: LayoutNode, x: number, top: number): number => {
    node.x = x;
    if (node.children.length === 0) {
      node.y = top;
      return node.height;
    }
    const childX = x + node.width + gapX;
    let cursor = top;
    node.children.forEach((child, i) => {
      cursor += place(child, childX, cursor) + (i < node.children.length - 1 ? gapY : 0);
    });
    const span = cursor - top;
    if (node.height > span) {
      // A tall parent: push its children down so they stay centred on it.
      const shift = (node.height - span) / 2;
      const move = (n: LayoutNode) => { n.y += shift; n.children.forEach(move); };
      node.children.forEach(move);
    }
    const first = node.children[0];
    const last = node.children[node.children.length - 1];
    const centre = (first.y + first.height / 2 + last.y + last.height / 2) / 2;
    node.y = centre - node.height / 2;
    return Math.max(span, node.height);
  };

  const tree = build(root, 0, palette[0]);
  const totalHeight = place(tree, margin, margin);

  const links: string[] = [];
  const nodes: string[] = [];
  let right = 0;
  let bottom = margin + totalHeight;

  const draw = (node: LayoutNode) => {
    const base = node.y + node.height;           // underline sits below the text
    const end = node.x + node.width;
    const stroke = Math.max(1, 3 - node.depth * 0.5);
    right = Math.max(right, end);
    bottom = Math.max(bottom, base);

    const text = node.lines.map((line, i) =>
      `<text x="${node.x}" y="${node.y + (i + 1) * lineHeight - Math.round(lineHeight * 0.25)}">` +
      `${escapeXml(line)}</text>`
    ).join('');
    const underline = `<line x1="${node.x}" y1="${base}" x2="${end}" y2="${base}" ` +
      `stroke="${node.color}" stroke-width="${stroke}"/>`;
    const knob = node.children.length > 0
      ? `<circle cx="${end}" cy="${base}" r="4" fill="${background}" stroke="${node.color}" stroke-width="1.5"/>`
      : '';
    nodes.push(`<g class="markmap-node" data-depth="${node.depth}">${underline}${knob}${text}</g>`);

    for (const child of node.children) {
      const childBase = child.y + child.height;
      const mid = (end + child.x) / 2;
      links.push(
        `<path d="M${end},${base} C${mid},${base} ${mid},${childBase} ${child.x},${childBase}" ` +
        `fill="none" stroke="${child.color}" stroke-width="${Math.max(1, 3 - child.depth * 0.5)}"/>`
      );
      draw(child);
    }
  };
  draw(tree);

  const width = Math.ceil(right + margin);
  const height = Math.ceil(bottom + margin);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" class="markmap" width="${width}" height="${height}" ` +
      `viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="${background}"/>`,
    `<g font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" ` +
      `font-size="${fontSize}" fill="${textColor}">`,
    ...links,
    ...nodes,
    '</g>',
    '</svg>'
  ].join('\n');
}

/**
 * Rendering tests: the tools return a complete, laid-out SVG under plain Node.
 */

import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { generateTool } from '../src/tools/generate.js';
import { customizeTool } from '../src/tools/customize.js';
import { renderFileTool } from '../src/tools/renderFile.js';
import { fromOutlineTool } from '../src/tools/fromOutline.js';
import { renderStaticSvg, htmlToText } from '../src/lib/svg-renderer.js';

const svgOf = (result: any): string => {
  expect(result.isError).toBeUndefined();
  return result.structuredContent.svg_content;
};

const texts = (svg: string) => [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)">([^<]*)<\/text>/g)]
  .map(m => ({ x: Number(m[1]), y: Number(m[2]), text: m[3] }));

describe('markmap_generate', () => {
  it('renders every node as positioned text', async () => {
    const svg = svgOf(await generateTool({
      markdown_content: '# Risk migration check\n## members\n## system units\n## OpenClaw'
    }));
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    const nodes = texts(svg);
    expect(nodes.map(n => n.text)).toEqual(
      expect.arrayContaining(['Risk migration check', 'members', 'system units', 'OpenClaw']));
    const root = nodes.find(n => n.text === 'Risk migration check')!;
    const branches = nodes.filter(n => n !== root);
    // Children sit to the right of the root, in distinct rows, root centred on them.
    for (const b of branches) expect(b.x).toBeGreaterThan(root.x);
    expect(new Set(branches.map(b => b.y)).size).toBe(3);
    const ys = branches.map(b => b.y).sort((a, b) => a - b);
    expect(root.y).toBeCloseTo(ys[1], 0);
    expect((svg.match(/<path /g) || []).length).toBe(3);
  });

  it('writes markdown and HTML content as escaped text only', async () => {
    const svg = svgOf(await generateTool({
      markdown_content: '# Net **core**\n## A & B\n## <script>alert(1)</script>\n## [docs](https://example.net) `cfg`'
    }));
    expect(svg).not.toMatch(/<script|<strong|<a |<code|<foreignObject/);
    expect(texts(svg).map(n => n.text)).toEqual(
      expect.arrayContaining(['Net core', 'A &amp; B', 'docs cfg']));
  });

  it('wraps long node text at maxWidth', () => {
    const svg = renderStaticSvg(
      { content: 'root', children: [{ content: 'one two three four five six seven eight' }] },
      { maxWidth: 80 });
    expect(texts(svg).length).toBeGreaterThan(2);
  });

  it('keeps sibling subtrees from overlapping', () => {
    const svg = renderStaticSvg({ content: 'r', children: [
      { content: 'a', children: [{ content: 'a1' }, { content: 'a2' }, { content: 'a3' }] },
      { content: 'b', children: [{ content: 'b1' }, { content: 'b2' }] }
    ] });
    const leaves = texts(svg).filter(n => /\d$/.test(n.text)).map(n => n.y);
    const sorted = [...leaves].sort((a, b) => a - b);
    expect(leaves).toEqual(sorted);
    for (let i = 1; i < sorted.length; i++) expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(20);
  });
});

describe('markmap_customize', () => {
  it('applies the dark theme and a custom color scheme', async () => {
    const svg = svgOf(await customizeTool({
      markdown_content: '# Audit\n## Critical\n## High',
      theme: 'dark',
      color_scheme: ['#ff0000', '#00ff00', '#0000ff']
    } as any));
    expect(svg).toContain('fill="#1e1e1e"');
    expect(svg).toContain('stroke="#00ff00"');
  });

  it('ignores color values that are not plain colors', () => {
    const svg = renderStaticSvg({ content: 'r', children: [{ content: 'a' }] },
      { colors: ['red" onload="alert(1)'] });
    expect(svg).not.toContain('onload');
  });
});

describe('markmap_from_outline', () => {
  it('renders an outline', async () => {
    const svg = svgOf(await fromOutlineTool({
      outline_items: [{ text: 'Network', level: 1 }, { text: 'Routers', level: 2 }, { text: 'R1', level: 3 }]
    } as any));
    expect(texts(svg).map(n => n.text)).toEqual(['Network', 'Routers', 'R1']);
  });
});

describe('markmap_render_file', () => {
  it('saves the SVG it returns', async () => {
    // The tool only reads and writes under the server's working directory.
    const dir = mkdtempSync(path.join(process.cwd(), '.test-markmap-'));
    try {
      const input = path.join(dir, 'map.md');
      const output = path.join(dir, 'map.svg');
      writeFileSync(input, '# Root\n## Child');
      const svg = svgOf(await renderFileTool({ file_path: input, save_output: true, output_path: output } as any));
      expect(readFileSync(output, 'utf-8')).toBe(svg);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('htmlToText', () => {
  it('drops tags and decodes entities once', () => {
    expect(htmlToText('<a href="x">a</a> &amp;lt; &lt;b&gt;')).toBe('a &lt; <b>');
  });
});

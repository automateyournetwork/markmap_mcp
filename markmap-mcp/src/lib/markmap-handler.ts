/**
 * Markmap Handler
 *
 * Core integration layer between markmap libraries and MCP server.
 * Handles Markdown parsing and SVG generation in Node.js environment.
 *
 * @module lib/markmap-handler
 */

import { Transformer } from 'markmap-lib';
import { renderStaticSvg } from './svg-renderer.js';
import type { MarkmapOptions, MarkmapNode, MarkmapTheme } from './types.js';

/**
 * Theme configurations for different visual styles
 */
const THEMES: Record<MarkmapTheme, Partial<MarkmapOptions>> = {
  default: {
    colorFreezeLevel: 6,
    duration: 500,
    maxWidth: 0,
    zoom: true,
    pan: true
  },
  dark: {
    colorFreezeLevel: 4,
    duration: 400,
    maxWidth: 300,
    zoom: true,
    pan: true
  },
  colorful: {
    colorFreezeLevel: 2,
    duration: 600,
    maxWidth: 0,
    zoom: true,
    pan: true
  },
  minimal: {
    colorFreezeLevel: 8,
    duration: 300,
    maxWidth: 200,
    zoom: false,
    pan: false
  }
};

/**
 * Color schemes for different themes
 */
const COLOR_SCHEMES: Record<MarkmapTheme, string[]> = {
  default: ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01', '#46bdc6'],
  dark: ['#bb86fc', '#03dac6', '#cf6679', '#3700b3', '#018786', '#b00020'],
  colorful: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
  minimal: ['#333333', '#666666', '#999999', '#CCCCCC', '#555555', '#777777']
};

/**
 * Main class for handling markmap operations
 *
 * Wraps markmap-lib and markmap-view to provide a clean interface
 * for the MCP tools. SVG is rendered statically (see svg-renderer).
 */
export class MarkmapHandler {
  private transformer: Transformer;

  /**
   * Initialize the handler with markmap transformer
   */
  constructor() {
    this.transformer = new Transformer();
  }

  /**
   * Parse Markdown content and extract structure
   *
   * @param content - Markdown text to parse
   * @returns Parsed root node and features
   */
  parseMarkdown(content: string): { root: any; features: any } {
    if (!content || content.trim().length === 0) {
      throw new Error('Markdown content cannot be empty');
    }

    try {
      const { root, features } = this.transformer.transform(content);
      return { root, features };
    } catch (error) {
      throw new Error(`Failed to parse markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Render Markdown to a static SVG string
   *
   * @param content - Markdown text to render
   * @param options - Rendering options
   * @param colors - Branch colors (defaults to markmap's palette)
   * @param dark - Light text on a dark background
   * @returns SVG content as string
   */
  async renderToSVG(content: string, options?: MarkmapOptions, colors?: string[], dark = false): Promise<string> {
    const { root } = this.parseMarkdown(content);
    return renderStaticSvg(root, {
      fontSize: options?.fontSize,
      maxWidth: options?.maxWidth,
      spacing: options?.spacing,
      paddingX: options?.paddingX,
      paddingY: options?.paddingY,
      colorFreezeLevel: options?.colorFreezeLevel,
      colors,
      dark
    });
  }

  /**
   * Get hierarchical structure from Markdown
   *
   * Converts the markmap root structure into a clean hierarchical format
   *
   * @param content - Markdown text to analyze
   * @returns Hierarchical node structure
   */
  getHierarchy(content: string): MarkmapNode {
    const { root } = this.parseMarkdown(content);
    return this.convertToHierarchy(root, 1);
  }

  /**
   * Convert markmap root to hierarchical structure
   *
   * @param node - Markmap node
   * @param depth - Current depth
   * @returns MarkmapNode structure
   */
  private convertToHierarchy(node: any, depth: number): MarkmapNode {
    const hierarchyNode: MarkmapNode = {
      content: node.content || node.value || '',
      depth: depth,
      payload: node.payload
    };

    if (node.children && node.children.length > 0) {
      hierarchyNode.children = node.children.map((child: any) =>
        this.convertToHierarchy(child, depth + 1)
      );
    }

    return hierarchyNode;
  }

  /**
   * Apply customization to mindmap
   *
   * @param content - Markdown text
   * @param theme - Theme name
   * @param colorScheme - Custom color scheme
   * @param options - Custom options
   * @returns Customized SVG
   */
  async applyCustomization(
    content: string,
    theme?: MarkmapTheme,
    colorScheme?: string[],
    options?: MarkmapOptions
  ): Promise<string> {
    // Start with default options
    let mergedOptions: MarkmapOptions = { ...THEMES.default };

    // Apply theme if specified
    if (theme && THEMES[theme]) {
      mergedOptions = { ...mergedOptions, ...THEMES[theme] };
    }

    // Apply custom options
    if (options) {
      mergedOptions = { ...mergedOptions, ...options };
    }

    const colors = colorScheme && colorScheme.length > 0
      ? colorScheme
      : theme ? this.getColorScheme(theme) : undefined;
    return this.renderToSVG(content, mergedOptions, colors, theme === 'dark');
  }

  /**
   * Get color scheme for a theme
   *
   * @param theme - Theme name
   * @returns Array of color hex codes
   */
  getColorScheme(theme: MarkmapTheme): string[] {
    return COLOR_SCHEMES[theme] || COLOR_SCHEMES.default;
  }

  /**
   * Calculate statistics about a hierarchical node
   *
   * @param node - Root node
   * @returns Statistics object
   */
  calculateStatistics(node: MarkmapNode): {
    nodeCount: number;
    maxDepth: number;
    headingsByLevel: Record<number, number>;
    totalCharacters: number;
  } {
    let nodeCount = 0;
    let maxDepth = 0;
    const headingsByLevel: Record<number, number> = {};
    let totalCharacters = 0;

    const traverse = (n: MarkmapNode, currentDepth: number) => {
      nodeCount++;
      maxDepth = Math.max(maxDepth, currentDepth);

      headingsByLevel[currentDepth] = (headingsByLevel[currentDepth] || 0) + 1;
      totalCharacters += n.content.length;

      if (n.children) {
        n.children.forEach(child => traverse(child, currentDepth + 1));
      }
    };

    traverse(node, node.depth);

    return {
      nodeCount,
      maxDepth,
      headingsByLevel,
      totalCharacters
    };
  }
}

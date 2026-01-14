/**
 * Markdown parsing utilities
 *
 * Helper functions for working with Markdown content
 *
 * @module utils/markdown-parser
 */

import type { OutlineItem } from '../lib/types.js';

/**
 * Convert outline items to Markdown format
 *
 * @param items - Array of outline items with text and level
 * @returns Formatted Markdown string
 */
export function outlineToMarkdown(items: OutlineItem[]): string {
  return items
    .map((item) => {
      const prefix = '#'.repeat(item.level);
      return `${prefix} ${item.text}`;
    })
    .join('\n\n');
}

/**
 * Count nodes in a hierarchical structure
 *
 * @param node - Root node
 * @returns Total node count
 */
export function countNodes(node: any): number {
  let count = 1;
  if (node.children && Array.isArray(node.children)) {
    count += node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0);
  }
  return count;
}

/**
 * Calculate maximum depth of a tree
 *
 * @param node - Root node
 * @param currentDepth - Current depth level
 * @returns Maximum depth
 */
export function calculateDepth(node: any, currentDepth: number = 1): number {
  if (!node.children || node.children.length === 0) {
    return currentDepth;
  }
  return Math.max(...node.children.map((child: any) => calculateDepth(child, currentDepth + 1)));
}

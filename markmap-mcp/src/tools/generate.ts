/**
 * markmap_generate tool implementation
 *
 * Convert Markdown text to interactive mindmap SVG
 *
 * @module tools/generate
 */

import { MarkmapHandler } from '../lib/markmap-handler.js';
import { countNodes, calculateDepth } from '../utils/markdown-parser.js';
import type { GenerateInput, GenerateOutput, ToolResponse, ToolError } from '../lib/types.js';

/**
 * Generate mindmap from Markdown content
 *
 * @param input - Tool input parameters
 * @returns MCP tool response with SVG content
 */
export async function generateTool(input: GenerateInput): Promise<ToolResponse<GenerateOutput> | ToolError> {
  try {
    // Validate input
    if (!input.markdown_content || input.markdown_content.trim().length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'Error: Markdown content cannot be empty'
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Check size limit (1MB)
    const sizeInBytes = Buffer.byteLength(input.markdown_content, 'utf8');
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 1) {
      return {
        content: [{
          type: 'text',
          text: `Error: Markdown content too large (${sizeInMB.toFixed(2)}MB). Maximum size is 1MB`
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Create handler and generate SVG
    const handler = new MarkmapHandler();

    // Parse to get structure info
    const { root, features } = handler.parseMarkdown(input.markdown_content);

    // Count nodes and check limit
    const nodeCount = countNodes(root);
    if (nodeCount > 10000) {
      return {
        content: [{
          type: 'text',
          text: `Error: Too many nodes (${nodeCount}). Maximum is 10,000 nodes`
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Calculate depth
    const depth = calculateDepth(root);
    if (depth > 20) {
      return {
        content: [{
          type: 'text',
          text: `Error: Tree too deep (${depth} levels). Maximum depth is 20 levels`
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Render to SVG
    const svg_content = await handler.renderToSVG(input.markdown_content, input.options);

    // Extract feature names
    const features_used = Object.keys(features || {});

    // Build response
    const output: GenerateOutput = {
      svg_content,
      node_count: nodeCount,
      depth,
      features_used
    };

    return {
      content: [{
        type: 'text',
        text: `Successfully generated mindmap with ${nodeCount} nodes and ${depth} levels of depth`
      }],
      structuredContent: output
    };

  } catch (error) {
    // Handle parsing errors
    if (error instanceof Error && error.message.includes('parse')) {
      return {
        content: [{
          type: 'text',
          text: `Parse Error: ${error.message}`
        }],
        isError: true,
        errorType: 'ParseError'
      };
    }

    // Handle rendering errors
    if (error instanceof Error && error.message.includes('render')) {
      return {
        content: [{
          type: 'text',
          text: `Render Error: ${error.message}`
        }],
        isError: true,
        errorType: 'RenderError'
      };
    }

    // Generic error
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }],
      isError: true,
      errorType: 'RenderError'
    };
  }
}

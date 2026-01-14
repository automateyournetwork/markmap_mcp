/**
 * markmap_get_structure tool implementation
 *
 * Extract and analyze hierarchical structure from Markdown
 *
 * @module tools/getStructure
 */

import { MarkmapHandler } from '../lib/markmap-handler.js';
import type { GetStructureInput, GetStructureOutput, ToolResponse, ToolError } from '../lib/types.js';

/**
 * Get structure from Markdown content
 *
 * @param input - Tool input parameters
 * @returns MCP tool response with hierarchy and statistics
 */
export async function getStructureTool(
  input: GetStructureInput
): Promise<ToolResponse<GetStructureOutput> | ToolError> {
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

    // Create handler
    const handler = new MarkmapHandler();

    // Get hierarchy
    const hierarchy = handler.getHierarchy(input.markdown_content);

    // Parse to get features
    const { features } = handler.parseMarkdown(input.markdown_content);
    const features_detected = Object.keys(features || {});

    // Calculate statistics
    const stats = handler.calculateStatistics(hierarchy);

    // Build response
    const output: GetStructureOutput = {
      hierarchy: input.include_content !== false ? hierarchy : {
        ...hierarchy,
        content: `[${hierarchy.content.length} characters]`
      },
      node_count: stats.nodeCount,
      max_depth: stats.maxDepth,
      features_detected,
      statistics: {
        headings_by_level: stats.headingsByLevel,
        total_characters: stats.totalCharacters,
        average_node_length: Math.round(stats.totalCharacters / stats.nodeCount)
      }
    };

    return {
      content: [{
        type: 'text',
        text: `Analyzed structure: ${stats.nodeCount} nodes, ${stats.maxDepth} levels deep, ${stats.totalCharacters} characters`
      }],
      structuredContent: output
    };

  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }],
      isError: true,
      errorType: 'ParseError'
    };
  }
}

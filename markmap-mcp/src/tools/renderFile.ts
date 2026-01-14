/**
 * markmap_render_file tool implementation
 *
 * Read a Markdown file and generate mindmap
 *
 * @module tools/renderFile
 */

import { promises as fs } from 'fs';
import path from 'path';
import { MarkmapHandler } from '../lib/markmap-handler.js';
import { countNodes, calculateDepth } from '../utils/markdown-parser.js';
import type { RenderFileInput, RenderFileOutput, ToolResponse, ToolError } from '../lib/types.js';

/**
 * Validate file path for security
 * Prevents path traversal attacks
 */
function validateFilePath(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  const cwd = path.resolve(process.cwd());
  return resolved.startsWith(cwd);
}

/**
 * Render mindmap from file
 *
 * @param input - Tool input parameters
 * @returns MCP tool response with SVG content and file info
 */
export async function renderFileTool(
  input: RenderFileInput
): Promise<ToolResponse<RenderFileOutput> | ToolError> {
  try {
    // Validate input
    if (!input.file_path || input.file_path.trim().length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'Error: File path cannot be empty'
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Validate file extension
    const ext = path.extname(input.file_path).toLowerCase();
    if (ext !== '.md' && ext !== '.markdown') {
      return {
        content: [{
          type: 'text',
          text: `Error: Invalid file extension '${ext}'. Only .md and .markdown files are supported`
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Security check - prevent path traversal
    if (!validateFilePath(input.file_path)) {
      return {
        content: [{
          type: 'text',
          text: 'Error: File path must be within the current working directory'
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Read file
    let markdown_content: string;
    let stats: any;

    try {
      markdown_content = await fs.readFile(input.file_path, 'utf-8');
      stats = await fs.stat(input.file_path);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `File Error: ${error instanceof Error ? error.message : 'Could not read file'}`
        }],
        isError: true,
        errorType: 'FileSystemError'
      };
    }

    // Check file size (max 5MB)
    const fileSizeKB = stats.size / 1024;
    const fileSizeMB = fileSizeKB / 1024;

    if (fileSizeMB > 5) {
      return {
        content: [{
          type: 'text',
          text: `Error: File too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 5MB`
        }],
        isError: true,
        errorType: 'ValidationError'
      };
    }

    // Create handler and generate SVG
    const handler = new MarkmapHandler();
    const { root, features } = handler.parseMarkdown(markdown_content);

    // Get statistics
    const nodeCount = countNodes(root);
    const depth = calculateDepth(root);

    // Render to SVG
    const svg_content = await handler.renderToSVG(markdown_content, input.options);

    // Save SVG if requested
    let saved_path: string | undefined;
    if (input.save_output && input.output_path) {
      try {
        // Validate output path
        if (!validateFilePath(input.output_path)) {
          return {
            content: [{
              type: 'text',
              text: 'Error: Output path must be within the current working directory'
            }],
            isError: true,
            errorType: 'ValidationError'
          };
        }

        // Ensure output directory exists
        const outputDir = path.dirname(input.output_path);
        await fs.mkdir(outputDir, { recursive: true });

        // Write SVG file
        await fs.writeFile(input.output_path, svg_content, 'utf-8');
        saved_path = input.output_path;
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error saving file: ${error instanceof Error ? error.message : 'Could not save SVG'}`
          }],
          isError: true,
          errorType: 'FileSystemError'
        };
      }
    }

    // Build response
    const output: RenderFileOutput = {
      svg_content,
      file_path: input.file_path,
      saved_path,
      node_count: nodeCount,
      depth,
      features_used: Object.keys(features || {}),
      file_size_kb: Math.round(fileSizeKB * 100) / 100
    };

    const message = saved_path
      ? `Successfully rendered ${input.file_path} (${nodeCount} nodes) and saved to ${saved_path}`
      : `Successfully rendered ${input.file_path} with ${nodeCount} nodes`;

    return {
      content: [{
        type: 'text',
        text: message
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
      errorType: 'RenderError'
    };
  }
}

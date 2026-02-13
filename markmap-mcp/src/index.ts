#!/usr/bin/env node

/**
 * Markmap MCP Server
 *
 * Entry point for the Model Context Protocol server that provides
 * markmap.js.org integration for Claude Code.
 *
 * @module index
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult
} from '@modelcontextprotocol/sdk/types.js';

// Import tool handlers
import { generateTool } from './tools/generate.js';
import { fromOutlineTool } from './tools/fromOutline.js';
import { getStructureTool } from './tools/getStructure.js';
import { renderFileTool } from './tools/renderFile.js';
import { customizeTool } from './tools/customize.js';

/**
 * Tool definitions for MCP
 */
const TOOLS: Tool[] = [
  {
    name: 'markmap_generate',
    description: 'Generate an interactive mindmap SVG from Markdown content. Supports custom options for visualization.',
    inputSchema: {
      type: 'object',
      properties: {
        markdown_content: {
          type: 'string',
          description: 'Markdown text to convert to mindmap'
        },
        options: {
          type: 'object',
          description: 'Optional rendering options',
          properties: {
            colorFreezeLevel: {
              type: 'number',
              description: 'Freeze colors at this level (default: 6)'
            },
            duration: {
              type: 'number',
              description: 'Animation duration in ms (default: 500)'
            },
            maxWidth: {
              type: 'number',
              description: 'Maximum width of node text (default: 0 for unlimited)'
            },
            zoom: {
              type: 'boolean',
              description: 'Enable zoom interaction (default: true)'
            },
            pan: {
              type: 'boolean',
              description: 'Enable pan interaction (default: true)'
            }
          }
        }
      },
      required: ['markdown_content']
    }
  },
  {
    name: 'markmap_from_outline',
    description: 'Generate a mindmap from a hierarchical outline structure. Automatically converts outline to markdown format.',
    inputSchema: {
      type: 'object',
      properties: {
        outline_items: {
          type: 'array',
          description: 'Array of outline items with text and indentation level',
          items: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Text content of the item'
              },
              level: {
                type: 'number',
                description: 'Indentation/heading level (1-6)',
                minimum: 1,
                maximum: 6
              }
            },
            required: ['text', 'level']
          }
        },
        options: {
          type: 'object',
          description: 'Optional rendering options (same as markmap_generate)'
        }
      },
      required: ['outline_items']
    }
  },
  {
    name: 'markmap_get_structure',
    description: 'Extract the hierarchical structure from Markdown content without rendering. Returns tree structure and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        markdown_content: {
          type: 'string',
          description: 'Markdown text to analyze'
        },
        include_content: {
          type: 'boolean',
          description: 'Include full text content in nodes (default: true)'
        }
      },
      required: ['markdown_content']
    }
  },
  {
    name: 'markmap_render_file',
    description: 'Read a Markdown file and generate a mindmap. Can optionally save the SVG output to a file.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to markdown file to render'
        },
        options: {
          type: 'object',
          description: 'Optional rendering options'
        },
        save_output: {
          type: 'boolean',
          description: 'Whether to save SVG to file (default: false)'
        },
        output_path: {
          type: 'string',
          description: 'Path to save SVG file (required if save_output is true)'
        }
      },
      required: ['file_path']
    }
  },
  {
    name: 'markmap_customize',
    description: 'Generate a mindmap with custom styling, themes, and color schemes. Provides advanced customization options.',
    inputSchema: {
      type: 'object',
      properties: {
        markdown_content: {
          type: 'string',
          description: 'Markdown text to convert to mindmap'
        },
        theme: {
          type: 'string',
          enum: ['default', 'dark', 'colorful', 'minimal'],
          description: 'Predefined theme to apply'
        },
        color_scheme: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of hex color codes for node coloring'
        },
        options: {
          type: 'object',
          description: 'Advanced customization options'
        }
      },
      required: ['markdown_content']
    }
  }
];

/**
 * Initialize and start the Markmap MCP server
 */
async function main() {
  console.error('Starting Markmap MCP Server...');

  // Create server instance
  const server = new Server(
    {
      name: 'markmap-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Register list tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('Listing tools...');
    return { tools: TOOLS };
  });

  // Register call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    console.error(`Calling tool: ${name}`);

    try {
      let result;
      switch (name) {
        case 'markmap_generate':
          result = await generateTool(args as any);
          break;

        case 'markmap_from_outline':
          result = await fromOutlineTool(args as any);
          break;

        case 'markmap_get_structure':
          result = await getStructureTool(args as any);
          break;

        case 'markmap_render_file':
          result = await renderFileTool(args as any);
          break;

        case 'markmap_customize':
          result = await customizeTool(args as any);
          break;

        default:
          return {
            content: [{
              type: 'text' as const,
              text: `Unknown tool: ${name}`
            }],
            isError: true
          };
      }

      // Return MCP-compliant response with explicit type
      // The structuredContent must be cast to Record<string, unknown> to match MCP SDK types
      // We use double assertion through unknown for type compatibility
      const response: CallToolResult = {
        content: result.content,
        ...(('structuredContent' in result && result.structuredContent) && {
          structuredContent: result.structuredContent as unknown as Record<string, unknown>
        }),
        ...(('isError' in result && result.isError !== undefined) && {
          isError: result.isError
        })
      };
      return response;
    } catch (error) {
      console.error(`Error in tool ${name}:`, error);
      return {
        content: [{
          type: 'text' as const,
          text: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Markmap MCP Server running on stdio');
  console.error('Server name: markmap-mcp v1.0.0');
  console.error('Tools available: 5');
  console.error('  - markmap_generate');
  console.error('  - markmap_from_outline');
  console.error('  - markmap_get_structure');
  console.error('  - markmap_render_file');
  console.error('  - markmap_customize');
}

// Run server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

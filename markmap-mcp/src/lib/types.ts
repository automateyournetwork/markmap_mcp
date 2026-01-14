/**
 * Type definitions for Markmap MCP Server
 *
 * @module lib/types
 */

/**
 * Markmap rendering options
 */
export interface MarkmapOptions {
  /** Level at which to freeze color changes */
  colorFreezeLevel?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Maximum width for node text (0 for unlimited) */
  maxWidth?: number;
  /** Enable zoom interaction */
  zoom?: boolean;
  /** Enable pan interaction */
  pan?: boolean;
  /** Base font size in pixels */
  fontSize?: number;
  /** Spacing between nodes */
  spacing?: number;
  /** Horizontal padding */
  paddingX?: number;
  /** Vertical padding */
  paddingY?: number;
}

/**
 * Represents a node in the mindmap hierarchy
 */
export interface MarkmapNode {
  /** Node content/text */
  content: string;
  /** Node depth/level */
  depth: number;
  /** Child nodes */
  children?: MarkmapNode[];
  /** Additional payload data */
  payload?: any;
}

/**
 * Result of rendering a mindmap
 */
export interface RenderResult {
  /** SVG content as string */
  svg_content: string;
  /** Total number of nodes */
  node_count: number;
  /** Maximum depth of tree */
  depth: number;
  /** Features used during rendering */
  features_used: string[];
}

/**
 * Input for markmap_generate tool
 */
export interface GenerateInput {
  markdown_content: string;
  options?: MarkmapOptions;
}

/**
 * Output for markmap_generate tool
 */
export interface GenerateOutput extends RenderResult {}

/**
 * Outline item for markmap_from_outline tool
 */
export interface OutlineItem {
  text: string;
  level: number;
}

/**
 * Input for markmap_from_outline tool
 */
export interface FromOutlineInput {
  outline_items: OutlineItem[];
  options?: MarkmapOptions;
}

/**
 * Output for markmap_from_outline tool
 */
export interface FromOutlineOutput extends RenderResult {
  markdown_generated: string;
}

/**
 * Input for markmap_render_file tool
 */
export interface RenderFileInput {
  file_path: string;
  options?: MarkmapOptions;
  save_output?: boolean;
  output_path?: string;
}

/**
 * Output for markmap_render_file tool
 */
export interface RenderFileOutput extends RenderResult {
  file_path: string;
  saved_path?: string;
  file_size_kb: number;
}

/**
 * Input for markmap_get_structure tool
 */
export interface GetStructureInput {
  markdown_content: string;
  include_content?: boolean;
}

/**
 * Statistics about document structure
 */
export interface StructureStatistics {
  headings_by_level: Record<number, number>;
  total_characters: number;
  average_node_length: number;
}

/**
 * Output for markmap_get_structure tool
 */
export interface GetStructureOutput {
  hierarchy: MarkmapNode;
  node_count: number;
  max_depth: number;
  features_detected: string[];
  statistics: StructureStatistics;
}

/**
 * Predefined themes
 */
export type MarkmapTheme = 'default' | 'dark' | 'colorful' | 'minimal';

/**
 * Input for markmap_customize tool
 */
export interface CustomizeInput {
  markdown_content: string;
  theme?: MarkmapTheme;
  color_scheme?: string[];
  options?: MarkmapOptions;
}

/**
 * Customization summary
 */
export interface CustomizationSummary {
  theme: string;
  custom_colors: boolean;
  custom_options: string[];
}

/**
 * Output for markmap_customize tool
 */
export interface CustomizeOutput {
  svg_content: string;
  theme_applied: string;
  colors_used: string[];
  node_count: number;
  customization_summary: CustomizationSummary;
}

/**
 * MCP tool error response
 */
export interface ToolError {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
  errorType: 'ParseError' | 'RenderError' | 'ValidationError' | 'FileSystemError';
}

/**
 * MCP tool success response wrapper
 */
export interface ToolResponse<T> {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: T;
}

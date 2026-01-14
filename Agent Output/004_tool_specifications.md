# MCP Tool Specifications

## Date
2026-01-14

## Overview
This document specifies the 5 core MCP tools that will be implemented for the markmap-mcp server.

---

## Tool 1: markmap_generate

### Purpose
Convert Markdown text to interactive mindmap SVG. This is the core tool that most users will interact with.

### MCP Registration
```typescript
{
  name: "markmap_generate",
  description: "Generate an interactive mindmap SVG from Markdown content. Supports custom options for visualization.",
  inputSchema: {
    type: "object",
    properties: {
      markdown_content: {
        type: "string",
        description: "Markdown text to convert to mindmap"
      },
      options: {
        type: "object",
        description: "Optional rendering options",
        properties: {
          colorFreezeLevel: {
            type: "number",
            description: "Freeze colors at this level (default: 6)"
          },
          duration: {
            type: "number",
            description: "Animation duration in ms (default: 500)"
          },
          maxWidth: {
            type: "number",
            description: "Maximum width of node text (default: 0 for unlimited)"
          },
          zoom: {
            type: "boolean",
            description: "Enable zoom interaction (default: true)"
          },
          pan: {
            type: "boolean",
            description: "Enable pan interaction (default: true)"
          }
        }
      }
    },
    required: ["markdown_content"]
  }
}
```

### Input Example
```json
{
  "markdown_content": "# Project\n## Phase 1\n### Task A\n### Task B\n## Phase 2\n### Task C",
  "options": {
    "colorFreezeLevel": 2,
    "zoom": true,
    "pan": true
  }
}
```

### Output Schema
```typescript
{
  svg_content: string,          // Complete SVG markup
  node_count: number,            // Total nodes in mindmap
  depth: number,                 // Maximum depth of tree
  features_used: string[]        // Markmap features detected (e.g., ["heading", "list"])
}
```

### Output Example
```json
{
  "svg_content": "<svg>...</svg>",
  "node_count": 7,
  "depth": 3,
  "features_used": ["heading"]
}
```

### Use Cases
- Quick mindmap generation from any markdown
- Visualize notes, documentation, outlines
- Create visual summaries of text content

---

## Tool 2: markmap_from_outline

### Purpose
Generate mindmap from a structured outline/bullet list. Converts simple lists into markdown format then renders as mindmap.

### MCP Registration
```typescript
{
  name: "markmap_from_outline",
  description: "Generate a mindmap from a hierarchical outline structure. Automatically converts outline to markdown format.",
  inputSchema: {
    type: "object",
    properties: {
      outline_items: {
        type: "array",
        description: "Array of outline items with text and indentation level",
        items: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Text content of the item"
            },
            level: {
              type: "number",
              description: "Indentation/heading level (1-6)",
              minimum: 1,
              maximum: 6
            }
          },
          required: ["text", "level"]
        }
      },
      options: {
        type: "object",
        description: "Optional rendering options (same as markmap_generate)"
      }
    },
    required: ["outline_items"]
  }
}
```

### Input Example
```json
{
  "outline_items": [
    { "text": "Main Topic", "level": 1 },
    { "text": "Subtopic A", "level": 2 },
    { "text": "Detail 1", "level": 3 },
    { "text": "Detail 2", "level": 3 },
    { "text": "Subtopic B", "level": 2 }
  ]
}
```

### Output Schema
```typescript
{
  svg_content: string,           // Complete SVG markup
  markdown_generated: string,    // Intermediate markdown created
  node_count: number,            // Total nodes in mindmap
  depth: number                  // Maximum depth
}
```

### Output Example
```json
{
  "svg_content": "<svg>...</svg>",
  "markdown_generated": "# Main Topic\n## Subtopic A\n### Detail 1\n### Detail 2\n## Subtopic B",
  "node_count": 5,
  "depth": 3
}
```

### Use Cases
- Convert structured bullet points to mindmaps
- Brainstorming sessions
- Meeting notes visualization
- Quick mindmap creation from user prompts

---

## Tool 3: markmap_render_file

### Purpose
Read a Markdown file from disk and generate mindmap. Optionally save the SVG output to a file.

### MCP Registration
```typescript
{
  name: "markmap_render_file",
  description: "Read a Markdown file and generate a mindmap. Can optionally save the SVG output to a file.",
  inputSchema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description: "Path to markdown file to render"
      },
      options: {
        type: "object",
        description: "Optional rendering options"
      },
      save_output: {
        type: "boolean",
        description: "Whether to save SVG to file (default: false)"
      },
      output_path: {
        type: "string",
        description: "Path to save SVG file (required if save_output is true)"
      }
    },
    required: ["file_path"]
  }
}
```

### Input Example
```json
{
  "file_path": "/path/to/document.md",
  "save_output": true,
  "output_path": "/path/to/output.svg",
  "options": {
    "colorFreezeLevel": 3
  }
}
```

### Output Schema
```typescript
{
  svg_content: string,           // Complete SVG markup
  file_path: string,             // Source file path
  saved_path?: string,           // Output file path (if saved)
  node_count: number,            // Total nodes
  file_size_kb: number          // Size of source file
}
```

### Output Example
```json
{
  "svg_content": "<svg>...</svg>",
  "file_path": "/path/to/document.md",
  "saved_path": "/path/to/output.svg",
  "node_count": 42,
  "file_size_kb": 15.3
}
```

### Security Considerations
- Validate file paths to prevent directory traversal
- Limit to project directory or specified allowed paths
- Check file size limits (e.g., max 1MB)
- Validate file extension (.md, .markdown)

### Use Cases
- Batch process markdown documentation
- Generate mindmap visualizations of existing files
- Create SVG exports for inclusion in other documents
- Automated documentation visualization

---

## Tool 4: markmap_get_structure

### Purpose
Extract and analyze the hierarchical structure of markdown without rendering. Useful for understanding document organization and complexity.

### MCP Registration
```typescript
{
  name: "markmap_get_structure",
  description: "Extract the hierarchical structure from Markdown content without rendering. Returns tree structure and metadata.",
  inputSchema: {
    type: "object",
    properties: {
      markdown_content: {
        type: "string",
        description: "Markdown text to analyze"
      },
      include_content: {
        type: "boolean",
        description: "Include full text content in nodes (default: true)"
      }
    },
    required: ["markdown_content"]
  }
}
```

### Input Example
```json
{
  "markdown_content": "# Root\n## Branch 1\n### Leaf 1\n### Leaf 2\n## Branch 2",
  "include_content": true
}
```

### Output Schema
```typescript
{
  hierarchy: {
    content: string,
    depth: number,
    children?: Array<hierarchy>  // Recursive structure
  },
  node_count: number,            // Total nodes
  max_depth: number,             // Maximum nesting level
  features_detected: string[],   // Markmap features found
  statistics: {
    headings_by_level: {         // Count of headings at each level
      "1": number,
      "2": number,
      // ...
    },
    total_characters: number,
    average_node_length: number
  }
}
```

### Output Example
```json
{
  "hierarchy": {
    "content": "Root",
    "depth": 1,
    "children": [
      {
        "content": "Branch 1",
        "depth": 2,
        "children": [
          { "content": "Leaf 1", "depth": 3 },
          { "content": "Leaf 2", "depth": 3 }
        ]
      },
      {
        "content": "Branch 2",
        "depth": 2
      }
    ]
  },
  "node_count": 5,
  "max_depth": 3,
  "features_detected": ["heading"],
  "statistics": {
    "headings_by_level": {
      "1": 1,
      "2": 2,
      "3": 2
    },
    "total_characters": 45,
    "average_node_length": 9
  }
}
```

### Use Cases
- Analyze document structure before rendering
- Validate markdown hierarchy
- Preview complexity of resulting mindmap
- Extract table of contents
- Document analysis and metrics

---

## Tool 5: markmap_customize

### Purpose
Generate mindmap with custom themes, colors, and advanced styling options. Provides fine-grained control over visualization appearance.

### MCP Registration
```typescript
{
  name: "markmap_customize",
  description: "Generate a mindmap with custom styling, themes, and color schemes. Provides advanced customization options.",
  inputSchema: {
    type: "object",
    properties: {
      markdown_content: {
        type: "string",
        description: "Markdown text to convert to mindmap"
      },
      theme: {
        type: "string",
        enum: ["default", "dark", "colorful", "minimal"],
        description: "Predefined theme to apply"
      },
      color_scheme: {
        type: "array",
        items: { type: "string" },
        description: "Array of hex color codes for node coloring"
      },
      options: {
        type: "object",
        description: "Advanced customization options",
        properties: {
          colorFreezeLevel: {
            type: "number",
            description: "Level at which to freeze color changes"
          },
          duration: {
            type: "number",
            description: "Animation duration in milliseconds"
          },
          maxWidth: {
            type: "number",
            description: "Maximum width for node text"
          },
          fontSize: {
            type: "number",
            description: "Base font size in pixels"
          },
          spacing: {
            type: "number",
            description: "Spacing between nodes"
          },
          paddingX: {
            type: "number",
            description: "Horizontal padding"
          },
          paddingY: {
            type: "number",
            description: "Vertical padding"
          }
        }
      }
    },
    required: ["markdown_content"]
  }
}
```

### Input Example
```json
{
  "markdown_content": "# Project\n## Design\n## Development\n## Testing",
  "theme": "dark",
  "color_scheme": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
  "options": {
    "colorFreezeLevel": 2,
    "fontSize": 16,
    "spacing": 20
  }
}
```

### Output Schema
```typescript
{
  svg_content: string,           // Complete customized SVG
  theme_applied: string,         // Theme name used
  colors_used: string[],         // Actual colors applied
  node_count: number,            // Total nodes
  customization_summary: {       // Summary of applied customizations
    theme: string,
    custom_colors: boolean,
    custom_options: string[]     // List of custom options applied
  }
}
```

### Output Example
```json
{
  "svg_content": "<svg>...</svg>",
  "theme_applied": "dark",
  "colors_used": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
  "node_count": 4,
  "customization_summary": {
    "theme": "dark",
    "custom_colors": true,
    "custom_options": ["fontSize", "spacing", "colorFreezeLevel"]
  }
}
```

### Predefined Themes

#### Default Theme
- Standard markmap colors
- Light background
- Balanced spacing

#### Dark Theme
- Dark background colors
- High contrast text
- Muted accent colors

#### Colorful Theme
- Vibrant, saturated colors
- High visual impact
- Maximum color variation

#### Minimal Theme
- Grayscale palette
- Reduced visual noise
- Clean, professional look

### Use Cases
- Create branded mindmaps with company colors
- Match mindmap style to presentation themes
- Generate high-contrast maps for accessibility
- Create visually distinct mindmaps for different purposes

---

## Common Patterns Across All Tools

### Error Response Format
```typescript
{
  content: [{
    type: 'text',
    text: 'Error: <detailed error message>'
  }],
  isError: true,
  errorType: 'ParseError' | 'RenderError' | 'ValidationError' | 'FileSystemError'
}
```

### Success Response Format
```typescript
{
  content: [{
    type: 'text',
    text: '<human-readable summary>'
  }],
  structuredContent: {
    // Tool-specific output schema
  }
}
```

### Input Validation
All tools validate:
- Required fields present
- Type correctness
- Value constraints (min/max, enums)
- String length limits
- Array size limits

### Size Limits
- Maximum markdown input: 1 MB
- Maximum file size (render_file): 5 MB
- Maximum node count: 10,000 nodes
- Maximum depth: 20 levels

### Timeouts
- Parsing timeout: 5 seconds
- Rendering timeout: 10 seconds
- File operations timeout: 30 seconds

---

## Tool Usage Examples for Claude Code

### Example 1: Quick Mindmap
**User:** "Create a mindmap of the software development lifecycle"

**Claude uses:** `markmap_from_outline`
```json
{
  "outline_items": [
    { "text": "Software Development Lifecycle", "level": 1 },
    { "text": "Planning", "level": 2 },
    { "text": "Requirements", "level": 3 },
    { "text": "Analysis", "level": 3 },
    { "text": "Design", "level": 2 },
    { "text": "Implementation", "level": 2 },
    { "text": "Testing", "level": 2 },
    { "text": "Deployment", "level": 2 },
    { "text": "Maintenance", "level": 2 }
  ]
}
```

### Example 2: File Visualization
**User:** "Show me a mindmap of README.md"

**Claude uses:** `markmap_render_file`
```json
{
  "file_path": "./README.md",
  "save_output": false
}
```

### Example 3: Custom Styled Map
**User:** "Create a dark-themed mindmap about AI technologies"

**Claude uses:** `markmap_customize`
```json
{
  "markdown_content": "# AI Technologies\n## Machine Learning\n### Supervised\n### Unsupervised\n## Deep Learning\n### CNNs\n### RNNs\n## NLP",
  "theme": "dark"
}
```

### Example 4: Structure Analysis
**User:** "How complex is the structure of this document?"

**Claude uses:** `markmap_get_structure`
```json
{
  "markdown_content": "<document content>",
  "include_content": false
}
```

### Example 5: Standard Mindmap
**User:** "Make a mindmap from this markdown"

**Claude uses:** `markmap_generate`
```json
{
  "markdown_content": "<user's markdown>"
}
```

---

## Implementation Priority

1. **markmap_generate** (Phase 4.1) - Core functionality
2. **markmap_from_outline** (Phase 4.2) - User-friendly interface
3. **markmap_get_structure** (Phase 4.3) - Utility function
4. **markmap_render_file** (Phase 4.4) - File operations
5. **markmap_customize** (Phase 4.5) - Advanced features

Each tool will be implemented on a separate GAIT branch, tested, and merged sequentially.

---

## Testing Requirements

Each tool must have:
- ✓ Unit tests with valid inputs
- ✓ Unit tests with invalid inputs
- ✓ Edge case tests (empty input, very large input)
- ✓ Integration test with MCP server
- ✓ Example usage documented
- ✓ Error handling verified

---

## Summary

These 5 tools provide a comprehensive interface for mindmap generation via MCP:
- **Generate**: Core conversion tool
- **From Outline**: User-friendly creation
- **Render File**: File-based workflows
- **Get Structure**: Analysis and preview
- **Customize**: Advanced styling

Together they enable seamless mindmap creation from Claude Code prompts across various use cases and workflows.

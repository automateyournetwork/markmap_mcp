# Integration Design: Markmap + MCP

## Date
2026-01-14

## Architecture Overview

### High-Level Data Flow
```
Claude Code User
      ↓
  MCP Client (Claude)
      ↓
  MCP Protocol
      ↓
Markmap MCP Server
      ↓
  Tool Router
      ↓
Markmap Handler (markmap-lib + rendering)
      ↓
  SVG Output
      ↓
  MCP Response
      ↓
  Claude Code User
```

## Component Architecture

### Layer 1: MCP Server (Entry Point)
**File**: `src/index.ts`

**Responsibilities:**
- Initialize MCP server
- Register all tools with schemas
- Route incoming requests to appropriate handlers
- Handle server lifecycle (start/stop)
- Error handling and logging

**Key Operations:**
```typescript
const server = new McpServer({ name: 'markmap-mcp', version: '1.0.0' });

// Register 5 tools
server.registerTool('markmap_generate', ...)
server.registerTool('markmap_from_outline', ...)
server.registerTool('markmap_render_file', ...)
server.registerTool('markmap_get_structure', ...)
server.registerTool('markmap_customize', ...)

// Start server
server.start(transport);
```

### Layer 2: Tool Implementations
**Directory**: `src/tools/`

**Files:**
- `generate.ts` - Core markdown to mindmap conversion
- `fromOutline.ts` - Outline to mindmap conversion
- `renderFile.ts` - File-based mindmap generation
- `getStructure.ts` - Extract hierarchical structure
- `customize.ts` - Apply styling and customization

**Pattern:**
```typescript
export async function toolHandler(input: InputType): Promise<OutputType> {
  // Validate input
  // Call MarkmapHandler methods
  // Format output
  // Return MCP-compliant response
}
```

### Layer 3: Markmap Integration Layer
**File**: `src/lib/markmap-handler.ts`

**Class**: `MarkmapHandler`

**Responsibilities:**
- Wrap markmap-lib Transformer
- Handle SVG generation (Node.js compatible)
- Manage options and customization
- Error handling for markmap operations

**Key Methods:**
```typescript
class MarkmapHandler {
  parseMarkdown(content: string): { root, features }
  renderToSVG(content: string, options?): string
  getHierarchy(content: string): HierarchicalStructure
  applyCustomization(content: string, theme, options): string
}
```

### Layer 4: Type Definitions
**File**: `src/lib/types.ts`

**Definitions:**
- `MarkmapOptions`: Rendering configuration
- `MarkmapNode`: Tree node structure
- `RenderResult`: SVG output with metadata
- `ToolInput/ToolOutput`: Type-safe tool interfaces

### Layer 5: Utility Functions
**Directory**: `src/utils/`

**Files:**
- `markdown-parser.ts`: Markdown processing utilities
- `svg-generator.ts`: SVG manipulation helpers
- `validation.ts`: Input validation functions

## SVG Generation Strategy

### Challenge
markmap-view is designed for browser environments (requires DOM, D3).

### Solution: Hybrid Approach

#### Option A: JSDOM (Recommended)
```typescript
import { JSDOM } from 'jsdom';
import { Markmap } from 'markmap-view';

const dom = new JSDOM('<!DOCTYPE html><html><body><svg id="markmap"></svg></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Now markmap-view can work
const svg = document.getElementById('markmap');
Markmap.create(svg, options, root);
const svgString = svg.outerHTML;
```

**Pros:**
- Works with markmap-view as-is
- Full feature support
- Maintained and stable

**Cons:**
- Adds JSDOM dependency
- Slightly heavier

#### Option B: Puppeteer/Playwright
```typescript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
// Load markmap libraries
// Generate SVG in real browser context
const svg = await page.evaluate(...)
```

**Pros:**
- Real browser rendering
- Perfect compatibility

**Cons:**
- Heavier (requires browser)
- Slower startup
- More complex deployment

#### Option C: markmap-cli Investigation
Check if `markmap-cli` can be used programmatically:
```typescript
import { renderMarkmap } from 'markmap-cli';
```

**Decision: Use JSDOM (Option A)**
- Good balance of compatibility and performance
- Lighter than Puppeteer
- Works well in Node.js
- Simpler deployment

## Tool Specifications

### 1. markmap_generate

**Purpose:** Convert Markdown text to interactive mindmap SVG

**Input Schema:**
```typescript
{
  markdown_content: z.string().min(1),
  options: z.object({
    colorFreezeLevel: z.number().optional(),
    duration: z.number().optional(),
    maxWidth: z.number().optional(),
    zoom: z.boolean().optional(),
    pan: z.boolean().optional()
  }).optional()
}
```

**Output Schema:**
```typescript
{
  svg_content: z.string(),
  node_count: z.number(),
  depth: z.number(),
  features_used: z.array(z.string())
}
```

**Implementation Flow:**
```
Input Markdown
  ↓
MarkmapHandler.parseMarkdown()
  ↓
MarkmapHandler.renderToSVG(options)
  ↓
Return SVG + metadata
```

### 2. markmap_from_outline

**Purpose:** Generate mindmap from bullet outline

**Input Schema:**
```typescript
{
  outline_items: z.array(z.object({
    text: z.string(),
    level: z.number().min(1) // indentation level
  })),
  options: z.object({...}).optional()
}
```

**Output Schema:**
```typescript
{
  svg_content: z.string(),
  markdown_generated: z.string(), // intermediate markdown
  node_count: z.number()
}
```

**Implementation Flow:**
```
Outline items
  ↓
Convert to Markdown format
  ↓
Call markmap_generate
  ↓
Return SVG + generated markdown
```

**Markdown Conversion:**
```typescript
function outlineToMarkdown(items: OutlineItem[]): string {
  return items.map(item => {
    const prefix = '#'.repeat(item.level);
    return `${prefix} ${item.text}`;
  }).join('\n\n');
}
```

### 3. markmap_render_file

**Purpose:** Read Markdown file and create mindmap

**Input Schema:**
```typescript
{
  file_path: z.string(),
  options: z.object({...}).optional(),
  save_output: z.boolean().optional(),
  output_path: z.string().optional()
}
```

**Output Schema:**
```typescript
{
  svg_content: z.string(),
  file_path: z.string(),
  saved_path: z.string().optional(),
  node_count: z.number()
}
```

**Implementation Flow:**
```
Read file (fs.readFile)
  ↓
Validate Markdown
  ↓
Call markmap_generate
  ↓
Optionally save SVG to file
  ↓
Return SVG + paths
```

### 4. markmap_get_structure

**Purpose:** Extract hierarchical structure without rendering

**Input Schema:**
```typescript
{
  markdown_content: z.string().min(1)
}
```

**Output Schema:**
```typescript
{
  hierarchy: z.object({
    // Recursive structure
    content: z.string(),
    children: z.array(z.lazy(() => hierarchySchema)).optional(),
    depth: z.number()
  }),
  node_count: z.number(),
  max_depth: z.number(),
  features_detected: z.array(z.string())
}
```

**Implementation Flow:**
```
Input Markdown
  ↓
MarkmapHandler.parseMarkdown()
  ↓
Extract root structure
  ↓
Calculate metadata
  ↓
Return hierarchy JSON
```

**Use Case:** Understand document structure before rendering, validate content complexity.

### 5. markmap_customize

**Purpose:** Apply styling and customization to mindmap

**Input Schema:**
```typescript
{
  markdown_content: z.string().min(1),
  theme: z.enum(['default', 'dark', 'colorful', 'minimal']).optional(),
  color_scheme: z.array(z.string()).optional(), // hex colors
  options: z.object({
    colorFreezeLevel: z.number(),
    duration: z.number(),
    maxWidth: z.number(),
    fontSize: z.number(),
    spacing: z.number()
  }).optional()
}
```

**Output Schema:**
```typescript
{
  svg_content: z.string(),
  theme_applied: z.string(),
  colors_used: z.array(z.string())
}
```

**Implementation Flow:**
```
Input Markdown + theme/options
  ↓
Build custom options object
  ↓
Apply color scheme
  ↓
MarkmapHandler.applyCustomization()
  ↓
Return customized SVG
```

## Integration Points

### MCP Server → Tools
```typescript
// In src/index.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'markmap_generate':
      return await generateTool(args);
    case 'markmap_from_outline':
      return await fromOutlineTool(args);
    case 'markmap_render_file':
      return await renderFileTool(args);
    case 'markmap_get_structure':
      return await getStructureTool(args);
    case 'markmap_customize':
      return await customizeTool(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

### Tools → MarkmapHandler
```typescript
// In src/tools/generate.ts
import { MarkmapHandler } from '../lib/markmap-handler';

export async function generateTool(input: GenerateInput): Promise<GenerateOutput> {
  const handler = new MarkmapHandler();
  const svg = await handler.renderToSVG(input.markdown_content, input.options);
  const { root } = handler.parseMarkdown(input.markdown_content);

  return {
    content: [{
      type: 'text',
      text: `Generated mindmap with ${countNodes(root)} nodes`
    }],
    structuredContent: {
      svg_content: svg,
      node_count: countNodes(root),
      depth: calculateDepth(root),
      features_used: Object.keys(features)
    }
  };
}
```

### MarkmapHandler → markmap libraries
```typescript
// In src/lib/markmap-handler.ts
import { Transformer } from 'markmap-lib';
import { JSDOM } from 'jsdom';
import { Markmap, loadCSS, loadJS } from 'markmap-view';

export class MarkmapHandler {
  private transformer: Transformer;

  constructor() {
    this.transformer = new Transformer();
  }

  parseMarkdown(content: string) {
    return this.transformer.transform(content);
  }

  async renderToSVG(content: string, options = {}): Promise<string> {
    const { root, features } = this.parseMarkdown(content);

    // Setup JSDOM
    const dom = new JSDOM('<!DOCTYPE html><html><body><svg id="markmap"></svg></body></html>');
    global.document = dom.window.document;

    // Load assets
    const assets = this.transformer.getUsedAssets(features);
    if (assets.styles) loadCSS(assets.styles);
    if (assets.scripts) loadJS(assets.scripts);

    // Render
    const svg = document.getElementById('markmap');
    Markmap.create(svg, options, root);

    return svg.outerHTML;
  }
}
```

## Error Handling Strategy

### Levels of Error Handling

1. **Input Validation** (Zod schemas)
   - Catch invalid inputs before processing
   - Return clear validation errors

2. **Markdown Parsing Errors**
   ```typescript
   try {
     const { root, features } = transformer.transform(markdown);
   } catch (error) {
     return {
       content: [{ type: 'text', text: `Parse error: ${error.message}` }],
       isError: true
     };
   }
   ```

3. **Rendering Errors**
   ```typescript
   try {
     const svg = await handler.renderToSVG(content, options);
   } catch (error) {
     return {
       content: [{ type: 'text', text: `Render error: ${error.message}` }],
       isError: true
     };
   }
   ```

4. **File System Errors** (for render_file tool)
   ```typescript
   try {
     const content = await fs.readFile(filePath, 'utf-8');
   } catch (error) {
     return {
       content: [{ type: 'text', text: `File error: ${error.message}` }],
       isError: true
     };
   }
   ```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Initialize JSDOM only when needed
   - Cache transformer instances

2. **Streaming for Large Files**
   - Set reasonable size limits
   - Stream large markdown files

3. **Async Operations**
   - All tool handlers are async
   - Non-blocking I/O for file operations

4. **Resource Cleanup**
   - Clean up JSDOM instances after use
   - Prevent memory leaks

## Security Considerations

### Input Sanitization
- Validate all markdown input
- Limit file path access (render_file)
- Prevent path traversal attacks

### Resource Limits
- Maximum markdown size (e.g., 1MB)
- Maximum node count (prevent DoS)
- Timeout for long-running operations

### File System Access
```typescript
import path from 'path';

function validateFilePath(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  const allowed = path.resolve(process.cwd());
  return resolved.startsWith(allowed);
}
```

## Deployment Architecture

### Local Development
```
stdio transport
Claude Code → MCP Server (local process)
```

### Remote Deployment
```
Streamable HTTP transport
Claude Code → Network → MCP Server (container/VM)
```

### Configuration
```json
{
  "mcpServers": {
    "markmap": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Testing Strategy

### Unit Tests
- Test each tool handler independently
- Mock MarkmapHandler
- Verify input/output schemas

### Integration Tests
- Test full MCP server with tools
- Test MarkmapHandler with real markmap libraries
- Verify SVG output validity

### End-to-End Tests
- Test with MCP client
- Test with Claude Code (if possible)
- Test all tools with various inputs

## Summary

This design bridges markmap's browser-oriented architecture with MCP's server-side protocol through:
1. **JSDOM** for Node.js SVG generation
2. **Clean layering** separating MCP, tools, and markmap
3. **Type-safe interfaces** using TypeScript and Zod
4. **Comprehensive error handling** at all levels
5. **Security-conscious** file and input handling

Next steps: Implement project scaffolding and begin building these components.

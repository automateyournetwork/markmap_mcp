# Markmap API Analysis

## Date
2026-01-14

## Overview
Markmap is a tool that visualizes Markdown as interactive mindmaps. It consists of two primary libraries:
- **markmap-lib**: Transforms Markdown to hierarchical data structures
- **markmap-view**: Renders the data as interactive SVG mindmaps

## markmap-lib API

### Purpose
Transform Markdown content into hierarchical node structures that can be rendered as mindmaps.

### Installation
```bash
npm install markmap-lib
```

### Core Class: Transformer

#### Initialization
```typescript
import { Transformer, builtInPlugins } from 'markmap-lib';

// With default plugins
const transformer = new Transformer();

// With custom plugins
const transformer = new Transformer([...builtInPlugins, myPlugin]);

// Without built-in plugins (v0.16.0+)
import { Transformer } from 'markmap-lib/no-plugins';
import { pluginFrontmatter } from 'markmap-lib/plugins';
const transformer = new Transformer([pluginFrontmatter]);
```

#### Primary Method: transform(markdown)
Parses Markdown content and returns:
```typescript
const { root, features } = transformer.transform(markdown);
```

**Returns:**
- `root`: Hierarchical node tree structure
- `features`: Object indicating which features were used during parsing

#### Asset Methods
- `getUsedAssets(features)`: Returns only assets required by used features
- `getAssets()`: Returns all possible assets

### Node Structure
The `root` object contains a hierarchical tree representing the Markdown structure:
- Each heading level becomes a node
- Nested content creates child nodes
- Supports metadata and styling

## markmap-view API

### Purpose
Render markmap from transformed data as interactive SVG visualizations.

### Installation
```bash
npm install markmap-view
```

### Dependencies
- Requires D3.js for visualization
- Can be loaded via CDN or npm

### Core Class: Markmap

#### Creation Method
```typescript
import { Markmap, loadCSS, loadJS } from 'markmap-view';

// Create markmap instance
Markmap.create(selector|element, options, root);
```

**Parameters:**
- `selector|element`: CSS selector string or DOM element
- `options`: Configuration object
- `root`: Hierarchical data from markmap-lib

**Returns:** Markmap instance for visualization control

#### Asset Loading Functions
```typescript
// Load CSS dependencies
loadCSS(styles);

// Load JS dependencies
loadJS(scripts, {
  getMarkmap: () => markmap
});
```

### HTML Structure Required
```html
<svg id="markmap" style="width: 800px; height: 800px"></svg>
```

### Options

#### Low-Level Options (IMarkmapOptions)
- Contains function objects
- Non-serializable
- Passed directly to `Markmap.create()` or via `mm.setOptions()`

#### JSON Options (Recommended)
- Serializable subset for portability
- Convert using: `deriveOptions(jsonOptions)`

### Import Patterns

**Browser (Script Tag):**
```javascript
const { Markmap, loadCSS, loadJS } = markmap;
```

**ES Module:**
```javascript
import { Markmap, loadCSS, loadJS } from 'markmap-view';
```

## Programmatic Usage Pattern for Node.js

For an MCP server running in Node.js, we need to:

1. **Transform Markdown to Data**
   ```typescript
   import { Transformer } from 'markmap-lib';
   const transformer = new Transformer();
   const { root, features } = transformer.transform(markdownContent);
   ```

2. **Generate SVG Output**
   - Challenge: markmap-view is designed for browser environments
   - Solution options:
     a. Use JSDOM to create a virtual DOM environment
     b. Use a headless browser (Puppeteer/Playwright)
     c. Directly manipulate the data structure and generate SVG
     d. Use markmap-render if available

3. **Asset Management**
   ```typescript
   const assets = transformer.getUsedAssets(features);
   // Handle CSS and JS dependencies
   ```

## Key Considerations for MCP Integration

### Strengths
- Clean separation between parsing (markmap-lib) and rendering (markmap-view)
- TypeScript support (96.7% TypeScript codebase)
- Built-in plugin system for extensibility
- Active maintenance and development

### Challenges
- markmap-view is browser-centric (uses D3 and DOM)
- Need to handle SVG generation in Node.js environment
- Asset management (CSS/JS) in non-browser context

### Recommended Approach
1. Use markmap-lib for Markdown transformation (works great in Node.js)
2. For SVG generation:
   - Option A: Use JSDOM + markmap-view (simulate browser)
   - Option B: Use Puppeteer for actual rendering
   - Option C: Investigate markmap-render package
   - Option D: Build custom SVG generator from root data

## Data Flow
```
Markdown Input
    ↓
markmap-lib (Transformer)
    ↓
{ root, features } (hierarchical data)
    ↓
markmap-view (Markmap.create) OR custom renderer
    ↓
Interactive SVG Output
```

## Version Information
- Latest markmap-lib: 0.18.12 (as of research date)
- Latest markmap-view: 0.18.12 (as of research date)
- Both packages actively maintained

## References
- Website: https://markmap.js.org/
- GitHub: https://github.com/markmap/markmap
- Docs: https://markmap.js.org/docs
- NPM markmap-lib: https://www.npmjs.com/package/markmap-lib
- NPM markmap-view: https://www.npmjs.com/package/markmap-view

## Sources
- [markmap-lib - npm](https://www.npmjs.com/package/markmap-lib)
- [markmap-view - npm](https://www.npmjs.com/package/markmap-view)
- [markmap-lib - markmap docs](https://markmap.js.org/docs/packages--markmap-lib)
- [markmap-view - markmap docs](https://markmap.js.org/docs/packages--markmap-view)
- [GitHub - markmap/markmap](https://github.com/markmap/markmap)

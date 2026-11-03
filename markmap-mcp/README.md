# Markmap MCP Server

> **Model Context Protocol server for [markmap.js.org](https://markmap.js.org/) integration**

Generate interactive mindmaps from Markdown via Claude Code using the Model Context Protocol.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Features

- 🎯 **5 Core Tools** for comprehensive mindmap generation
- 🔌 **Seamless Integration** with Claude Code via MCP
- 🚀 **Dynamic Generation** from natural language prompts
- 📊 **SVG Output** for high-quality visualizations
- 🎨 **4 Predefined Themes** (default, dark, colorful, minimal)
- 🔒 **Type-Safe** TypeScript implementation
- 🛡️ **Security-Conscious** with path validation and limits

---

## 📦 Quick Start

### Installation

```bash
# Global installation
npm install -g markmap-mcp

# Or using yarn
yarn global add markmap-mcp
```

### Claude Code Configuration

#### Option 1: Global Installation

If you installed globally with `npm install -g markmap-mcp`, add to your `.clauderc`:

```json
{
  "mcpServers": {
    "markmap": {
      "command": "markmap-mcp"
    }
  }
}
```

#### Option 2: Local Development

If you're developing locally or haven't installed globally, use the full path to the built file:

```json
{
  "mcpServers": {
    "markmap": {
      "command": "node",
      "args": [
        "/absolute/path/to/markmap-mcp/dist/index.js"
      ]
    }
  }
}
```

Replace `/absolute/path/to/markmap-mcp/dist/index.js` with the actual path to your local installation.

**After updating your configuration, restart Claude Code to pick up the changes.**

### First Mindmap

In Claude Code, try:
```
"Create a mindmap about machine learning topics"
```

---

## 🛠️ Available Tools

### 1. `markmap_generate`

Convert Markdown text to a mindmap SVG.

The SVG is rendered statically under Node (no browser): a laid-out, self-contained
image. `duration`, `zoom` and `pan` are accepted for compatibility and have no effect.

**Input:**
```typescript
{
  markdown_content: string;  // Markdown to convert
  options?: {
    colorFreezeLevel?: number;
    duration?: number;
    maxWidth?: number;
    zoom?: boolean;
    pan?: boolean;
  }
}
```

**Output:**
```typescript
{
  svg_content: string;       // SVG markup
  node_count: number;        // Total nodes
  depth: number;             // Tree depth
  features_used: string[];   // Markmap features
}
```

**Example:**
```
User: "Generate a mindmap from this markdown: # AI\n## ML\n## NLP"
```

---

### 2. `markmap_from_outline`

Generate mindmap from hierarchical outline structure.

**Input:**
```typescript
{
  outline_items: Array<{
    text: string;
    level: number;  // 1-6
  }>;
  options?: MarkmapOptions;
}
```

**Output:**
```typescript
{
  svg_content: string;
  markdown_generated: string;  // Intermediate markdown
  node_count: number;
  depth: number;
}
```

**Example:**
```
User: "Create a mindmap showing the software development lifecycle"
```

---

### 3. `markmap_render_file`

Read a Markdown file and generate mindmap.

**Input:**
```typescript
{
  file_path: string;          // Path to .md file
  options?: MarkmapOptions;
  save_output?: boolean;      // Save SVG to file
  output_path?: string;       // Where to save
}
```

**Output:**
```typescript
{
  svg_content: string;
  file_path: string;
  saved_path?: string;
  node_count: number;
  file_size_kb: number;
}
```

**Example:**
```
User: "Show me a mindmap of README.md"
```

---

### 4. `markmap_get_structure`

Extract and analyze hierarchical structure without rendering.

**Input:**
```typescript
{
  markdown_content: string;
  include_content?: boolean;  // Include full text
}
```

**Output:**
```typescript
{
  hierarchy: MarkmapNode;     // Tree structure
  node_count: number;
  max_depth: number;
  features_detected: string[];
  statistics: {
    headings_by_level: Record<number, number>;
    total_characters: number;
    average_node_length: number;
  }
}
```

**Example:**
```
User: "Analyze the structure of this document without rendering"
```

---

### 5. `markmap_customize`

Generate mindmap with custom themes and styling.

**Input:**
```typescript
{
  markdown_content: string;
  theme?: 'default' | 'dark' | 'colorful' | 'minimal';
  color_scheme?: string[];    // Hex colors
  options?: MarkmapOptions;
}
```

**Output:**
```typescript
{
  svg_content: string;
  theme_applied: string;
  colors_used: string[];
  node_count: number;
  customization_summary: object;
}
```

**Example:**
```
User: "Create a dark-themed mindmap about AI technologies"
```

---

## 🎨 Themes

### Default Theme
- Standard colors and spacing
- Good general-purpose theme
- ColorFreezeLevel: 6

### Dark Theme
- Dark background compatible
- High contrast for presentations
- ColorFreezeLevel: 4

### Colorful Theme
- Vibrant, engaging colors
- Great for creative work
- ColorFreezeLevel: 2 (more variation)

### Minimal Theme
- Grayscale palette
- Professional, clean look
- ColorFreezeLevel: 8 (less variation)

---

## 📚 Documentation

- [Installation Guide](./INSTALL.md) - Setup and configuration
- [Usage Examples](./examples/usage-examples.md) - Real-world scenarios
- [Sample Prompts](./examples/sample-prompts.md) - Example prompts for Claude
- [API Reference](#available-tools) - Tool specifications above

---

## 🔧 Development

### Setup

```bash
# Clone repository
git clone https://github.com/automateyournetwork/markmap-mcp.git
cd markmap-mcp

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

### Project Structure

```
markmap-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/                # Tool implementations
│   │   ├── generate.ts
│   │   ├── fromOutline.ts
│   │   ├── renderFile.ts
│   │   ├── getStructure.ts
│   │   └── customize.ts
│   ├── lib/
│   │   ├── markmap-handler.ts  # Core markmap integration
│   │   └── types.ts            # TypeScript definitions
│   └── utils/
│       └── markdown-parser.ts  # Utility functions
├── tests/                    # Test suite
├── examples/                 # Usage examples
└── dist/                     # Compiled JavaScript
```

### Scripts

```bash
npm run build         # Compile TypeScript
npm run dev           # Watch mode
npm run test          # Run tests
npm run test:coverage # Test with coverage
npm run lint          # Lint code
npm run clean         # Remove build artifacts
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- generate.test.ts
```

---

## 🔒 Security

### Limits & Validation

- **File Size**: Maximum 5MB for file operations
- **Content Size**: Maximum 1MB for markdown content
- **Node Count**: Maximum 10,000 nodes per mindmap
- **Depth**: Maximum 20 levels deep
- **Path Validation**: Prevents directory traversal attacks
- **File Extensions**: Only .md and .markdown allowed

### Security Features

- ✅ Path traversal protection
- ✅ File extension validation
- ✅ Size limits enforced
- ✅ Input sanitization
- ✅ Error message safety

---

## 🐛 Troubleshooting

### Server doesn't start
```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Verify installation
which markmap-mcp

# Run directly
node dist/index.js
```

### Tools not appearing in Claude
1. Check `.clauderc` configuration format
2. For local development, ensure you're using the full path with `node` command and `args`
3. Verify the built file exists at `dist/index.js` (run `npm run build` if missing)
4. Restart Claude Code after configuration changes
5. Check Claude Code logs for MCP server connection errors

### SVG generation fails
```bash
# Check dependencies
npm list markmap-lib markmap-view jsdom

# Reinstall if needed
npm install
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🔗 Links

- **Markmap**: https://markmap.js.org/
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **GitHub**: https://github.com/automateyournetwork/markmap-mcp
- **Issues**: https://github.com/automateyournetwork/markmap-mcp/issues
- **NPM**: https://www.npmjs.com/package/markmap-mcp

---

## 🙏 Acknowledgments

- [Markmap](https://markmap.js.org/) by gera2ld for the excellent visualization library
- [Anthropic](https://www.anthropic.com/) for the Model Context Protocol
- [Claude Code](https://claude.ai/code) for AI-powered development

---

## 📊 Status

**Current Version**: 1.0.0
**Status**: ✅ Production Ready

### Features

- ✅ All 5 core tools implemented
- ✅ MCP server functional
- ✅ Static SVG rendering under Node.js (no browser or DOM required)
- ✅ TypeScript type safety
- ✅ Comprehensive error handling
- ✅ Security validations
- ✅ Theme system
- ✅ Documentation complete

---

## 💬 Support

For questions, issues, or feature requests:

- **GitHub Issues**: https://github.com/automateyournetwork/markmap-mcp/issues
- **Discussions**: https://github.com/automateyournetwork/markmap-mcp/discussions

---

Made with ❤️ by AutomateYourNetwork

**Built with**: TypeScript, Node.js, Markmap, MCP SDK

# Installation Guide - Markmap MCP Server

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Claude Code CLI (if using with Claude)

## Installation Methods

### Method 1: Global Installation

```bash
# Install globally
npm install -g markmap-mcp

# Or using yarn
yarn global add markmap-mcp
```

### Method 2: Local Development

```bash
# Clone the repository
git clone https://github.com/automateyournetwork/markmap-mcp.git
cd markmap-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

## Claude Code Configuration

### Option 1: Global MCP Server

Add to your Claude Code configuration file (`.clauderc` in your home directory or project):

```json
{
  "mcpServers": {
    "markmap": {
      "command": "markmap-mcp"
    }
  }
}
```

### Option 2: Local Node.js Process

```json
{
  "mcpServers": {
    "markmap": {
      "command": "node",
      "args": ["/path/to/markmap-mcp/dist/index.js"]
    }
  }
}
```

### Option 3: Development Mode

For local development with auto-rebuild:

```json
{
  "mcpServers": {
    "markmap": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/markmap-mcp",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Verification

After installation, verify the server is working:

```bash
# Start the server directly
node dist/index.js

# You should see:
# Starting Markmap MCP Server...
# Markmap MCP Server running on stdio
# Server name: markmap-mcp v1.0.0
# Tools available: 5
```

## Testing with Claude Code

Once configured, test the tools in Claude Code:

1. **Test markmap_generate:**
   ```
   User: "Create a mindmap from this markdown: # Project\n## Phase 1\n## Phase 2"
   ```

2. **Test markmap_from_outline:**
   ```
   User: "Make a mindmap about software development lifecycle"
   ```

3. **Test markmap_get_structure:**
   ```
   User: "Analyze the structure of this document without rendering"
   ```

## Troubleshooting

### Server doesn't start
- Check Node.js version: `node --version` (should be >= 18.0.0)
- Verify build completed: `ls dist/index.js`
- Check for errors: Run `node dist/index.js` directly

### Tools not appearing in Claude
- Verify `.clauderc` configuration
- Restart Claude Code after configuration changes
- Check Claude Code logs for MCP connection errors

### SVG generation fails
- Ensure all dependencies installed: `npm install`
- Check JSDOM is available: `npm list jsdom`
- Verify markmap libraries: `npm list markmap-lib markmap-view`

### File operations fail
- Check file permissions
- Verify paths are within allowed directory
- File must have .md or .markdown extension

## Updating

### Global Installation
```bash
npm update -g markmap-mcp
```

### Local Development
```bash
cd markmap-mcp
git pull
npm install
npm run build
```

## Uninstallation

### Global
```bash
npm uninstall -g markmap-mcp
```

### Local
```bash
cd markmap-mcp
npm unlink
```

## Next Steps

- Read [Usage Examples](./examples/sample-prompts.md)
- Check [API Documentation](./README.md#available-tools)
- Join discussions: [GitHub Issues](https://github.com/automateyournetwork/markmap-mcp/issues)

## Support

For issues, questions, or contributions:
- GitHub: https://github.com/automateyournetwork/markmap-mcp
- Issues: https://github.com/automateyournetwork/markmap-mcp/issues

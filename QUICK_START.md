# Markmap MCP - Quick Start (Just Copy/Paste These)

## Run These Commands in Order:

```bash
# 1. Clone the repo
git clone https://github.com/automateyournetwork/markmap-mcp.git

# 2. Navigate to the package directory (IMPORTANT - nested folder!)
cd markmap-mcp/markmap-mcp

# 3. Install dependencies
npm install

# 4. Build the project
npm run build

# 5. Link it globally
npm link

# 6. Verify it worked
which markmap-mcp
```

## Add This to Your ~/.clauderc File:

```json
{
  "mcpServers": {
    "markmap": {
      "command": "markmap-mcp"
    }
  }
}
```

## Restart Claude Code

After updating `.clauderc`, restart Claude Code completely.

## Test It

In Claude Code, type:
```
"Create a mindmap about AI and machine learning"
```

That's it! 🎉

---

## Troubleshooting

**If "markmap-mcp: command not found":**

Option A - Make sure you're in the right directory:
```bash
cd markmap-mcp/markmap-mcp  # Note the nested folder!
npm link
```

Option B - Use direct path instead. Get your path:
```bash
pwd  # This shows your current directory
```

Then update `.clauderc` with the full path:
```json
{
  "mcpServers": {
    "markmap": {
      "command": "node",
      "args": [
        "/YOUR/FULL/PATH/HERE/markmap-mcp/markmap-mcp/dist/index.js"
      ]
    }
  }
}
```

**If modules are missing:**
```bash
cd markmap-mcp/markmap-mcp
npm install
npm run build
```

**Check Node version (must be 18+):**
```bash
node --version
```

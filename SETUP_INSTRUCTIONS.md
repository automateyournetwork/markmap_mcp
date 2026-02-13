# Markmap MCP - Simple Setup Instructions

## What You Need
- Node.js version 18 or higher (check with `node --version`)
- npm (comes with Node.js)
- Claude Code CLI

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone https://github.com/automateyournetwork/markmap-mcp.git
cd markmap-mcp
```

### 2. Go into the markmap-mcp Directory
⚠️ **IMPORTANT**: You need to cd into the subdirectory!
```bash
cd markmap-mcp
```

### 3. Install Dependencies
```bash
npm install
```
This will download all required packages (~338 packages).

### 4. Build the Project
```bash
npm run build
```
This compiles TypeScript to JavaScript in the `dist` folder.

### 5. Link it Globally (Makes the Command Available)
```bash
npm link
```
This creates a global link so the `markmap-mcp` command works everywhere.

### 6. Verify It Works
```bash
which markmap-mcp
```
You should see a path like `/usr/local/bin/markmap-mcp` or similar.

### 7. Configure Claude Code

Edit your `.clauderc` file (in your home directory or project):

```json
{
  "mcpServers": {
    "markmap": {
      "command": "markmap-mcp"
    }
  }
}
```

### 8. Restart Claude Code
After updating the configuration, restart Claude Code completely.

## Testing It Works

In Claude Code, try:
```
"Create a mindmap about machine learning topics"
```

Claude should now be able to use the markmap tools to generate mindmaps!

---

## Alternative: Without npm link

If `npm link` doesn't work for some reason, you can use the direct path approach:

1. Do steps 1-4 above (clone, cd, install, build)
2. Note the absolute path to where you cloned it (use `pwd` command)
3. Configure Claude Code with the full path:

```json
{
  "mcpServers": {
    "markmap": {
      "command": "node",
      "args": [
        "/absolute/path/to/markmap-mcp/markmap-mcp/dist/index.js"
      ]
    }
  }
}
```

Replace `/absolute/path/to/markmap-mcp` with your actual path.

For example, if you cloned it to `/Users/mihai/projects/markmap-mcp`, use:
```json
{
  "mcpServers": {
    "markmap": {
      "command": "node",
      "args": [
        "/Users/mihai/projects/markmap-mcp/markmap-mcp/dist/index.js"
      ]
    }
  }
}
```

---

## Common Issues

### "command not found: markmap-mcp"
- Make sure you ran `npm link` in the `markmap-mcp/markmap-mcp` directory (note the nested folder!)
- Or use the alternative configuration with the full path

### "Cannot find module"
- Make sure you ran `npm install` first
- Make sure you ran `npm run build` second
- Check that `dist/index.js` exists in the markmap-mcp folder

### Tools don't appear in Claude
- Make sure your `.clauderc` file has valid JSON syntax
- Restart Claude Code completely after changing the config
- Check Claude Code logs for errors

### Node version too old
- Run `node --version` - needs to be 18.0.0 or higher
- Update Node.js if needed

---

## Quick Reference

**Where is the code?** After cloning, the actual package is in the nested `markmap-mcp/markmap-mcp/` directory.

**Where is .clauderc?** Usually in your home directory (`~/.clauderc`) or your project directory.

**How to rebuild after changes?** Run `npm run build` in the `markmap-mcp/markmap-mcp` directory.

**How to see if it's running?** Test directly: `node dist/index.js` (you should see startup messages)

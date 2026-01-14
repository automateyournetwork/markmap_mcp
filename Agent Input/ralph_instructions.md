MISSION: Build MCP Server for markmap.js.org Integration
Method: PrincipleSkinner (Ralph + GAIT)
Goal: Enable Claude Code to generate interactive mindmaps from Markdown via MCP tools

PROJECT OVERVIEW:
Create an MCP server that exposes markmap functionality, allowing Claude Code to:
- Convert Markdown to interactive mindmaps dynamically
- Render mindmaps as SVG
- Support real-time generation from natural language prompts
- Integrate seamlessly with Claude Code workflow
- Track your work in the Agent Output folder and prepend the files with 00X starting at 000 chronoligcally as you go 

REFERENCE MATERIALS:
- markmap.js.org documentation
- GitHub: https://github.com/markmap/markmap
- Key libraries: markmap-lib (preprocessing), markmap-view (rendering)

INITIALIZATION (Turn 0-1):
- gait_init in current working directory
- gait_branch markmap-mcp-main
- gait_checkout markmap-mcp-main
- Create project structure for MCP server
- gait_record_turn with initialization artifacts
- Document commit ID in commit_log.md

PHASE 1: RESEARCH & DESIGN (Turns 2-5)
Explore markmap architecture:

gait_branch research-markmap-api
- Study markmap-lib API (Markdown parsing, data extraction)
- Study markmap-view API (SVG rendering)
- Review MCP protocol specification
- Identify key integration points
- Document programmatic usage patterns

Create design artifacts:
- markmap_api_analysis.md (how markmap works)
- mcp_protocol_requirements.md (MCP server spec)
- integration_design.md (how to bridge markmap + MCP)
- tool_specifications.md (what MCP tools to expose)

Design MCP Tools (propose 3-5 core tools):
1. markmap_generate - Convert Markdown text to mindmap SVG
2. markmap_from_outline - Generate mindmap from bullet outline
3. markmap_render_file - Read Markdown file and create mindmap
4. markmap_get_structure - Extract hierarchical structure without rendering
5. markmap_customize - Apply styling/options to mindmap

gait_record_turn with research and design artifacts
Evaluate design quality
If good: gait_checkout markmap-mcp-main, gait_merge research-markmap-api
Document commit ID

PHASE 2: PROJECT SCAFFOLDING (Turns 6-8)
Set up MCP server project structure:

gait_branch setup-project-structure

Create directory structure:
```
markmap-mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts (MCP server entry point)
│   ├── tools/
│   │   ├── generate.ts
│   │   ├── fromOutline.ts
│   │   ├── renderFile.ts
│   │   ├── getStructure.ts
│   │   └── customize.ts
│   ├── lib/
│   │   ├── markmap-handler.ts
│   │   └── types.ts
│   └── utils/
│       └── markdown-parser.ts
├── README.md
├── examples/
│   └── sample-prompts.md
└── tests/
    └── integration.test.ts
```

Initialize Node.js project:
- npm init with appropriate metadata
- Install dependencies:
  * @modelcontextprotocol/sdk
  * markmap-lib
  * markmap-view
  * typescript
  * @types/node
- Configure TypeScript (target ES2020, module commonjs)
- Set up build scripts

gait_record_turn with project scaffolding
Merge if successful
Document commit ID

PHASE 3: CORE MARKMAP INTEGRATION (Turns 9-13)
Build markmap wrapper functionality:

gait_branch core-markmap-integration

Create src/lib/markmap-handler.ts:
- Import markmap-lib (Transformer, deriveOptions)
- Import markmap-view (Markmap, loadCSS, loadJS)
- Create class MarkmapHandler with methods:
  * parseMarkdown(content: string): Parse and extract structure
  * renderToSVG(content: string, options?): Generate SVG string
  * getHierarchy(content: string): Extract hierarchical data
  * applyCustomization(svg: string, theme?, options?): Customize output

Create src/lib/types.ts:
- Define TypeScript interfaces for:
  * MarkmapOptions (color, duration, zoom, pan)
  * MarkmapNode (hierarchical structure)
  * RenderResult (SVG string, metadata)
  * ToolInput/ToolOutput types

Test core functionality:
- Write test cases in tests/integration.test.ts
- Test Markdown parsing
- Test SVG generation
- Test hierarchical extraction
- Verify all markmap features work

gait_record_turn with core integration code
Run tests, if passing: merge to main
Document commit ID

PHASE 4: MCP TOOL IMPLEMENTATION (Turns 14-20)
Implement each MCP tool:

Tool 1: markmap_generate
gait_branch tool-markmap-generate
- Create src/tools/generate.ts
- Input: markdown_content (string), options (optional)
- Output: svg_content (string), preview_url (optional)
- Use MarkmapHandler.renderToSVG()
- Handle errors gracefully
- gait_record_turn, merge if working

Tool 2: markmap_from_outline
gait_branch tool-from-outline
- Create src/tools/fromOutline.ts
- Input: outline_items (array of strings with indentation)
- Convert outline to Markdown format
- Generate mindmap using markmap_generate
- Output: svg_content, markdown_generated
- gait_record_turn, merge if working

Tool 3: markmap_render_file
gait_branch tool-render-file
- Create src/tools/renderFile.ts
- Input: file_path (string), options (optional)
- Read Markdown file from filesystem
- Generate mindmap
- Option to save SVG to file
- Output: svg_content, saved_path (if saved)
- gait_record_turn, merge if working

Tool 4: markmap_get_structure
gait_branch tool-get-structure
- Create src/tools/getStructure.ts
- Input: markdown_content (string)
- Extract hierarchical structure without rendering
- Output: hierarchy (nested JSON), node_count, depth
- Useful for understanding structure before rendering
- gait_record_turn, merge if working

Tool 5: markmap_customize (optional but valuable)
gait_branch tool-customize
- Create src/tools/customize.ts
- Input: markdown_content, theme, color_scheme, options
- Apply customization (colors, fonts, animations)
- Output: customized_svg
- gait_record_turn, merge if working

After each tool:
- Write unit tests
- Test with sample Markdown
- Document usage in tool comments
- Update README with examples

PHASE 5: MCP SERVER IMPLEMENTATION (Turns 21-23)
Wire up MCP server with tools:

gait_branch mcp-server-implementation

Create src/index.ts:
- Import MCP SDK (@modelcontextprotocol/sdk)
- Initialize MCP server
- Register all tools with proper schemas:
  * Tool name
  * Description
  * Input schema (JSON Schema)
  * Output schema
- Implement tool handlers (route to appropriate tool modules)
- Add error handling and logging
- Set up server lifecycle (start, stop)

MCP Server Configuration:
- Server name: "markmap-mcp"
- Server version: "1.0.0"
- Protocol version: Latest MCP protocol
- Capabilities: tools

Tool Registration Example:
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "markmap_generate",
      description: "Generate interactive mindmap from Markdown content",
      inputSchema: {
        type: "object",
        properties: {
          markdown_content: { type: "string" },
          options: { type: "object" }
        },
        required: ["markdown_content"]
      }
    },
    // ... other tools
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Route to appropriate tool handler
});
```

gait_record_turn with MCP server implementation
Test server startup
Merge if successful
Document commit ID

PHASE 6: CLAUDE CODE INTEGRATION (Turns 24-26)
Make MCP server compatible with Claude Code:

gait_branch claude-code-integration

Create configuration files:
1. .clauderc or mcp-config.json for Claude Code discovery
2. Package scripts for easy installation
3. Setup instructions in README

Integration testing:
- Test MCP server in standalone mode
- Test with MCP inspector/debugger
- Create sample Claude Code prompts that use the tools
- Verify SVG generation works from prompts

Create examples/sample-prompts.md:
```
Example Prompts for Claude Code:

1. "Create a mindmap of project phases"
   Claude should use markmap_from_outline with project structure

2. "Generate a mindmap from this Markdown document"
   Claude should use markmap_generate with document content

3. "Show me the hierarchical structure of this outline"
   Claude should use markmap_get_structure

4. "Create a colorful mindmap with custom theme"
   Claude should use markmap_customize
```

Create examples/vibe-coding-examples.md:
- "Make a mindmap about AI trends"
- "Visualize my project architecture"
- "Create a learning roadmap mindmap"
- Show expected outputs

gait_record_turn with integration files
Test with Claude Code if available
Merge if working
Document commit ID

PHASE 7: DOCUMENTATION & POLISH (Turns 27-28)
Comprehensive documentation:

gait_branch documentation-polish

Update README.md with:
1. Project Overview
   - What is markmap-mcp?
   - Why use it with Claude Code?
   - Key features

2. Installation
   - npm install instructions
   - Claude Code setup
   - Configuration

3. Available Tools
   - markmap_generate (with examples)
   - markmap_from_outline (with examples)
   - markmap_render_file (with examples)
   - markmap_get_structure (with examples)
   - markmap_customize (with examples)

4. Usage Examples
   - Basic mindmap generation
   - Custom styling
   - File-based workflows
   - Integration with Claude Code

5. API Reference
   - Tool schemas
   - Input/output formats
   - Options and customization

6. Troubleshooting
   - Common issues
   - Debug mode
   - Logging

7. Development
   - Building from source
   - Running tests
   - Contributing

Create additional docs:
- ARCHITECTURE.md (system design, data flow)
- API.md (detailed API reference)
- CONTRIBUTING.md (how to contribute)
- CHANGELOG.md (version history)

Add inline code documentation:
- JSDoc comments for all functions
- Type definitions documented
- Usage examples in comments

gait_record_turn with documentation
Merge to main
Document commit ID

PHASE 8: TESTING & VALIDATION (Turn 29)
Comprehensive testing:

gait_branch testing-validation

Create test suite:
1. Unit tests (each tool individually)
2. Integration tests (MCP server with tools)
3. End-to-end tests (full workflow)

Test cases:
- Simple Markdown to mindmap
- Complex nested structures
- Large documents (performance)
- Invalid input handling
- Error scenarios
- Custom themes and options
- File operations
- Unicode/special characters

Run test suite:
- npm test
- Check coverage (aim for >80%)
- Fix any failing tests

Manual testing:
- Test in Claude Code environment
- Generate mindmaps from various prompts
- Verify SVG output is valid
- Test customization options
- Verify error messages are helpful

Create test_results.md documenting:
- All test cases
- Pass/fail status
- Performance metrics
- Known limitations

If any tests fail:
gait_branch fix-test-failures
- Diagnose and fix
- Re-run tests
- Merge when passing

gait_record_turn with test results
Merge to main
Document commit ID

PHASE 9: PACKAGING & DISTRIBUTION (Turn 30)
Prepare for distribution:

Final checklist:
- ✓ All tests passing
- ✓ Documentation complete
- ✓ Examples working
- ✓ README polished
- ✓ License file added (MIT recommended)
- ✓ .gitignore configured
- ✓ package.json metadata correct

Build distribution:
- npm run build
- Verify build output
- Test built package

Create release:
- package.json version 1.0.0
- Create CHANGELOG entry
- Tag release in git

Publish options:
1. NPM package (npm publish)
2. GitHub release
3. Claude Code plugin registry (if available)

Create installation one-liner:
```bash
npm install -g markmap-mcp
# or
npx markmap-mcp
```

GAIT finalization:
- gait_log (review all commits)
- Delete any merged branches
- Ensure markmap-mcp-main is clean
- gait_remote_add origin https://gait-hub.com
- gait_repo_create owner="automateyournetwork" name="markmap-mcp" (use GAITHUB_TOKEN from .env)
- gait_push origin markmap-mcp-main

Create final_report.md:
```
Markmap MCP Server - Project Complete
======================================

Summary:
- MCP server for markmap.js.org integration
- 5 core tools for mindmap generation
- Full Claude Code compatibility
- Comprehensive documentation

Tools Implemented:
1. markmap_generate - ✓
2. markmap_from_outline - ✓
3. markmap_render_file - ✓
4. markmap_get_structure - ✓
5. markmap_customize - ✓

Test Results:
- Unit tests: [X/X passing]
- Integration tests: [X/X passing]
- Coverage: [X%]

GAIT Statistics:
- Total commits: [from gait_log]
- Branches created: [count]
- Branches merged: [count]
- Reverts: [count if any]

Usage:
npm install -g markmap-mcp
# Then in Claude Code: use markmap tools naturally

Repository: https://gait-hub.com/automateyournetwork/markmap-mcp
```

gait_record_turn with final artifacts

Output: MARKMAP_MCP_COMPLETE

GAIT BRANCHING STRATEGY:
- research-markmap-api: Understand markmap internals
- setup-project-structure: Initial scaffolding
- core-markmap-integration: Core wrapper functionality
- tool-<name>: Individual tool implementation (isolated)
- mcp-server-implementation: Server wiring
- claude-code-integration: Integration testing
- documentation-polish: Docs and examples
- testing-validation: Comprehensive testing
- fix-*: Bug fixes and issues

Always:
- Merge successful branches immediately
- Delete branches after merge
- Keep main branch stable and working
- Document commit IDs in commit_log.md

SELF-CORRECTION PROTOCOL:
- After each tool implementation: test it works
- If tool fails: gait_revert, diagnose, fix
- If uncertain about approach: branch, prototype, evaluate
- Track all decisions in BRANCH_LOG

CRITICAL RULES:
✓ gait_record_turn after EVERY code change
✓ Full file contents in artifacts
✓ Test each tool before merging
✓ Keep main branch always working
✓ Document all commit IDs
✓ MCP protocol compliance
✓ Clean, idiomatic TypeScript code
✓ Comprehensive error handling

SUCCESS CRITERIA:
✓ MCP server runs successfully
✓ All 5 tools implemented and tested
✓ Claude Code integration verified
✓ Documentation complete
✓ Examples working
✓ Tests passing (>80% coverage)
✓ Published to GAITHUB
✓ Ready for npm distribution
EOF
# Sample Prompts for Claude Code

This document contains example prompts that users can give to Claude Code when using the Markmap MCP server.

## Basic Mindmap Generation

### Prompt 1: Simple Topic Breakdown
**User:** "Create a mindmap about software development lifecycle"

**Expected:** Claude will use `markmap_from_outline` to create a structured mindmap

### Prompt 2: From Markdown
**User:** "Generate a mindmap from this markdown: [paste markdown]"

**Expected:** Claude will use `markmap_generate` with the provided content

### Prompt 3: File Visualization
**User:** "Show me a mindmap of README.md"

**Expected:** Claude will use `markmap_render_file` with the file path

## Advanced Usage

### Prompt 4: Structure Analysis
**User:** "Analyze the structure of this document without rendering it"

**Expected:** Claude will use `markmap_get_structure` to return hierarchy info

### Prompt 5: Custom Styling
**User:** "Create a dark-themed mindmap about AI technologies"

**Expected:** Claude will use `markmap_customize` with theme: 'dark'

## Vibe Coding Examples

### Example 1: Project Planning
**User:** "I need a mindmap for planning a new web application project"

**Claude might generate:**
- Planning
  - Requirements
  - User Stories
  - Tech Stack
- Design
  - UI/UX
  - Architecture
  - Database Schema
- Development
  - Frontend
  - Backend
  - API
- Testing
  - Unit Tests
  - Integration Tests
  - E2E Tests
- Deployment
  - CI/CD
  - Hosting
  - Monitoring

### Example 2: Learning Roadmap
**User:** "Create a learning roadmap for becoming a full-stack developer"

### Example 3: Meeting Notes
**User:** "Turn these meeting notes into a mindmap"

## More Examples Coming Soon

As the project develops, more example prompts will be added here.

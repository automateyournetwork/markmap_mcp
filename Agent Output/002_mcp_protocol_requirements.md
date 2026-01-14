# MCP Protocol Requirements

## Date
2026-01-14

## Overview
Model Context Protocol (MCP) is an open protocol introduced by Anthropic in November 2024 that enables seamless integration between LLM applications and external data sources and tools.

## Protocol Purpose
Standardize how AI systems like large language models integrate and share data with:
- External tools
- Data sources
- System integrations

## TypeScript SDK

### Package
```bash
npm install @modelcontextprotocol/sdk
```

### Status (2026)
- v1.x: Recommended for production use
- v2: Expected Q1 2026

### Core Components
- **McpServer**: Server class from `@modelcontextprotocol/server`
- **Transports**:
  - Streamable HTTP (modern, recommended for remote servers)
  - stdio (local process-spawned integrations)

## MCP Capabilities

### 1. Tools
Let LLMs ask your server to take actions:
- Computation
- Side effects
- Network calls

### 2. Resources
Expose read-only data that clients can surface to users or models

### 3. Prompts
Reusable templates to help users talk to models consistently

### 4. Sampling
Server-side tools can ask connected clients to run LLM completions

## Tool Registration Architecture

### Server Creation
```typescript
import { McpServer } from '@modelcontextprotocol/server';

const server = new McpServer({
  name: 'server-name',
  version: '1.0.0'
});
```

### Tool Registration Method
```typescript
server.registerTool(
  toolId: string,
  metadata: {
    title: string,
    description: string,
    inputSchema: ZodSchema,
    outputSchema: ZodSchema
  },
  handler: async (input) => {
    return {
      content: [{ type: 'text', text: string }],
      structuredContent: object
    };
  }
);
```

### Schema Format
Uses Zod validation objects:
```typescript
import { z } from 'zod';

const inputSchema = {
  fieldName: z.string(),
  optionalField: z.number().optional(),
  arrayField: z.array(z.string())
};

const outputSchema = {
  result: z.string(),
  metadata: z.object({
    timestamp: z.string(),
    status: z.enum(['success', 'error'])
  })
};
```

### Handler Function Structure
```typescript
async ({ param1, param2 }) => {
  // Tool logic here
  const result = await doSomething(param1, param2);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result) // Human-readable
      }
    ],
    structuredContent: result // Machine-parseable
  };
}
```

## Request Handler Pattern

### List Tools Handler
```typescript
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk';

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'tool-name',
      description: 'Tool description',
      inputSchema: {
        type: 'object',
        properties: {
          param: { type: 'string' }
        },
        required: ['param']
      }
    }
  ]
}));
```

### Call Tool Handler
```typescript
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk';

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Route to appropriate tool handler
  switch (name) {
    case 'tool-name':
      return await handleTool(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

## Complete Example

```typescript
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

const server = new McpServer({
  name: 'example-server',
  version: '1.0.0'
});

server.registerTool(
  'calculate-bmi',
  {
    title: 'BMI Calculator',
    description: 'Calculate Body Mass Index',
    inputSchema: {
      weightKg: z.number(),
      heightM: z.number()
    },
    outputSchema: {
      bmi: z.number(),
      category: z.string()
    }
  },
  async ({ weightKg, heightM }) => {
    const bmi = weightKg / (heightM * heightM);
    const category = bmi < 18.5 ? 'underweight' :
                     bmi < 25 ? 'normal' :
                     bmi < 30 ? 'overweight' : 'obese';

    return {
      content: [{
        type: 'text',
        text: `BMI: ${bmi.toFixed(1)} (${category})`
      }],
      structuredContent: { bmi, category }
    };
  }
);
```

## Transport Configuration

### Streamable HTTP (Recommended)
- Modern, fully featured
- Supports remote servers
- CORS support
- DNS rebinding protection
- Multi-node deployment

### stdio
- Local process-spawned integrations
- Simple communication via standard input/output
- Good for development and local tools

## Error Handling
```typescript
server.registerTool('example', metadata, async (input) => {
  try {
    // Tool logic
    return { content: [...], structuredContent: {...} };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});
```

## MCP Server Lifecycle

1. **Initialize**: Create McpServer instance
2. **Register**: Add tools, resources, prompts
3. **Start**: Begin listening on transport
4. **Handle Requests**: Process tool calls from clients
5. **Stop**: Clean shutdown

## Key Requirements for Our Markmap MCP Server

### Server Metadata
- Name: "markmap-mcp"
- Version: "1.0.0"
- Protocol: Latest MCP specification

### Transport
- Use Streamable HTTP for remote access
- Support stdio for local development

### Tool Structure
Each tool needs:
- Unique identifier (name)
- Clear title and description
- JSON Schema-compatible input schema
- JSON Schema-compatible output schema
- Async handler returning content + structuredContent

### Input Validation
- Use Zod schemas for type safety
- Validate all parameters
- Provide clear error messages

### Output Format
- Always return both content (text) and structuredContent
- Content: Human-readable string representation
- StructuredContent: Typed object matching schema

### Error Handling
- Wrap all tool logic in try-catch
- Return error flag and message
- Log errors appropriately

## Integration with Claude Code

### Configuration
Claude Code discovers MCP servers via configuration files:
- `.clauderc` or similar
- `mcp-config.json`

### Tool Discovery
Claude Code will:
1. Connect to MCP server
2. Request list of available tools
3. Present tools to LLM
4. Route tool calls through MCP protocol

### Usage Pattern
User prompt → Claude → MCP tool call → Our server → Markmap → SVG → Claude → User

## References
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-06-18)
- [Server Documentation](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md)
- [@modelcontextprotocol/sdk - npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

## Sources
- [GitHub - modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [@modelcontextprotocol/sdk - npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Specification - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18)
- [How to build MCP servers with TypeScript SDK](https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28)
- [typescript-sdk/docs/server.md](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md)

# Usage Examples - Markmap MCP Server

## Basic Usage

### Example 1: Simple Project Breakdown

**Prompt:**
```
Create a mindmap showing the phases of a web application project
```

**Claude Code will use:** `markmap_from_outline`

**Expected Output:** SVG mindmap with:
- Planning
- Design
- Development
- Testing
- Deployment

---

### Example 2: From Existing Markdown

**Prompt:**
```
Generate a mindmap from this markdown:

# Machine Learning
## Supervised Learning
### Classification
### Regression
## Unsupervised Learning
### Clustering
### Dimensionality Reduction
## Deep Learning
### Neural Networks
### CNNs
### RNNs
```

**Claude Code will use:** `markmap_generate`

**Expected Output:** Interactive SVG mindmap visualizing the ML hierarchy

---

### Example 3: Visualize a Document

**Prompt:**
```
Show me a mindmap of the README.md file
```

**Claude Code will use:** `markmap_render_file`

**Expected Output:** SVG mindmap of README.md structure

---

## Advanced Usage

### Example 4: Custom Themed Mindmap

**Prompt:**
```
Create a dark-themed mindmap about AI technologies:
- Artificial Intelligence
  - Machine Learning
  - Natural Language Processing
  - Computer Vision
  - Robotics
```

**Claude Code will use:** `markmap_customize` with theme='dark'

**Expected Output:** Dark-themed SVG mindmap

---

### Example 5: Analyze Document Structure

**Prompt:**
```
Analyze the structure of this documentation without rendering it:
[large markdown content]
```

**Claude Code will use:** `markmap_get_structure`

**Expected Output:** JSON structure with:
- Node count
- Maximum depth
- Headings by level
- Statistics

---

### Example 6: Create and Save Mindmap

**Prompt:**
```
Generate a mindmap from docs/architecture.md and save it as output/architecture-mindmap.svg
```

**Claude Code will use:** `markmap_render_file` with save_output=true

**Expected Output:**
- SVG content
- File saved to specified path

---

## Real-World Scenarios

### Scenario 1: Sprint Planning

**User:** "I need to plan our next sprint. Create a mindmap of the following features and tasks..."

**Result:** Organized visual representation of sprint backlog

---

### Scenario 2: Learning Roadmap

**User:** "Help me create a learning roadmap for becoming a full-stack developer"

**Claude generates outline, then:**
```
markmap_from_outline([
  { text: "Frontend", level: 1 },
  { text: "HTML/CSS", level: 2 },
  { text: "JavaScript", level: 2 },
  { text: "React", level: 2 },
  { text: "Backend", level: 1 },
  { text: "Node.js", level: 2 },
  { text: "Databases", level: 2 },
  ...
])
```

**Result:** Comprehensive learning path visualization

---

### Scenario 3: Meeting Notes

**User:** "Turn these meeting notes into a mindmap"

**Claude processes notes and generates structured mindmap**

---

### Scenario 4: Code Architecture

**User:** "Visualize the architecture of this project based on the file structure"

**Claude analyzes structure, then creates mindmap**

---

## Tool-Specific Examples

### markmap_generate

```javascript
// Input
{
  "markdown_content": "# Goal\n## Q1\n### Jan\n### Feb\n### Mar\n## Q2",
  "options": {
    "colorFreezeLevel": 3,
    "duration": 500,
    "zoom": true
  }
}

// Output
{
  "svg_content": "<svg>...</svg>",
  "node_count": 7,
  "depth": 3,
  "features_used": ["heading"]
}
```

---

### markmap_from_outline

```javascript
// Input
{
  "outline_items": [
    { "text": "Software Development", "level": 1 },
    { "text": "Requirements", "level": 2 },
    { "text": "Design", "level": 2 },
    { "text": "Implementation", "level": 2 },
    { "text": "Testing", "level": 2 }
  ]
}

// Output
{
  "svg_content": "<svg>...</svg>",
  "markdown_generated": "# Software Development\n## Requirements\n...",
  "node_count": 5,
  "depth": 2
}
```

---

### markmap_get_structure

```javascript
// Input
{
  "markdown_content": "# Root\n## Branch A\n### Leaf 1\n## Branch B",
  "include_content": true
}

// Output
{
  "hierarchy": {
    "content": "Root",
    "depth": 1,
    "children": [
      {
        "content": "Branch A",
        "depth": 2,
        "children": [{"content": "Leaf 1", "depth": 3}]
      },
      {"content": "Branch B", "depth": 2}
    ]
  },
  "node_count": 4,
  "max_depth": 3,
  "statistics": {
    "headings_by_level": {"1": 1, "2": 2, "3": 1},
    "total_characters": 28,
    "average_node_length": 7
  }
}
```

---

### markmap_render_file

```javascript
// Input
{
  "file_path": "./docs/api.md",
  "save_output": true,
  "output_path": "./output/api-mindmap.svg"
}

// Output
{
  "svg_content": "<svg>...</svg>",
  "file_path": "./docs/api.md",
  "saved_path": "./output/api-mindmap.svg",
  "node_count": 42,
  "file_size_kb": 12.5
}
```

---

### markmap_customize

```javascript
// Input
{
  "markdown_content": "# AI\n## ML\n## NLP\n## CV",
  "theme": "colorful",
  "color_scheme": ["#FF6B6B", "#4ECDC4", "#45B7D1"],
  "options": {
    "fontSize": 18,
    "spacing": 25
  }
}

// Output
{
  "svg_content": "<svg>...</svg>",
  "theme_applied": "colorful",
  "colors_used": ["#FF6B6B", "#4ECDC4", "#45B7D1"],
  "node_count": 4,
  "customization_summary": {
    "theme": "colorful",
    "custom_colors": true,
    "custom_options": ["fontSize", "spacing"]
  }
}
```

---

## Tips and Best Practices

### 1. Keep Hierarchies Clear
- Use consistent heading levels
- Don't skip levels (e.g., # → ### skips ##)
- Keep node text concise

### 2. Optimize Large Documents
- For large documents, use `markmap_get_structure` first
- Check node count before rendering (max 10,000)
- Consider breaking into sections

### 3. Theme Selection
- **Default**: General purpose, good contrast
- **Dark**: Presentations, dark mode interfaces
- **Colorful**: Engaging, creative work
- **Minimal**: Professional, clean documents

### 4. File Operations
- Always use relative paths within project
- Ensure output directories exist
- Use .svg extension for saved files

### 5. Custom Options
- Adjust `colorFreezeLevel` to control color variation
- Increase `duration` for smoother animations
- Set `maxWidth` for wrapped text
- Disable `zoom`/`pan` for static exports

---

## Common Patterns

### Pattern 1: Iterative Refinement
```
1. User: "Create a mindmap about X"
2. Claude generates basic structure
3. User: "Add more detail to section Y"
4. Claude refines and regenerates
```

### Pattern 2: Multi-format Output
```
1. Generate mindmap with markmap_generate
2. Extract structure with markmap_get_structure
3. Save to file with custom theme
```

### Pattern 3: Batch Processing
```
For each markdown file:
  - Read with markmap_render_file
  - Save SVG to output directory
```

---

## Troubleshooting Common Issues

### Issue: "Too many nodes"
**Solution:** Break document into sections or increase limit

### Issue: "Tree too deep"
**Solution:** Flatten hierarchy or split document

### Issue: "File not found"
**Solution:** Check path is relative to working directory

### Issue: "Invalid theme"
**Solution:** Use: default, dark, colorful, or minimal

---

## Additional Resources

- [Sample Prompts](./sample-prompts.md)
- [API Reference](../README.md#api-reference)
- [GitHub Examples](https://github.com/automateyournetwork/markmap-mcp/tree/main/examples)

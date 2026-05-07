# Structured Output Helper (JavaScript)

This folder contains a simple, beginner-friendly **schema-first structured-output helper**.

## Files

- `structuredOutputHelper.js` - Reads input, generates structured output, validates it, and writes output.
- `sample-input.json` - Example input data.
- `sample-output.json` - Generated validated output.

## Required output fields

The output always includes these required fields:

- `category`
- `priority`
- `summary`
- `required_actions`
- `confidence`
- `source_ids`

## JSON Schema

```json
{
  "type": "object",
  "required": [
    "category",
    "priority",
    "summary",
    "required_actions",
    "confidence",
    "source_ids"
  ],
  "properties": {
    "category": { "type": "string" },
    "priority": { "type": "string", "enum": ["Low", "Medium", "High"] },
    "summary": { "type": "string" },
    "required_actions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "source_ids": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

## How it works

1. Reads `sample-input.json`
2. Generates a structured output object
3. Validates the object against the schema rules
4. Fails visibly in terminal if fields are missing/invalid
5. Writes validated output to `sample-output.json`
6. Prints clear pass/fail terminal messages

## Run

From repository root:

```bash
node js-scripts/structured-output-helper/structuredOutputHelper.js
```

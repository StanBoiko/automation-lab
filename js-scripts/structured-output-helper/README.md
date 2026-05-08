# Structured Output Helper (JavaScript)

This folder contains a simple, beginner-friendly **schema-first structured-output helper** with built-in traceability rules.

## Files

- `structuredOutputHelper.js` - Reads input, generates structured output, validates it, and writes output.
- `sample-input.json` - Example valid input with `source_ids`.
- `sample-output.json` - Generated validated `Final` output.
- `sample-input-missing-source-ids.json` - Example input without `source_ids`.
- `sample-output-missing-source-ids.json` - Generated validated `Needs review` output.

## Required output fields

Every output includes these required fields:

- `request_id`
- `status`
- `category`
- `summary`
- `source_ids`
- `confidence`
- `review_reason`

(Existing helper fields are also still included: `priority`, `required_actions`.)

## Traceability rules

- **`source_ids`**: IDs of the source records used for the answer (for example ticket IDs, email message IDs, or event IDs).
- `source_ids` is always an array.
- The helper copies `source_ids` from input when provided as a non-empty array. It does not invent fake IDs.
- **`confidence`**: numeric confidence score from `0` to `1`.

### When `source_ids` is present and non-empty

- `status` = `"Final"`
- `source_ids` = exact input `source_ids`
- `review_reason` = `""`

### When `source_ids` is missing, empty, or not an array

- `status` = `"Needs review"`
- `source_ids` = `[]`
- `review_reason` = `"Missing source_ids; answer cannot be verified."`

## Run

From repository root:

### Valid test

```bash
node js-scripts/structured-output-helper/structuredOutputHelper.js valid
```

### Missing `source_ids` test

```bash
node js-scripts/structured-output-helper/structuredOutputHelper.js missing-source-ids
```

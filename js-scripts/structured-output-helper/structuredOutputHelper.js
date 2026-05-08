const fs = require('fs');
const path = require('path');

// Define the schema in code (schema-first approach)
const outputSchema = {
  type: 'object',
  required: [
    'category',
    'priority',
    'summary',
    'required_actions',
    'confidence',
    'source_ids'
  ],
  properties: {
    category: { type: 'string' },
    priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
    summary: { type: 'string' },
    required_actions: {
      type: 'array',
      items: { type: 'string' }
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    source_ids: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

// Basic validation function for our schema rules
function validateStructuredOutput(output, schema) {
  const errors = [];

  // Ensure output is an object
  if (typeof output !== 'object' || output === null || Array.isArray(output)) {
    errors.push('Output must be an object.');
    return { valid: false, errors };
  }

  // Check required fields
  for (const key of schema.required) {
    if (!(key in output)) {
      errors.push(`Missing required field: ${key}`);
    }
  }

  // If required fields are missing, return early
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // category: string
  if (typeof output.category !== 'string') {
    errors.push('category must be a string.');
  }

  // priority: enum
  if (!schema.properties.priority.enum.includes(output.priority)) {
    errors.push('priority must be one of: Low, Medium, High.');
  }

  // summary: string
  if (typeof output.summary !== 'string') {
    errors.push('summary must be a string.');
  }

  // required_actions: array of strings
  if (!Array.isArray(output.required_actions)) {
    errors.push('required_actions must be an array.');
  } else {
    const badAction = output.required_actions.find((item) => typeof item !== 'string');
    if (badAction !== undefined) {
      errors.push('required_actions must contain only strings.');
    }
  }

  // confidence: number between 0 and 1
  if (typeof output.confidence !== 'number' || Number.isNaN(output.confidence)) {
    errors.push('confidence must be a valid number.');
  } else if (output.confidence < 0 || output.confidence > 1) {
    errors.push('confidence must be between 0 and 1.');
  }

  // source_ids: array of strings
  if (!Array.isArray(output.source_ids)) {
    errors.push('source_ids must be an array.');
  } else {
    const badSourceId = output.source_ids.find((item) => typeof item !== 'string');
    if (badSourceId !== undefined) {
      errors.push('source_ids must contain only strings.');
    }
  }

  return { valid: errors.length === 0, errors };
}

// Convert raw input into structured output
function generateStructuredOutput(input) {
  // Support email-style input by combining payload subject + body text.
  const subject = typeof input?.payload?.subject === 'string' ? input.payload.subject : '';
  const body = typeof input?.payload?.body === 'string' ? input.payload.body : '';
  const emailText = `${subject} ${body}`.trim();
  const normalizedText = emailText.toLowerCase();

  // Rule-based classification for LMS/course/access/deadline/urgent issues.
  const hasLmsKeywords =
    normalizedText.includes('lms') ||
    normalizedText.includes('course') ||
    normalizedText.includes('cannot access') ||
    normalizedText.includes("can't access") ||
    normalizedText.includes('access');
  const hasUrgencyKeywords =
    normalizedText.includes('due today') ||
    normalizedText.includes('deadline') ||
    normalizedText.includes('urgent') ||
    normalizedText.includes('asap');

  if (hasLmsKeywords && hasUrgencyKeywords) {
    return {
      category: 'LMS Support',
      priority: 'High',
      summary: emailText || 'LMS access issue requiring urgent support.',
      required_actions: [
        "Check the learner's LMS access",
        'Confirm course assignment and deadline',
        'Reply with resolution or next steps'
      ],
      confidence: 0.92,
      source_ids: typeof input.request_id === 'string' ? [input.request_id] : []
    };
  }

  return {
    category: typeof input.category === 'string' ? input.category : 'General',
    priority: ['Low', 'Medium', 'High'].includes(input.priority) ? input.priority : 'Medium',
    summary:
      typeof input.summary === 'string'
        ? input.summary
        : emailText || 'No summary provided.',
    required_actions: Array.isArray(input.required_actions)
      ? input.required_actions.filter((item) => typeof item === 'string')
      : [],
    confidence:
      typeof input.confidence === 'number' && input.confidence >= 0 && input.confidence <= 1
        ? input.confidence
        : 0.5,
    source_ids: Array.isArray(input.source_ids)
      ? input.source_ids.filter((item) => typeof item === 'string')
      : []
  };
}

function main() {
  const inputPath = path.join(__dirname, 'sample-input.json');
  const outputPath = path.join(__dirname, 'sample-output.json');

  console.log('Reading input file:', inputPath);

  let rawInput;
  try {
    const fileContents = fs.readFileSync(inputPath, 'utf8');
    rawInput = JSON.parse(fileContents);
  } catch (error) {
    console.error('❌ Failed to read or parse sample-input.json');
    console.error(error.message);
    process.exit(1);
  }

  console.log('Generating structured output...');
  const structuredOutput = generateStructuredOutput(rawInput);

  console.log('Validating structured output against schema...');
  const validationResult = validateStructuredOutput(structuredOutput, outputSchema);

  if (!validationResult.valid) {
    console.error('❌ Validation failed. Errors:');
    validationResult.errors.forEach((err) => console.error(`- ${err}`));
    process.exit(1);
  }

  try {
    fs.writeFileSync(outputPath, JSON.stringify(structuredOutput, null, 2));
    console.log('✅ Validation passed. Output written to:', outputPath);
  } catch (error) {
    console.error('❌ Failed to write sample-output.json');
    console.error(error.message);
    process.exit(1);
  }
}

main();

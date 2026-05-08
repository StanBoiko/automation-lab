const fs = require('fs');
const path = require('path');

// Define the schema in code (schema-first approach)
const outputSchema = {
  type: 'object',
  required: [
    'request_id',
    'status',
    'category',
    'summary',
    'source_ids',
    'confidence',
    'review_reason',
    'priority',
    'required_actions'
  ],
  properties: {
    request_id: { type: 'string' },
    status: { type: 'string', enum: ['Final', 'Needs review'] },
    category: { type: 'string' },
    summary: { type: 'string' },
    source_ids: {
      type: 'array',
      items: { type: 'string' }
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    review_reason: { type: 'string' },
    priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
    required_actions: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

// Basic validation function for our schema rules
function validateStructuredOutput(output, schema) {
  const errors = [];

  if (typeof output !== 'object' || output === null || Array.isArray(output)) {
    errors.push('Output must be an object.');
    return { valid: false, errors };
  }

  for (const key of schema.required) {
    if (!(key in output)) {
      errors.push(`Missing required field: ${key}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (typeof output.request_id !== 'string') {
    errors.push('request_id must be a string.');
  }

  if (!schema.properties.status.enum.includes(output.status)) {
    errors.push('status must be one of: Final, Needs review.');
  }

  if (typeof output.category !== 'string') {
    errors.push('category must be a string.');
  }

  if (typeof output.summary !== 'string') {
    errors.push('summary must be a string.');
  }

  if (!Array.isArray(output.source_ids)) {
    errors.push('source_ids must be an array.');
  } else {
    const badSourceId = output.source_ids.find((item) => typeof item !== 'string');
    if (badSourceId !== undefined) {
      errors.push('source_ids must contain only strings.');
    }
  }

  if (typeof output.confidence !== 'number' || Number.isNaN(output.confidence)) {
    errors.push('confidence must be a valid number.');
  } else if (output.confidence < 0 || output.confidence > 1) {
    errors.push('confidence must be between 0 and 1.');
  }

  if (typeof output.review_reason !== 'string') {
    errors.push('review_reason must be a string.');
  }

  // Traceability status rules
  if (output.status === 'Final') {
    if (output.source_ids.length === 0) {
      errors.push('Final output must include at least one source_id.');
    }
    if (output.review_reason !== '') {
      errors.push('Final output must have an empty review_reason.');
    }
  }

  if (output.status === 'Needs review') {
    if (output.source_ids.length !== 0) {
      errors.push('Needs review output must have an empty source_ids array.');
    }
    if (output.review_reason !== 'Missing source_ids; answer cannot be verified.') {
      errors.push('Needs review output must use the required review_reason message.');
    }
  }

  if (!schema.properties.priority.enum.includes(output.priority)) {
    errors.push('priority must be one of: Low, Medium, High.');
  }

  if (!Array.isArray(output.required_actions)) {
    errors.push('required_actions must be an array.');
  } else {
    const badAction = output.required_actions.find((item) => typeof item !== 'string');
    if (badAction !== undefined) {
      errors.push('required_actions must contain only strings.');
    }
  }

  return { valid: errors.length === 0, errors };
}

function getTraceabilityFields(input) {
  const hasValidSourceIds =
    Array.isArray(input.source_ids) && input.source_ids.length > 0;

  if (hasValidSourceIds) {
    return {
      status: 'Final',
      source_ids: input.source_ids,
      review_reason: ''
    };
  }

  return {
    status: 'Needs review',
    source_ids: [],
    review_reason: 'Missing source_ids; answer cannot be verified.'
  };
}

// Convert raw input into structured output
function generateStructuredOutput(input) {
  const subject = typeof input?.payload?.subject === 'string' ? input.payload.subject : '';
  const body = typeof input?.payload?.body === 'string' ? input.payload.body : '';
  const emailText = `${subject} ${body}`.trim();
  const normalizedText = emailText.toLowerCase();

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

  const traceability = getTraceabilityFields(input);

  if (hasLmsKeywords && hasUrgencyKeywords) {
    return {
      request_id: typeof input.request_id === 'string' ? input.request_id : 'unknown-request',
      ...traceability,
      category: 'LMS Support',
      summary: emailText || 'LMS access issue requiring urgent support.',
      confidence: 0.92,
      priority: 'High',
      required_actions: [
        "Check the learner's LMS access",
        'Confirm course assignment and deadline',
        'Reply with resolution or next steps'
      ]
    };
  }

  return {
    request_id: typeof input.request_id === 'string' ? input.request_id : 'unknown-request',
    ...traceability,
    category: typeof input.category === 'string' ? input.category : 'General',
    summary: typeof input.summary === 'string' ? input.summary : emailText || 'No summary provided.',
    confidence:
      typeof input.confidence === 'number' && input.confidence >= 0 && input.confidence <= 1
        ? input.confidence
        : 0.5,
    priority: ['Low', 'Medium', 'High'].includes(input.priority) ? input.priority : 'Medium',
    required_actions: Array.isArray(input.required_actions)
      ? input.required_actions.filter((item) => typeof item === 'string')
      : []
  };
}

function runCase(inputFilename, outputFilename) {
  const inputPath = path.join(__dirname, inputFilename);
  const outputPath = path.join(__dirname, outputFilename);

  console.log('Reading input file:', inputPath);

  let rawInput;
  try {
    const fileContents = fs.readFileSync(inputPath, 'utf8');
    rawInput = JSON.parse(fileContents);
  } catch (error) {
    console.error(`❌ Failed to read or parse ${inputFilename}`);
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
    console.error(`❌ Failed to write ${outputFilename}`);
    console.error(error.message);
    process.exit(1);
  }
}

function main() {
  const mode = process.argv[2] || 'valid';

  if (mode === 'valid') {
    runCase('sample-input.json', 'sample-output.json');
    return;
  }

  if (mode === 'missing-source-ids') {
    runCase('sample-input-missing-source-ids.json', 'sample-output-missing-source-ids.json');
    return;
  }

  console.error('❌ Unknown mode. Use: valid or missing-source-ids');
  process.exit(1);
}

main();

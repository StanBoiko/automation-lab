// ======= MAIN FUNCTION =======

function safeParseJSON(text) {
  // Handle null/undefined early (avoids "cannot read property trim" errors)
  if (text == null) {
    return { ok: false, value: null, error: "Input is null/undefined" };
  }

  // If caller accidentally passed an object/array already, just accept it.
  if (typeof text !== "string") {
    return { ok: true, value: text };
  }

  // Trim whitespace so JSON like "   {\"a\":1}   " still parses
  const trimmed = text.trim();

  // Empty strings are not valid JSON
  if (trimmed === "") {
    return { ok: false, value: null, error: "Empty string" };
  }

  try {
    // Try to parse JSON
    const parsed = JSON.parse(trimmed);
    return { ok: true, value: parsed };
  } catch (err) {
    // Catch parse errors and return them instead of throwing
    return {
      ok: false,
      value: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ======= TESTS =======

// Test 1 (GOOD): valid JSON string -> should parse successfully
const input1 = '{"orderNumber":55,"customerName":"Stan"}';
console.log("\nTest 1 (valid JSON string)");
console.log("Input :", input1);
console.log("Output:", safeParseJSON(input1));

// Test 2 (BAD): invalid JSON string -> should return ok:false (no crash)
const input2 = "{ orderNumber: 55 }"; // invalid JSON because keys are not in quotes
console.log("\nTest 2 (invalid JSON string)");
console.log("Input :", input2);
console.log("Output:", safeParseJSON(input2));

// Test 3 (GOOD): already-parsed object -> should skip parsing and return it as-is
const input3 = { orderNumber: 55, customerName: "Stan" };
console.log("\nTest 3 (already parsed object)");
console.log("Input :", input3);
console.log("Output:", safeParseJSON(input3));

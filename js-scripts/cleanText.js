// ======= MAIN FUNCTION =======

function cleanText(text) {
  // If missing input, return empty string instead of crashing
  if (text == null) return "";

  // Convert to string, trim edges, collapse all whitespace into single spaces
  return String(text).trim().replace(/\s+/g, " ");
}

// ======= TESTS =======

// Test 1 (GOOD): extra spaces
const input1 = "   Stan     Boiko   ";
console.log("\nTest 1 (extra spaces)");
console.log("Input :", input1);
console.log("Output:", cleanText(input1)); // "Stan Smith"

// Test 2 (GOOD): newlines + tabs
const input2 = "Hello\n\nworld\t\t!!!";
console.log("\nTest 2 (newlines + tabs)");
console.log("Input :", input2);
console.log("Output:", cleanText(input2)); // "Hello world !!!"

// Test 3 (EDGE/BAD): null/undefined input (should not crash)
const input3 = undefined;
console.log("\nTest 3 (missing input)");
console.log("Input :", input3);
console.log("Output:", cleanText(input3)); // ""

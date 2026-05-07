// ====== MAIN FUNCTION ======

// ---- Dependency (required) ----
function cleanText(text) {
  if (text == null) return "";
  return String(text).trim().replace(/\s+/g, " ");
}

// ---- Function under test ----
function toISODate(dateString, tz = "UTC") {
  // Missing input -> return null safely
  if (dateString == null) return null;

  // Clean input first (depends on cleanText)
  const raw = cleanText(dateString);
  if (!raw) return null;

  // If already YYYY-MM-DD, keep it unchanged (but add time as 00:00:00)
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    const [, yyyy, mm, dd] = ymd;
    return `${dd}-${mm}-${yyyy} 00:00:00`;
  }

  // (Optional) If logs are already DD-MM-YYYY or DD-MM-YYYY HH:mm:ss, keep as-is
  const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmy) {
    const [, dd, mm, yyyy, hh = "00", mi = "00", ss = "00"] = dmy;
    return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
  }

  // Try to parse with Date()
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;

  // Format as DD-MM-YYYY HH:mm:ss in the requested timezone
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const get = (type) => parts.find((p) => p.type === type)?.value;

    const dd = get("day");
    const mm = get("month");
    const yyyy = get("year");
    const hh = get("hour");
    const mi = get("minute");
    const ss = get("second");

    if (!dd || !mm || !yyyy || !hh || !mi || !ss) return null;
    return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
  } catch {
    // Invalid timezone string -> return null
    return null;
  }
}

// ====== TESTS ======

// Test 1 (GOOD): date-only input
const input1 = "2026-01-19";
console.log("\nTest 1 (date-only input)");
console.log("Input :", input1);
console.log("Output:", toISODate(input1, "America/Toronto")); // "19-01-2026 00:00:00"

// Test 2 (GOOD): timestamp -> timezone date/time
const input2 = "2026-01-19T00:30:00Z";
console.log("\nTest 2 (timestamp -> timezone date/time)");
console.log("Input :", input2);
console.log("Output:", toISODate(input2, "America/Toronto")); // likely "18-01-2026 19:30:00" (depending on DST)

// Test 3 (BAD): invalid date string -> null
const input3 = "banana time";
console.log("\nTest 3 (invalid date)");
console.log("Input :", input3);
console.log("Output:", toISODate(input3, "UTC")); // null

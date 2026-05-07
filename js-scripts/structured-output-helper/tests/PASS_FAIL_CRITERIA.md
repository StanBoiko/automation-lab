# PASS / FAIL Criteria for Regression Cases

This file defines how regression tests are evaluated **before any tests are run**.

## Pass Criteria

A test **passes only if all of the following are true**:

- The helper returns valid structured output.
- `category` exactly matches the expected category.
- `priority` exactly matches the expected priority.
- `required_actions` includes the same intended actions as expected.
- Messy inputs do not crash the helper.
- Messy inputs still produce valid structured output.

## Fail Criteria

A test **fails if any of the following happen**:

- The helper crashes.
- Required fields are missing.
- `category` or `priority` are incorrect.
- `required_actions` are empty when actions are expected.
- Messy input produces invalid JSON or invalid structured output.

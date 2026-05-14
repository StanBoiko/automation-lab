# Agent Rules for Safe Automation

This file defines what an AI agent may do automatically, what requires human approval, and what it must never do.

## 1. Allowed without asking

The agent may do low-risk actions without human approval, such as:

- Read input data from approved sources.
- Clean or reformat text.
- Categorize records.
- Draft internal notes or summaries.
- Add status labels such as `Needs review`, `Processed`, or `Failed`.
- Log errors and processing results.
- Route unclear items to human review.
- Create draft outputs that are not sent externally.

## 2. Requires human approval

The agent must ask for human approval before doing any action that could affect real users, production data, money, access, or external communication.

Human approval is required before the agent may:

- Send emails or external messages.
- Reply to customers, candidates, vendors, or partners.
- Delete records, files, rows, tasks, or database entries.
- Edit production data.
- Update live workflows, production automations, or published content.
- Make API calls that change data in another system.
- Approve, reject, or finalize a business decision.
- Use or modify API keys, tokens, passwords, or credentials.
- Share information outside the approved system.

## 3. Never allowed

The agent must never:

- Send external messages without approval.
- Delete records permanently without approval.
- Modify production data without approval.
- Expose, print, store, or share API keys, tokens, or passwords.
- Bypass review rules.
- Treat weak, missing, or unverified evidence as final.
- Guess missing required information.
- Continue silently after an error.
- Hide failures from logs.
- Make irreversible changes without a human confirmation step.

## 4. Email and external message rules

The agent may draft emails or messages, but it must not send them automatically.

Before sending any external message, a human must review and approve:

- recipient
- subject
- message body
- attachments
- timing
- source data used to create the message

## 5. Production data rules

The agent may read production data only if access is approved.

The agent must not edit, overwrite, delete, or publish production data unless a human has reviewed and approved the exact change.

When uncertain, the agent must route the item to human review.

## 6. API key and credential rules

The agent must never display, log, expose, or share API keys, tokens, passwords, or secrets.

Credentials should only be stored in approved secure places such as environment variables, secret managers, or platform connection settings.

## 7. Examples

### Allowed action

The agent reads a support request, categorizes it as `Billing`, assigns priority as `Medium`, logs the result, and routes it to the correct internal queue.

### Blocked action

The agent reads a customer complaint and sends a reply email directly to the customer without human review.

This is blocked because external messages require human approval.

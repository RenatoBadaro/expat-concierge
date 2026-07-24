# Policy Specialist Agent Rules

## Role

Policy Specialist Agents are **internal advisors** within the V2 multi-agent architecture.  
They interpret scoped policy content on behalf of the Orchestrator.  
They **never speak directly to the user**.

---

## What They MUST Do

- Only use retrieved policy chunks already filtered by `policyAccessControlV2`
- Only use policies the user is authorized to access (`permissions.policiesAllowed`)
- Clearly separate **confirmed findings** from **assumptions**
- Flag all **missing information** that would affect the answer
- Flag **risk areas** relevant to the question and user profile
- Recommend **escalation** for sensitive topics (tax, immigration, payroll, exceptions)
- Return **structured output only** — no free-form prose intended for the user
- Set `eligibilitySignal` honestly: `supported | not_supported | unclear | needs_review`

---

## What They MUST NOT Do

- Bypass policy access scoping enforced by `policyAccessControlV2`
- Mix LTA / STA / IA / Commuter rules across different policy types
- Invent eligibility, amounts, dates, deadlines, or approval flows
- Override the Decision Engine or Confidence Engine outputs
- Expose internal agent reasoning directly to the user
- Generate final user-facing prose unless explicitly requested by the Orchestrator

---

## Output Contract

Every specialist agent must return this shape:

```json
{
  "agent": "<agentName>",
  "policyType": "<LTA|STA|IA|COMMUTER|GENERIC>",
  "answerGuidance": "<internal guidance string for the LLM>",
  "policyFindings": [],
  "eligibilitySignal": "<supported|not_supported|unclear|needs_review>",
  "missingInformation": [],
  "riskFlags": [],
  "recommendedEscalation": [],
  "sourceReferences": []
}
```

---

## Validation

The Chat Agent (`chatAgentV2.js`) validates specialist output before use:
- `agent` must be present
- `eligibilitySignal` must be present
- `riskFlags` must be an array
- `missingInformation` must be an array
- `policyType` must match the user's `assignmentType` (or be `GENERIC`)

If validation fails → fall back to `genericPolicyAgentV2` and lower confidence.

---

## Escalation Topics (always escalate)

| Topic | Team |
|---|---|
| Tax / equalization / withholding | Payroll & Tax Team |
| Immigration / visa / work permit | Global Mobility — Immigration |
| Payroll / compensation / salary | Payroll & Tax Team |
| Exceptions / waivers / approvals | Global Mobility Team |
| Social security / pension | Payroll & Tax Team |
| Legal / contract | Legal / HR |

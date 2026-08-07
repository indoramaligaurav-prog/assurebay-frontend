// Display-only labels for issueReason/subReason codes, used when we render
// a ticket without re-fetching the full eligibility response (e.g. list
// rows, or fallback if the eligibility call fails). The actual reason
// list + policy gating always comes live from the eligibility endpoint —
// this file never drives what options are shown, only how codes are labeled.

export const ISSUE_REASON_LABELS = {
  wrong_item: 'I received a different item',
  condition_mismatch: "The item's physical condition differs from the listing",
  missing_parts: 'Parts, quantity, or listed contents are missing',
  not_working: 'The item does not work as stated',
  damaged_in_delivery: 'The item was damaged during delivery',
  not_received: 'I did not receive the item',
  authenticity_safety: 'Authenticity, safety, or documentation concern'
};

export const DECISION_OPTIONS = [
  { value: 'return_refund', label: 'Approve return + refund', color: 'success' },
  { value: 'refund_only', label: 'Approve refund (no return)', color: 'success' },
  { value: 'replacement', label: 'Approve replacement', color: 'info' },
  { value: 'repair', label: 'Approve repair', color: 'info' },
  { value: 'declined', label: 'Decline', color: 'error' }
];

export const DECISION_LABELS = DECISION_OPTIONS.reduce((acc, d) => {
  acc[d.value] = d.label;
  return acc;
}, {});
// General categories — used only for tickets NOT tied to a specific order
// item. 'order_issue' is intentionally excluded here: those tickets can only
// be raised via the "Get help" button on an order item, which drives the
// dynamic, policy-aware reason picker instead (see raise-query-dialog.jsx).
export const SUPPORT_CATEGORY_OPTIONS = [
  { value: 'payment_issue', label: 'Payment / refund' },
  { value: 'product_issue', label: 'Product question' },
  { value: 'payout_issue', label: 'Payout / commission' },
  { value: 'account_issue', label: 'Account / KYC' },
  { value: 'technical', label: 'Technical problem' },
  { value: 'other', label: 'Something else' }
];

export const SUPPORT_CATEGORY_LABELS = {
  order_issue: 'Order issue',
  ...SUPPORT_CATEGORY_OPTIONS.reduce((acc, c) => {
    acc[c.value] = c.label;
    return acc;
  }, {})
};

export const SUPPORT_STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'awaiting_reply', label: 'Awaiting reply' },
  { value: 'awaiting_vendor_response', label: 'Awaiting you' },
  { value: 'awaiting_customer_decision', label: 'Awaiting customer' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

export const SUPPORT_STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  awaiting_reply: 'Awaiting reply',
  awaiting_vendor_response: 'Awaiting your response',
  awaiting_customer_decision: 'Awaiting customer',
  escalated: 'Escalated to wreeo',
  resolved: 'Resolved',
  closed: 'Closed'
};

export const SUPPORT_STATUS_CHIP_COLOR = {
  open: 'info',
  in_progress: 'warning',
  awaiting_reply: 'secondary',
  awaiting_vendor_response: 'warning',
  awaiting_customer_decision: 'secondary',
  escalated: 'error',
  resolved: 'success',
  closed: 'default'
};

export const ISSUE_DECISION_OPTIONS = [
  { value: 'return_refund', label: 'Approve return & refund' },
  { value: 'refund_only', label: 'Approve refund only (no return)' },
  { value: 'replacement', label: 'Approve replacement' },
  { value: 'repair', label: 'Approve repair' },
  { value: 'declined', label: 'Decline this claim' }
];

export const SUPPORT_RAISED_BY_ROLE_LABELS = {
  user: 'Customer',
  vendor: 'Vendor'
};

export const DECISIONS_BY_CONDITION = {
  NEW: ['return_refund', 'refund_only', 'replacement', 'declined'],
  REFURBISHED: ['return_refund', 'refund_only', 'replacement', 'repair', 'declined'],
  RECONDITIONED: ['return_refund', 'refund_only', 'replacement', 'repair', 'declined'],
  OVERHAULED: ['return_refund', 'refund_only', 'replacement', 'repair', 'declined'],
  USED: ['return_refund', 'refund_only', 'repair', 'declined'],
  AS_IS: ['refund_only', 'declined']
};
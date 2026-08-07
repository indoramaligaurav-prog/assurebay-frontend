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
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

export const SUPPORT_STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  awaiting_reply: 'Awaiting reply',
  resolved: 'Resolved',
  closed: 'Closed'
};

export const SUPPORT_STATUS_CHIP_COLOR = {
  open: 'info',
  in_progress: 'warning',
  awaiting_reply: 'secondary',
  resolved: 'success',
  closed: 'default'
};

export const SUPPORT_RAISED_BY_ROLE_LABELS = {
  user: 'Customer',
  vendor: 'Vendor'
};
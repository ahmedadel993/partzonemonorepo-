export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending:   "قيد المراجعة",
  Confirmed: "تم التأكيد",
  Shipped:   "في الطريق إليك",
  Delivered: "تم التوصيل",
  Cancelled: "ملغي",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending:   "bg-warning/15 text-warning",
  Confirmed: "bg-success/15 text-success",
  Shipped:   "bg-accent/15 text-accent",
  Delivered: "bg-success/20 text-success",
  Cancelled: "bg-danger/15 text-danger",
};

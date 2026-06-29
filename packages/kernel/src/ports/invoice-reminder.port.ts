export interface InvoiceReminderPort {
  schedule(params: {
    tenantId: string;
    invoiceId: string;
    remindAt: Date;
  }): Promise<void>;

  cancel(params: {
    tenantId: string;
    invoiceId: string;
  }): Promise<void>;
}

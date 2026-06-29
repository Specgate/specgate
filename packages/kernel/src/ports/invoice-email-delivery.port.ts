export interface InvoiceEmailDeliveryPort {
  send(params: {
    tenantId: string;
    invoiceId: string;
    recipientEmail: string;
  }): Promise<void>;
}

import { rechargeInvoiceStatus } from 'constants/enum-constants';
import { has } from 'utils/common-utils';

/* eslint-disable camelcase */
export type InvoiceType = {
  id: string;
  created: Date | string;
  orgName: string;
  orgID: string;
  orgAddress: string;
  vendorName: string;
  vendorAddress: string;
  vendorGST: string;
  vendorARN: string;
  vendorPAN: string;
  subTotal: number;
  sgstAmount: number;
  cgstAmount: number;
  igstAmount: number;
  utgstAmount: number;
  sbcAmount: number;
  kkcAmount: number;
  sgstPercentage: number;
  cgstPercentage: number;
  igstPercentage: number;
  utgstPercentage: number;
  sbcPercentage: number;
  kkcPercentage: number;
  totalInvoiceAmount: number;
  totalPayableAmount: number;
  currentPayableAmount: number;
  invoiceComponents: Array<{ credit_points: number, description: string, quantity: number }>;
  invoiceParts: {
    transaction_success: boolean,
    transaction_failed: boolean,
    sortedInvoice: Array<{any}>
  };
  status: string;
  statusCode: string;
  invoiceCategory: string;
  pdfInvoice: string;
  taxType: string,
  serviceTaxNumber: string,
  serviceTaxCategory: string,
  serviceTaxPercentage: number,
  serviceTaxAmount: number,
  adjustedFromAdvance: number,
  lineTotalAmount: number,
  discountAmount: number,
  discountPercentage: number,
  amountBeforeTax: number,
  gstStateCategory: string,
  tdsAmount: number,
  tdsPercentage: number,
  alreadyPaid: number,
  outstandingAmount: number,
}

export interface StateInterface {
  invoice: InvoiceType | null;
  dataLoading: boolean;
  payOnline: null;
  origin: any;
  status: any;
}

const getInvoiceParts = (invoice, paymentStatus) => {
  let sortedInvoice = [];
  sortedInvoice = invoice && invoice.sort(
    (a, b) => a.part_number < b.part_number,
  );
  const current_payable: {
    payment: {
      payable_amount: number,
      status: string
    },
    status: string
  } = sortedInvoice && sortedInvoice[0];
  const InvoiceParts: {
    transaction_success: boolean,
    transaction_failed: boolean,
    sortedInvoice: Array<{any}>
  } = {
    transaction_success: (paymentStatus === 'SU'),
    transaction_failed: (['FL', 'CN'].indexOf(paymentStatus) >= 0),
    sortedInvoice: sortedInvoice[0],
  };
  if (current_payable && current_payable.payment && current_payable.payment.payable_amount > 0 && current_payable.status === 'CR') {
    if (current_payable.payment.status === 'FL' || current_payable.payment.status === 'CN') {
      InvoiceParts.transaction_failed = true;
    } else {
      InvoiceParts.transaction_failed = false;
    }
    if (current_payable.payment.status === 'SU') {
      InvoiceParts.transaction_success = true;
    } else {
      InvoiceParts.transaction_success = false;
    }
    // viewData.current_payable_part = current_payable;
  }
  return InvoiceParts;
};

export const getInvoiceDetails = (data): InvoiceType => ({
  id: data.external_invoice_id || null,
  created: data.created || null,
  orgName: data.client_name || null,
  orgID: (has(data, 'organization.id') && data.organization.id) || null,
  orgAddress: data.client_address || null,
  vendorName: (has(data, 'vendor_info.vendor_name') && data.vendor_info.vendor_name) || 'Aasaanjobs Private Limited',
  vendorAddress: (has(data, 'vendor_info.vendor_address') && data.vendor_info.vendor_address) || '105, Powai Plaza, Hiranandani Gardens, Powai, Mumbai - 400076',
  vendorGST: (has(data, 'vendor_info.gst_reg_number') && data.vendor_info.gst_reg_number) || '27AANCA0282C1ZX',
  vendorARN: (has(data, 'vendor_info.arn_number') && data.vendor_info.arn_number) || 'AA2703171841909',
  vendorPAN: (has(data, 'vendor_info.pan_number') && data.vendor_info.pan_number) || 'AANCA0282C',
  subTotal: (data.total_credit_points) || null,
  sgstAmount: (has(data, 'post_gst_tax.sgst_amount') && data.post_gst_tax.sgst_amount) || 0,
  cgstAmount: (has(data, 'post_gst_tax.cgst_amount') && data.post_gst_tax.cgst_amount) || 0,
  igstAmount: (has(data, 'post_gst_tax.igst_amount') && data.post_gst_tax.igst_amount) || 0,
  utgstAmount: (has(data, 'post_gst_tax.ugst_amount') && data.post_gst_tax.ugst_amount) || 0,
  sbcAmount: (has(data, 'pre_gst_tax.sbc_amount') && data.pre_gst_tax.sbc_amount) || 0,
  kkcAmount: (has(data, 'pre_gst_tax.v') && data.pre_gst_tax.v) || 0,
  sgstPercentage: (has(data, 'post_gst_tax.sgst_perc') && data.post_gst_tax.sgst_perc) || 0,
  cgstPercentage: (has(data, 'post_gst_tax.cgst_perc') && data.post_gst_tax.cgst_perc) || 0,
  igstPercentage: (has(data, 'post_gst_tax.igst_perc') && data.post_gst_tax.igst_perc) || 0,
  utgstPercentage: (has(data, 'post_gst_tax.ugst_perc') && data.post_gst_tax.ugst_perc) || 0,
  sbcPercentage: (has(data, 'pre_gst_tax.sbc_perc') && data.pre_gst_tax.sbc_perc) || 0,
  kkcPercentage: (has(data, 'pre_gst_tax.kkc_perc') && data.pre_gst_tax.kkc_perc) || 0,
  totalInvoiceAmount: (data.total_invoice_amount) || null,
  totalPayableAmount: (data.total_payable_amount) || null,
  invoiceComponents: (data.invoice_components) || [],
  currentPayableAmount: (has(data, 'parent_payment.outstanding_amount') && data.parent_payment.outstanding_amount) || 0,
  invoiceParts: (data.invoice_parts
  && getInvoiceParts(data.invoice_parts, data.parent_payment.status))
  || [],
  status: rechargeInvoiceStatus[data.status] || 'Unpaid',
  statusCode: data.status || 'CR',
  invoiceCategory: data.invoice_category || 'IC_PR',
  pdfInvoice: data.pdf_tax || null,
  taxType: data.tax_type || 'POST_GST',
  serviceTaxNumber: (has(data, 'vendor_info.service_tax_reg_number') && data.vendor_info.service_tax_reg_number) || 'AANCA0282CSD002',
  serviceTaxCategory: (has(data, 'vendor_info.service_tax_category') && data.vendor_info.service_tax_category) || 'Manpower recruitment/supply agency service',
  serviceTaxPercentage: (has(data, 'pre_gst_tax.service_tax') && data.pre_gst_tax.service_tax) || 0,
  serviceTaxAmount: (has(data, 'pre_gst_tax.service_tax_amount') && data.pre_gst_tax.service_tax_amount) || 0,
  adjustedFromAdvance: data.adjusted_from_advance || 0,
  lineTotalAmount: data.line_total_amount || 0,
  discountAmount: data.discount_amount || 0,
  discountPercentage: data.discount_pct || 0,
  amountBeforeTax: data.amount_before_tax || 0,
  gstStateCategory: (has(data, 'post_gst_tax.gst_state_category') && data.post_gst_tax.gst_state_category),
  tdsAmount: data.tds_amount || 0,
  tdsPercentage: data.tds_perc || 0,
  alreadyPaid: (has(data, 'parent_payment.paid_amount') && data.parent_payment.paid_amount) || 0,
  outstandingAmount: (has(data, 'parent_payment.outstanding_amount') && data.parent_payment.outstanding_amount) || 0,
});

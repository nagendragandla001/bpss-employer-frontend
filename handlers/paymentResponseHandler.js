/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable camelcase */

const fetch = require('isomorphic-unfetch');

const PaymentResponseHandler = async (req, res) => {
  let paramSet = false;
  let redirectTo = '/employer-zone/my-plan/'; // Default redirection to the passbook page

  const params = { ...req.query };
  let { invoicePage, origin } = params;
  const { status } = params;

  const postobj = {
    gateway_response: (new URLSearchParams(req.body)).toString(),
    payment_success: status === 'success',
  };
  const url = `${process.env.API_ENDPOINT}api/v4/validate_payment/`;
  const apiCall = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(postobj),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (apiCall.status === 201) {
    const response = await apiCall.json();
    if (response) {
      let external_invoice_id = '';
      if (response.invoice && response.invoice.external_invoice_id) {
        external_invoice_id = response.invoice.external_invoice_id;
      }
      const { point_of_origin } = response;
      if (!invoicePage && external_invoice_id) {
        invoicePage = `/employer-zone/checkout/invoice/${external_invoice_id}/`;
      }
      if (!origin && point_of_origin) {
        origin = point_of_origin;
      }
      redirectTo = invoicePage;
      if (origin) {
        redirectTo += `?origin=${origin}`;
        paramSet = true;
      }
      if (status && !paramSet) {
        redirectTo += `?status=${status}`;
        paramSet = true;
      } else if (status && paramSet) {
        redirectTo += `&status=${status}`;
      }
    }
  } else if (invoicePage) {
    redirectTo = invoicePage;
    if (origin) {
      redirectTo += `?origin=${origin}`;
      paramSet = true;
    }
    redirectTo += `${paramSet ? '&' : '?'}status=failed`;
  }
  res.writeHead(301, {
    Location: redirectTo,
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  });
  res.send().end();
};
module.exports = PaymentResponseHandler;

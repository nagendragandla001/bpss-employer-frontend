/* eslint-disable react/no-danger */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import {
  Col, Row, Skeleton, Typography, Space, Button,
} from 'antd';
import Container from 'components/Layout/Container';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { getInvoice, payOnline } from 'service/organization-service';
import { CurrencyFormatter, NumberFormatter } from 'utils/common-utils';
import { getInvoiceDetails, StateInterface } from 'screens/authenticated/Invoice/Invoice.data';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import URLSearchParams from '@ungap/url-search-params';
import AppConstants from 'constants/constants';
import { logGtagEvent } from 'utils/analytics';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/Invoice/Invoice.component.less');

const { Paragraph, Text } = Typography;

const Invoice: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState<StateInterface>({
    invoice: null,
    dataLoading: true,
    payOnline: null,
    status: undefined,
    origin: undefined,
  });
  const {
    query: { id: invoiceID },
  } = router;

  const initData = async (): Promise<void> => {
    setState((prevState) => ({
      ...prevState,
      dataLoading: true,
    }));
    const apiResponse = await getInvoice(String(invoiceID).toUpperCase());
    if (apiResponse) {
      setState((prevState) => ({
        ...prevState,
        invoice: getInvoiceDetails(apiResponse),
        dataLoading: false,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        dataLoading: false,
      }));
    }
  };

  const getParams = async (fetchInvoice = false): Promise<any> => {
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams && urlParams.get('origin');
    const status = urlParams && urlParams.get('status');
    await setState((prevState) => ({
      ...prevState,
      status,
      origin,
    }));
    if (fetchInvoice) {
      await initData();
    }
    if (status === 'success') {
      pushClevertapEvent('Buy Plan', {
        Type: 'Payment Made',
      });
      logGtagEvent('plan_purchased_successfully');
    }
  };

  const submitToGateWay = (data): void => {
    // Create a new form element
    const paymentForm = document.createElement('form');

    // Set its
    paymentForm.setAttribute('method', 'post');
    paymentForm.setAttribute('style', 'display:none');
    paymentForm.setAttribute('action', data.payu_txn_url);

    for (const key in data && data) {
      if (data.hasOwnProperty(key) && key !== 'curl' && key !== 'surl' && key !== 'furl' && key !== 'payu_txn_url') {
        const hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'text');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', data[key]);
        paymentForm.appendChild(hiddenField);
      }
      if (key === 'curl' || key === 'furl' || key === 'surl') {
        const hField = document.createElement('input');
        hField.setAttribute('type', 'text');
        hField.setAttribute('name', key);

        // @@host set in "secrets.json"
        let status;
        if (key === 'curl') status = 'cancel';
        if (key === 'surl') status = 'success';
        if (key === 'furl') status = 'failed';

        hField.setAttribute('value', `${window.location.origin}/payment/response/?invoice_page=${window.location.pathname}&origin=${state.origin}&txn=current&status=${status}`);
        paymentForm.appendChild(hField);
      }
    }
    document.body.appendChild(paymentForm);
    paymentForm.submit();
  };

  const initiateResponse = async (): Promise<void> => {
    getParams();
    const postObj = {
      external_invoice_id: invoiceID,
      point_of_origin: state.origin,
    };
    const apiResponse = await payOnline(postObj);
    if (apiResponse) {
      pushClevertapEvent('Buy Plan', {
        Type: 'Pay Now',
        Status: 'S',
      });
      setState((prevState) => ({
        ...prevState,
        payOnline: apiResponse,
        dataLoading: false,
      }));
      submitToGateWay(apiResponse && apiResponse.initiate_response);
    } else {
      pushClevertapEvent('Buy Plan', {
        Type: 'Pay Now',
        Status: 'F',
      });
    }
  };

  useEffect(() => {
    getParams(true);
  }, []);

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Invoice Details | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Invoice Details | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      <div className="invoice-container">
        <Container>
          <Row>
            {state.dataLoading ? <Skeleton /> : (
              <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 4 }}>
                <Row>
                  <Col span={24} className="text-center">

                    {/* Not Paid */}
                    {state.invoice && !state.invoice.invoiceParts.transaction_success && !state.invoice.invoiceParts.transaction_failed && state.invoice.status !== 'Paid' ? (
                      <Space direction="vertical" size="small">
                        <Paragraph className="h5 text-semibold">Order Summary</Paragraph>
                        <Paragraph className="text-small" style={{ color: '#5b787c' }}>
                          Please view your order summary below and Proceed for Payment Gateway.
                        </Paragraph>
                      </Space>
                    ) : ''}

                    {/* Transaction Unsuccesfull */}
                    {state.invoice && !state.invoice.invoiceParts.transaction_success && state.invoice.invoiceParts.transaction_failed && (state.invoice.status !== 'Paid') ? (
                      <Space direction="vertical" size="small">
                        <Paragraph className="h5">
                          <Text type="danger" strong>Transaction Unsuccesfull</Text>
                        </Paragraph>
                        <Paragraph className="text-small" style={{ color: '#5b787c' }}>
                          Somthing went wrong with the transaction!
                        </Paragraph>
                      </Space>
                    ) : ''}

                    {/* Transaction successfull */}
                    {state.invoice && state.invoice.invoiceParts.transaction_success && !state.invoice.invoiceParts.transaction_failed && (state.invoice.status === 'Paid') ? (
                      <Space direction="vertical" size="small">
                        <Paragraph className="h5">
                          <Text type="success" strong>Transaction successfull</Text>
                        </Paragraph>
                        <Paragraph className="text-small" style={{ color: '#5b787c' }}>
                          Thank you for your order!
                        </Paragraph>
                      </Space>
                    ) : ''}

                    {/* Invoice Cancelled */}
                    {state.invoice && (['TBC', 'CL'].indexOf(state.invoice.statusCode) >= 0) ? (
                      <Space direction="vertical" size="small">
                        <Paragraph className="h5">
                          <Text type="danger" strong>Invoice Cancelled</Text>
                        </Paragraph>
                        <Paragraph className="text-small" style={{ color: '#5b787c' }}>
                          Somthing went wrong with the transaction!
                        </Paragraph>
                      </Space>
                    ) : ''}
                  </Col>
                </Row>

                {/* Main invoice */}
                <Row className="invoice-main">
                  <Col span="24">
                    <Paragraph
                      className="text-small"
                      style={{
                        color: '#5b787c',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Space>
                        {/* {state.invoice && state.invoice.id ? (
                          <Text className="text-semibold">
                            {`Invoice no. ${state.invoice.id}`}
                          </Text>
                        ) : ''} */}
                        {state.invoice && state.invoice.created ? (
                          <Text className="text-uppercase">
                            {dayjs(state.invoice.created).format('DD MMM, YYYY | h:mm A')}
                          </Text>
                        ) : null}
                      </Space>
                      {state.invoice && state.invoice.pdfInvoice ? (
                        <a
                          href={state.invoice.pdfInvoice}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base"
                        >
                          Download Invoice
                        </a>
                      ) : ''}
                    </Paragraph>
                  </Col>

                  {/* Billing Details */}
                  <Col span={12} className="text-small" style={{ marginTop: 16 }}>
                    <Paragraph>
                      Billed to
                    </Paragraph>
                    {state.invoice && state.invoice.orgName ? (
                      <Paragraph>
                        <Text className="text-medium">{state.invoice.orgName}</Text>
                      </Paragraph>
                    ) : ''}
                    {state.invoice && state.invoice.orgAddress ? (
                      <Paragraph style={{ color: '#5b787c' }}>
                        {state.invoice.orgAddress}
                      </Paragraph>
                    ) : ''}
                  </Col>

                  {/* Invoice Entries */}
                  <Col span={24}>
                    <Row className="invoice-header text-small">
                      <Col span={2} className="text-center">
                        Item
                      </Col>
                      <Col span={12}>
                        Description
                      </Col>
                      <Col span={2}>
                        Qty
                      </Col>
                      <Col span={4}>
                        Unit Price
                      </Col>
                      <Col span={4}>
                        Amount
                      </Col>
                    </Row>
                    {state.invoice && state.invoice.invoiceComponents
                  && state.invoice.invoiceComponents.map((entry, index) => (
                    <Row className="invoice-entry" key={entry.credit_points}>
                      <Col span={2} className="text-small text-center">
                        {index + 1}
                      </Col>
                      <Col span={12}>
                        <div
                          dangerouslySetInnerHTML={{ __html: entry.description }}
                        />
                        {/* {state.invoice && state.invoice.invoiceCategory === 'IC_PR' ? (
                          <Paragraph className="text-small">
                            <span>Qty 1</span>
                            {entry.credit_points ? (
                              <>
                                <span>&nbsp;|&nbsp;</span>
                                <span>
                                  {CurrencyFormatter(entry.credit_points, 2)}
                                </span>
                              </>
                            ) : ''}
                          </Paragraph>
                        ) : ''} */}
                      </Col>
                      <Col span={2}>{entry.quantity}</Col>
                      <Col span={4}>
                        {CurrencyFormatter(entry.credit_points, 2)}
                      </Col>
                      <Col span={4} className="text-semibold">
                        {CurrencyFormatter(entry.credit_points, 2)}
                      </Col>
                    </Row>
                  ))}
                  </Col>
                  <Col span={24}>
                    <Row className="invoice-others">
                      {/* Other Details */}
                      <Col span={11} className="text-small">
                        <Paragraph style={{ paddingBottom: 10 }}>
                          <Paragraph>
                            <span className="text-semibold">
                              {state.invoice && state.invoice.vendorName}
                            </span>
                          </Paragraph>
                          <Paragraph>
                            {state.invoice && state.invoice.vendorAddress}
                          </Paragraph>
                        </Paragraph>

                        {state.invoice && state.invoice.taxType === 'POST_GST' ? (

                        // POST GST
                          <>
                            <Paragraph style={{ paddingBottom: 10 }}>
                              <Paragraph><span className="text-semibold">GST Reg. Number</span></Paragraph>
                              <Paragraph>
                                {state.invoice && state.invoice.vendorGST}
                              </Paragraph>
                            </Paragraph>

                            <Paragraph style={{ paddingBottom: 10 }}>
                              <Paragraph><span className="text-semibold">ARN Number</span></Paragraph>
                              <Paragraph>
                                {state.invoice && state.invoice.vendorARN}
                              </Paragraph>
                            </Paragraph>

                            <Paragraph style={{ paddingBottom: 10 }}>
                              <Paragraph><span className="text-semibold">PAN</span></Paragraph>
                              <Paragraph>
                                {state.invoice && state.invoice.vendorPAN}
                              </Paragraph>
                            </Paragraph>
                          </>
                        ) : (
                        // PRE GST
                          <>
                            {/* Service Tax Number */}
                            <Paragraph style={{ paddingBottom: 10 }}>
                              <Paragraph>
                                <span className="text-semibold">Service Tax Number</span>
                              </Paragraph>
                              <Paragraph>
                                {state.invoice && state.invoice.serviceTaxNumber}
                              </Paragraph>
                            </Paragraph>

                            {/* Service Tax Category */}
                            <Paragraph style={{ paddingBottom: 10 }}>
                              <Paragraph>
                                <span className="text-semibold">Service Tax Category</span>
                              </Paragraph>
                              <Paragraph>
                                {state.invoice && state.invoice.serviceTaxCategory}
                              </Paragraph>
                            </Paragraph>
                          </>
                        )}
                      </Col>

                      {/* Total Calculation */}
                      <Col span={12} offset={1}>
                        {state.invoice && state.invoice.adjustedFromAdvance > 0 ? (
                          <>
                            {/* Total Amount */}
                            <Row style={{ marginBottom: 8 }}>
                              <Col span={16}>
                                Total Amount
                              </Col>
                              <Col span={8}>
                                {state.invoice && state.invoice.lineTotalAmount ? (
                                  CurrencyFormatter(state.invoice.lineTotalAmount, 2)
                                ) : 'NA'}
                              </Col>
                            </Row>

                            {/* Advance Adjustment */}
                            <Row style={{ marginBottom: 8 }}>
                              <Col span={16}>
                                Advance Adjustment
                              </Col>
                              <Col span={8}>
                                {state.invoice && state.invoice.adjustedFromAdvance ? (
                                  CurrencyFormatter(state.invoice.adjustedFromAdvance, 2)
                                ) : 'NA'}
                              </Col>
                            </Row>
                          </>
                        ) : ''}

                        {/* Sub Total */}
                        {state.invoice && state.invoice.subTotal ? (
                          <Row style={{ marginBottom: 8 }}>
                            <Col span={16}>
                              Sub-total
                            </Col>
                            <Col span={8}>
                              {CurrencyFormatter(state.invoice.subTotal, 2)}
                            </Col>
                          </Row>
                        ) : ''}

                        {/* Discount */}
                        {state.invoice && state.invoice.discountAmount > 0 ? (
                          <>
                            <Row style={{ marginBottom: 8 }}>
                              <Col span={16}>
                                {`Discount @ ${NumberFormatter(state.invoice.discountPercentage, 2)}%`}
                              </Col>
                              <Col span={8}>
                                {CurrencyFormatter(state.invoice.discountAmount, 2)}
                              </Col>
                            </Row>
                            <Row style={{ marginBottom: 8 }}>
                              <Col span={16}>
                                Amount Before Tax
                              </Col>
                              <Col span={8}>
                                {CurrencyFormatter(state.invoice.amountBeforeTax, 2)}
                              </Col>
                            </Row>
                          </>
                        ) : ''}

                        {state.invoice && state.invoice.taxType === 'POST_GST' ? (
                          <>

                            {/* Intra State Taxes */}
                            {state.invoice && state.invoice.gstStateCategory === 'INTRA' ? (
                              <>
                                {/* CGST */}
                                {state.invoice && state.invoice.cgstPercentage ? (
                                  <Row style={{ marginBottom: 8 }}>
                                    <Col span={16}>
                                      {`CGST @ ${NumberFormatter(state.invoice.cgstPercentage, 2)}%`}
                                    </Col>
                                    <Col span={8}>
                                      {CurrencyFormatter(state.invoice.cgstAmount, 2)}
                                    </Col>
                                  </Row>
                                ) : ''}

                                {/* SGST */}
                                {state.invoice && state.invoice.sgstPercentage ? (
                                  <Row style={{ marginBottom: 8 }}>
                                    <Col span={16}>
                                      {`CGST @ ${NumberFormatter(state.invoice.sgstPercentage, 2)}%`}
                                    </Col>
                                    <Col span={8}>
                                      {CurrencyFormatter(state.invoice.sgstAmount, 2)}
                                    </Col>
                                  </Row>
                                ) : ''}
                              </>
                            ) : ''}

                            {/* Inter State Taxes */}
                            {state.invoice && state.invoice.gstStateCategory === 'INTER' ? (
                              <>
                                {/* IGST */}
                                {state.invoice && state.invoice.igstPercentage ? (
                                  <Row style={{ marginBottom: 8 }}>
                                    <Col span={16}>
                                      {`IGST @ ${NumberFormatter(state.invoice.igstPercentage, 2)}%`}
                                    </Col>
                                    <Col span={8}>
                                      {CurrencyFormatter(state.invoice.igstAmount, 2)}
                                    </Col>
                                  </Row>
                                ) : ''}
                              </>
                            ) : ''}

                            {/* Union Territory Taxes */}
                            {state.invoice && state.invoice.gstStateCategory === 'UNION' ? (
                              <>
                                {/* CGST */}
                                {state.invoice && state.invoice.cgstPercentage ? (
                                  <Row style={{ marginBottom: 8 }}>
                                    <Col span={16}>
                                      {`CGST @ ${NumberFormatter(state.invoice.cgstPercentage, 2)}%`}
                                    </Col>
                                    <Col span={8}>
                                      {CurrencyFormatter(state.invoice.cgstAmount, 2)}
                                    </Col>
                                  </Row>
                                ) : ''}

                                {/* UTGST */}
                                {state.invoice && state.invoice.utgstPercentage ? (
                                  <Row style={{ marginBottom: 8 }}>
                                    <Col span={16}>
                                      {`UTGST @ ${NumberFormatter(state.invoice.utgstPercentage, 2)}%`}
                                    </Col>
                                    <Col span={8}>
                                      {CurrencyFormatter(state.invoice.utgstAmount, 2)}
                                    </Col>
                                  </Row>
                                ) : ''}
                              </>
                            ) : ''}
                          </>
                        ) : (
                          <>
                            {/* Pre GST */}
                            {/* Service Tax */}
                            {state.invoice && state.invoice.serviceTaxPercentage ? (
                              <Row style={{ marginBottom: 8 }}>
                                <Col span={16}>
                                  {`Service Tax @ ${NumberFormatter(state.invoice.serviceTaxPercentage, 2)}%`}
                                </Col>
                                <Col span={8}>
                                  {CurrencyFormatter(state.invoice.serviceTaxAmount, 2)}
                                </Col>
                              </Row>
                            ) : ''}

                            {/* SBC */}
                            {state.invoice && state.invoice.sbcPercentage ? (
                              <Row style={{ marginBottom: 8 }}>
                                <Col span={16}>
                                  {`SBC @ ${NumberFormatter(state.invoice.sbcPercentage, 2)}%`}
                                </Col>
                                <Col span={8}>
                                  {CurrencyFormatter(state.invoice.sbcAmount, 2)}
                                </Col>
                              </Row>
                            ) : ''}

                            {/* KKC */}
                            {state.invoice && state.invoice.kkcPercentage ? (
                              <Row style={{ marginBottom: 8 }}>
                                <Col span={16}>
                                  {`KKC @ ${NumberFormatter(state.invoice.kkcPercentage, 2)}%`}
                                </Col>
                                <Col span={8}>
                                  {CurrencyFormatter(state.invoice.kkcAmount, 2)}
                                </Col>
                              </Row>
                            ) : ''}
                          </>
                        )}

                        <Row>
                          <Col
                            span={24}
                            style={{
                              borderTop: '1px solid #d8dfe0',
                              paddingTop: 16,
                              marginTop: 8,
                            }}
                          />
                        </Row>

                        {/* Total Invoice Amount */}
                        {state.invoice && state.invoice.totalInvoiceAmount ? (
                          <Row style={{ marginBottom: 8 }}>
                            <Col span={16}>
                              Total Invoice Amount
                            </Col>
                            <Col span={8}>
                              {CurrencyFormatter(state.invoice.totalInvoiceAmount, 2)}
                            </Col>
                          </Row>
                        ) : ''}

                        {/* TDS */}
                        {state.invoice && state.invoice.tdsAmount > 0 ? (
                          <>
                            <Row style={{ marginBottom: 8 }}>
                              <Col span={16}>
                                {`Applicable TDS @ ${NumberFormatter(state.invoice.tdsPercentage, 2)}%`}
                              </Col>
                              <Col span={8}>
                                {CurrencyFormatter(state.invoice.tdsAmount, 2)}
                              </Col>
                            </Row>
                            <Row style={{ marginBottom: 8, color: '#5b787c' }}>
                              <Col span={16}>
                                Total Payable Amount
                              </Col>
                              <Col span={8}>
                                {CurrencyFormatter(state.invoice.totalPayableAmount, 2)}
                              </Col>
                            </Row>
                          </>
                        ) : ''}

                        {/* Already Paid */}
                        {state.invoice && state.invoice.alreadyPaid > 0 ? (
                          <>
                            <Row style={{ marginBottom: 8 }}>
                              <Col span={16}>
                                Already Paid
                              </Col>
                              <Col span={8}>
                                {CurrencyFormatter(state.invoice.alreadyPaid, 2)}
                              </Col>
                            </Row>
                            <Row style={{ marginBottom: 8, color: '#5b787c' }}>
                              <Col span={16}>
                                Outstanding Amount
                              </Col>
                              <Col span={8}>
                                {CurrencyFormatter(state.invoice.outstandingAmount, 2)}
                              </Col>
                            </Row>
                          </>
                        ) : ''}

                        {/* Current Payable */}
                        {state.invoice && state.invoice.currentPayableAmount > 0 ? (
                          <Row style={{ marginBottom: 8 }}>
                            <Col span={16}>
                              Current Installment
                              {(['CR', 'PP'].indexOf(state.invoice.statusCode) >= 0)
                                ? ' Payable' : ''}
                              {(state.invoice.status === 'Paid')
                                ? ' Paid' : ''}
                            </Col>
                            <Col span={8}>
                              {CurrencyFormatter(state.invoice.currentPayableAmount, 2)}
                            </Col>
                          </Row>
                        ) : ''}
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Pay Now */}
                <Row justify="center">
                  <Col span="12" className="text-center">
                    {state.invoice && (['CR', 'PP'].indexOf(state.invoice.statusCode) >= 0) ? (
                      <Paragraph>
                        <Button
                          type="primary"
                          className="text-semibold"
                          onClick={initiateResponse}
                          style={{
                            padding: '10px 90px',
                            borderRadius: 4,
                            marginBottom: 30,
                          }}
                        >
                          Pay Now
                        </Button>
                      </Paragraph>
                    ) : ''}
                    {state.invoice && state.invoice.status !== 'Unpaid' ? (
                      <Paragraph>
                        <Link href="myPlan" as="/employer-zone/my-plan/">
                          <Button
                            type="primary"
                            className="text-semibold"
                            style={{
                              padding: '10px 90px',
                              borderRadius: 4,
                              marginBottom: 30,
                            }}
                          >
                            Next
                          </Button>
                        </Link>
                      </Paragraph>
                    ) : ''}
                    <Paragraph
                      style={{ color: '#5b787c' }}
                      className="text-small"
                    >
                      {`In case of any queries, please mail us at
                      ${AppConstants.SUPPORT_MAIL} or use 'Can we Help?'
                      from the portal to raise a ticket`}
                    </Paragraph>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Invoice;

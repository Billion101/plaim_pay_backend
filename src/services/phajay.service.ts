import axios from 'axios';
import crypto from 'crypto';

interface PhajayPaymentRequest {
    orderId: string;
    amount: number;
    customerPhone: string;
    customerName: string;
    description: string;
}

interface PhajayPaymentResponse {
    transactionId: string;
    paymentUrl: string;
    qrCode?: string;
}

const PHAJAY_API_URL = 'https://payment-gateway.phajay.co/v1/api/link/payment-link';
const PHAJAY_SECRET_KEY = "$2b$10$.EVKRSsallj4vURSWsDey.9Z7rFPu.l4LcaJmRqKjDk6tZUaOfLN2";

export const createPhajayPayment = async (
    paymentData: PhajayPaymentRequest
): Promise<PhajayPaymentResponse> => {
    try {
        if (!PHAJAY_SECRET_KEY) {
            throw new Error('PHAJAY_SECRET_KEY is not configured in .env file');
        }

        console.log('Creating PhajayPay payment...');
        console.log('Secret Key present:', !!PHAJAY_SECRET_KEY);

        const requestData = {
            order_id: paymentData.orderId,
            amount: paymentData.amount,
            currency: 'LAK',
            customer_phone: paymentData.customerPhone,
            customer_name: paymentData.customerName,
            description: paymentData.description,
            callback_url: `${process.env.APP_URL}/api/orders/webhook/phajay`,
            return_url: `${process.env.APP_URL}/payment/success`
        };

        console.log('Request data:', JSON.stringify(requestData, null, 2));

        // Encode secret key to base64 for Basic Auth
        const base64Key = Buffer.from(PHAJAY_SECRET_KEY).toString('base64');

        const response = await axios.post(
            PHAJAY_API_URL,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${base64Key}`
                }
            }
        );

        console.log('PhajayPay full response:', JSON.stringify(response.data, null, 2));

        // Map response fields - PhajayPay uses redirectURL
        const transactionId = response.data.transaction_id ||
            response.data.id ||
            response.data.transactionId ||
            response.data.reference ||
            paymentData.orderId; // Fallback to our order ID

        const paymentUrl = response.data.redirectURL ||
            response.data.redirect_url ||
            response.data.payment_url ||
            response.data.link ||
            response.data.paymentUrl ||
            response.data.url;

        const qrCode = response.data.qr_code ||
            response.data.qrCode ||
            response.data.qr;

        console.log('Mapped values:');
        console.log('- Transaction ID:', transactionId);
        console.log('- Payment URL:', paymentUrl);
        console.log('- QR Code:', qrCode ? 'Present' : 'Not present');

        if (!paymentUrl) {
            console.error('Warning: No payment URL found in response');
            console.error('Available fields:', Object.keys(response.data));
        }

        return {
            transactionId: transactionId || '',
            paymentUrl: paymentUrl || '',
            qrCode: qrCode
        };
    } catch (error: any) {
        console.error('PhajayPay error details:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        throw new Error(`Failed to create payment with PhajayPay: ${error.response?.data?.message || error.message}`);
    }
};

export const verifyPhajayWebhook = (payload: any, signature: string): boolean => {
    try {
        if (!PHAJAY_SECRET_KEY) {
            console.error('PHAJAY_SECRET_KEY is not configured');
            return false;
        }

        const payloadString = JSON.stringify(payload);
        const calculatedSignature = crypto
            .createHmac('sha256', PHAJAY_SECRET_KEY)
            .update(payloadString)
            .digest('hex');

        return calculatedSignature === signature;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
};

export const checkPaymentStatus = async (transactionId: string) => {
    try {
        if (!PHAJAY_SECRET_KEY) {
            throw new Error('PHAJAY_SECRET_KEY is not configured in .env file');
        }

        const base64Key = Buffer.from(PHAJAY_SECRET_KEY).toString('base64');

        const response = await axios.get(
            `https://payment-gateway.phajay.co/v1/api/payment/status/${transactionId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${base64Key}`
                }
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('PhajayPay status check error:', error.response?.data || error.message);
        throw new Error('Failed to check payment status');
    }
};

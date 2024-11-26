import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Invoices.css';

const apiURL = import.meta.env.VITE_API_URL;


function Invoices() {
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [purchaseInvoices, setPurchaseInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
          try {
            // Fetch each endpoint sequentially
            const salesResponse = await fetch(`${apiURL}/invoices?type=sales`);
            const salesResult = await salesResponse.json();
            console.log('Sales Result:', salesResult);
            setSalesInvoices(salesResult);
      
            const purchaseResponse = await fetch(`${apiURL}/invoices?type=purchase`);
            const purchaseResult = await purchaseResponse.json();
            setPurchaseInvoices(purchaseResult);
      
            const customersResponse = await fetch(`${apiURL}/customers`);
            const customersResult = await customersResponse.json();
            setCustomers(customersResult);
      
            const vendorsResponse = await fetch(`${apiURL}/vendors`);
            const vendorsResult = await vendorsResponse.json();
            setVendors(vendorsResult);
      
            setLoading(false);
          } catch (err) {
            console.error('Fetch Error:', err);
            setError(err);
            setLoading(false);
          }
        };
      
        fetchData();
      }, []);

      
    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c._id === customerId);
        return customer ? `${customer.name}` : 'Unknown Customer';
    };

    const getCustomerMobileNo = (customerId) => {
        const customer = customers.find(c => c._id === customerId);
        return customer ? `${customer.mobileNo}` : 'N/A';
    };

    const getCustomerCompany = (customerId) => {
        const customer = customers.find(c => c._id === customerId);
        return customer ? `${customer.company}` : 'N/A';
    };

    const getCustomerCashType = (customerId) => {
        const customer = customers.find(c => c._id === customerId);
        return customer ? `${customer.cashType}` : 'Cash';
    };

    const getVendorName = (vendorId) => {
        const vendor = vendors.find(v => v._id === vendorId);
        return vendor ? `${vendor.name}` : 'Unknown Vendor';
    };

    const getVendorMobileNo = (vendorId) => {
        const vendor = vendors.find(v => v._id === vendorId);
        return vendor ? `${vendor.mobileNo}` : 'N/A';
    };

    const getVendorCompany = (vendorId) => {
        const vendor = vendors.find(v => v._id === vendorId);
        return vendor ? `${vendor.company}` : 'N/A';
    };

    const getVendorCashType = (vendorId) => {
        const vendor = vendors.find(v => v._id === vendorId);
        return vendor ? `${vendor.cashType}` : 'Cash';
    };

    const handleDownload = async (invoiceId) => {
        try {
            const response = await axios({
                url: `${apiURL}/invoices/download/${invoiceId}`,
                method: 'GET',
                responseType: 'blob',
            });

            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', `invoice-${invoiceId}.pdf`);
            document.body.appendChild(fileLink);
            fileLink.click();
            document.body.removeChild(fileLink);
        } catch (err) {
            alert('Error downloading invoice:', err);
        }
    };

    const handlePrint = (invoice) => {
        const printWindow = window.open('', '_blank');

        const printContent = `
    <html>
    <head>
        <title>Invoice</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-container { margin: 0 auto; padding: 20px; max-width: 800px; }
            .invoice-container h1 { text-align: center; }
            .invoice-container h3 { margin-top: 30px; }
            .invoice-table { width: 100%; border-collapse: collapse; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .invoice-table th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: end; }
            .totals p { font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <h1>Invoice</h1>
            <p><strong>Invoice ID:</strong> ${invoice._id.replace(/[^0-9]/g, '').slice(-3)}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>${invoice.customerId ? 'Customer' : 'Vendor'}:</strong> 
                ${invoice.customerId ? getCustomerName(invoice.customerId) : getVendorName(invoice.vendorId)}
            </p>
            <p><strong>Mobile No:</strong> 
                ${invoice.customerId ? getCustomerMobileNo(invoice.customerId) : getVendorMobileNo(invoice.vendorId)}
            </p>
            <p><strong>Company:</strong> 
                ${invoice.customerId ? getCustomerCompany(invoice.customerId) : getVendorCompany(invoice.vendorId)}
            </p>
            <p><strong>Cash Type:</strong> 
                ${invoice.customerId ? getCustomerCashType(invoice.customerId) : getVendorCashType(invoice.vendorId)}
            </p>
            <h3>Items:</h3>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.products.map(product => `
                        <tr>
                            <td>${product.productName}</td>
                            <td>${product.description}</td>
                            <td>${product.quantity}</td>
                            <td>${product.price}</td>
                            <td>${(product.price * product.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="totals">
                <p><strong>Total Amount:</strong> ${invoice.totalAmount}</p>
                <p><strong>Paid Amount:</strong> ${invoice.paidAmount}</p>
            </div>
        </div>
    </body>
    </html>`

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <div className="invoices-container">
            {loading && <div className='loading'>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!loading && !error && (
                <div className="combineInvoice">
                    <div className="invoice-section invoice-section-left">
                        <h2>Sales Invoices</h2>
                        <ul>
                            {Array.isArray(salesInvoices) &&
                                salesInvoices.map((invoice) => (
                                    <li key={invoice._id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            Invoice ID: {invoice._id.replace(/[^0-9]/g, '').slice(-3)} - Customer Name: {getCustomerName(invoice.customerId)} - Amount: {invoice.totalAmount}
                                            <button onClick={() => handleDownload(invoice._id)}>
                                                PDF
                                            </button>
                                            <button onClick={() => handlePrint(invoice)}>
                                                Print
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <div className="invoice-section invoice-section-right">
                        <h2>Purchase Invoices</h2>
                        <ul>
                            {Array.isArray(purchaseInvoices) &&
                                purchaseInvoices.map((invoice) => (
                                    <li key={invoice._id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            Invoice ID: {invoice._id.replace(/[^0-9]/g, '').slice(-3)} - Vendor Name: {getVendorName(invoice.vendorId)} - Amount: {invoice.totalAmount}
                                            <button onClick={() => handleDownload(invoice._id)}>
                                                PDF
                                            </button>
                                            <button onClick={() => handlePrint(invoice)}>
                                                Print
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Invoices;

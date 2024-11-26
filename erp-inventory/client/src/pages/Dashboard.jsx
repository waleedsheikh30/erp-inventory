import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../App.css';

Chart.register(...registerables);

const apiURL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          salesResult,
          purchaseResult,
          productsResult,
          customersResult,
          vendorsResult
        ] = await Promise.all([
          axios.get(`${apiURL}/invoices?type=sales`),
          axios.get(`${apiURL}/invoices?type=purchase`),
          axios.get(`${apiURL}/products`),
          axios.get(`${apiURL}/customers`),
          axios.get(`${apiURL}/vendors`)
        ]);

        // console.log('Sales Result:', salesResult.data); // Log the result of sales API
        // console.log('Purchase Result:', purchaseResult.data);
        // console.log('Products Result:', productsResult.data);
        // console.log('Customers Result:', customersResult.data);
        // console.log('Vendors Result:', vendorsResult.data);

        setSalesInvoices(Array.isArray(salesResult.data) ? salesResult.data : []);
        setPurchaseInvoices(Array.isArray(purchaseResult.data) ? purchaseResult.data : []);
        setProducts(Array.isArray(productsResult.data) ? productsResult.data : []);
        setCustomers(Array.isArray(customersResult.data) ? customersResult.data : []);
        setVendors(Array.isArray(vendorsResult.data) ? vendorsResult.data : []);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="container">Error: {error.message}</div>;

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    return customer ? customer.name : 'Unknown Customer';
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
        responseType: 'blob', // Important for handling the response as a file
      });

      // Create a URL for the file
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

  const salesData = {
    labels: Array.isArray(salesInvoices) ? salesInvoices.map((invoice, index) => `Invoice ${index + 1}`) : [],
    datasets: [
      {
        label: 'Sales',
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        data: Array.isArray(salesInvoices) ? salesInvoices.map(invoice => invoice.totalAmount) : [],
      },
    ],
  };


  const purchaseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Purchases',
        backgroundColor: 'rgba(153,102,255,0.2)',
        borderColor: 'rgba(153,102,255,1)',
        data: purchaseInvoices.map(invoice => invoice.totalAmount),
      },
    ],
  };

  const doughnutData = {
    labels: ['Sales', 'Purchases'],
    datasets: [
      {
        data: [
          salesInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0),
          purchaseInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0)
        ],
        backgroundColor: ['rgba(75,192,192,0.4)', 'rgba(153,102,255,0.4)'],
        borderColor: ['rgba(75,192,192,1)', 'rgba(153,102,255,1)'],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: 'white', // Color of the legend labels
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'gray', // Color of the x-axis labels
        },
      },
      y: {
        ticks: {
          color: 'gray', // Color of the y-axis labels
        },
      },
    },
  };

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank');

    const printContent = 
<html>
<head>
    <title>Invoice</title>
    <style>
        body { "font-family: Arial, sans-serif; padding: 20px;" }
        .invoice-container { "margin: 0 auto; padding: 20px; max-width: 800px;" }
        .invoice-container h1 { "text-align: center;" }
        .invoice-container h3 { "margin-top: 30px;" }
        .invoice-table { "width: 100%; border-collapse: collapse; "}
        .invoice-table th, .invoice-table td { "border: 1px solid #ddd; padding: 8px; text-align: left;" }
        .invoice-table th { "background-color: #f2f2f2;" }
        .totals { "margin-top: 20px; text-align: end;" }
        .totals p { "font-size: 18px;" }
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
                ${invoice.products.map(product => 
                    <tr>
                        <td>${product.productName}</td>
                        <td>${product.description}</td>
                        <td>${product.quantity}</td>
                        <td>${product.price}</td>
                        <td>${(product.price * product.quantity)}</td>
                    </tr>
                ).join('')}
            </tbody>
        </table>
        <div class="totals">
            <p><strong>Total Amount:</strong> ${invoice.totalAmount}</p>
            <p><strong>Paid Amount:</strong> ${invoice.paidAmount}</p>
        </div>
    </div>
</body>
</html>;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div>
      <div className="container">
        <div className='row'>
          <div className="card">
            <h3>Sales Overview</h3>
            <div className="chart-container">
              <Bar data={salesData} options={options} />
            </div>
          </div>
          <div className="card">
            <h3>Purchases Overview</h3>
            <div className="chart-container">
              <Line data={purchaseData} options={options} />
            </div>
          </div>
        </div>

        <div className='row2'>
          <div className="invoiceCard">
            <h3>Invoices</h3>
            <ul>
              {Array.isArray(salesInvoices) && salesInvoices.slice(0, 5).map(invoice => (
                <li className="list-item" key={invoice._id}>
                  <div>
                    Name: {getCustomerName(invoice.customerId)} - ID: {invoice._id.replace(/[^0-9]/g, '').slice(-3)} - Amount: {invoice.totalAmount}
                  </div>
                  <button onClick={() => handleDownload(invoice._id)}>PDF</button>
                  <button onClick={() => handlePrint(invoice)}>Print</button>

                </li>
              ))}
            </ul>
            <a className="view-more" href='/invoices'>View all invoices</a>
          </div>

          <div className="invoiceCard">
            <h3>Sales vs Purchases</h3>
            <div className="doughnut-chart-container">
              <Doughnut data={doughnutData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
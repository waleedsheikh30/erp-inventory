import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import '../App.css'

function Navbar() {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="main">
            <div className="navbar">
                <h2>ERP Management System</h2>
                <a href="/">Dashboard</a>
                <div className="dropdown">
                    <button className="dropbtn" onClick={toggleDropdown}>
                        Invoices
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            <a href="/invoices">All Invoices</a>
                            <a href="/sales">Create Sales Invoice</a>
                            <a href="/purchase">Create Purchase Invoice</a>
                        </div>
                    )}
                </div>
                <div className="dropdown">
                    <button className="dropbtn" onClick={toggleDropdown}>
                        Products
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            <a href="/stock">All Products</a>
                            <a href="/add-product">Add New Product</a>
                        </div>
                    )}
                </div>
                <div className="dropdown">
                    <button className="dropbtn" onClick={toggleDropdown}>
                        Customers
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            <a href="/customer-management">All Customers</a>
                            <a href="/add-customer">Add New Customer</a>
                        </div>
                    )}
                </div>
                <div className="dropdown">
                    <button className="dropbtn" onClick={toggleDropdown}>
                        Vendors
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            <a href="/vendor-management">All Vendors</a>
                            <a href="/add-vendor">Add New Vendor</a>
                        </div>
                    )}
                </div>
            </div>
            <div className="content">
                <Outlet /> {/* This will render the matched child route component */}
            </div>
        </div>
    )
}

export default Navbar
import React, { useState } from 'react';

function CustomerForm({ customer, onSave, onCancel }) {
  const [formData, setFormData] = useState({ ...customer });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>
      <div>
        <label>Total Payable:</label>
        <input type="number" name="totalPayable" value={formData.totalPayable} onChange={handleChange} />
      </div>
      <div>
        <label>Total Paid:</label>
        <input type="number" name="totalPaid" value={formData.totalPaid} onChange={handleChange} />
      </div>
      <div>
        <label>Remaining:</label>
        <input type="number" name="remaining" value={formData.remaining} onChange={handleChange} />
      </div>
      <div>
        <label>Status:</label>
        <input type="text" name="status" value={formData.status} onChange={handleChange} />
      </div>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default CustomerForm;

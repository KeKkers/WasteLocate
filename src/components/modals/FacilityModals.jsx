import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const facilityFields = [
  { label: 'Facility Name *', key: 'name', type: 'text', colSpan: false },
  { label: 'Permit Number *', key: 'permit_number', type: 'text' },
  { label: 'Operator Name', key: 'operator_name', type: 'text', fullWidth: true },
  { label: 'Address', key: 'address_line1', type: 'text', fullWidth: true },
  { label: 'City', key: 'city', type: 'text' },
  { label: 'Postcode *', key: 'postcode', type: 'text' },
  { label: 'Phone', key: 'phone', type: 'tel' },
  { label: 'Email', key: 'email', type: 'email' },
];

export function AddFacilityModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '', permit_number: '', operator_name: '',
    address_line1: '', city: '', postcode: '', phone: '', email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.permit_number || !formData.postcode) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('facilities').insert([formData]);

    if (error) {
      alert('Error adding facility: ' + error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Facility</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {facilityFields.map(({ label, key, type, fullWidth }) =>
              fullWidth ? null : (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input
                    type={type}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                  />
                </div>
              )
            )}
          </div>
          {facilityFields.filter(f => f.fullWidth).map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
              <input
                type={type}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          ))}
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'Adding...' : 'Add Facility'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditFacilityModal({ facility, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: facility.name || '',
    permit_number: facility.permit_number || '',
    operator_name: facility.operator_name || '',
    address_line1: facility.address_line1 || '',
    city: facility.city || '',
    postcode: facility.postcode || '',
    phone: facility.phone || '',
    email: facility.email || '',
    status: facility.status || 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.permit_number || !formData.postcode) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('facilities').update(formData).eq('id', facility.id);

    if (error) {
      alert('Error updating facility: ' + error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Facility</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['name', 'permit_number', 'city', 'postcode', 'phone', 'email'].map(key => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                  {key.replace('_', ' ')}{['name', 'permit_number', 'postcode'].includes(key) ? ' *' : ''}
                </label>
                <input
                  type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Operator Name</label>
            <input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input type="text" value={formData.address_line1} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? 'Updating...' : 'Update Facility'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

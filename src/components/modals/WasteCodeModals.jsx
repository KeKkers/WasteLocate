import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const WasteCodeFormFields = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
      <textarea
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Any special requirements or conditions..."
        rows="3"
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Max Volume</label>
        <input
          type="number"
          step="0.01"
          value={formData.max_volume}
          onChange={(e) => setFormData({ ...formData, max_volume: e.target.value })}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
        <select
          value={formData.volume_unit}
          onChange={(e) => setFormData({ ...formData, volume_unit: e.target.value })}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="tonnes">Tonnes</option>
          <option value="cubic meters">Cubic Meters</option>
          <option value="loads">Loads</option>
        </select>
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Tonne (£)</label>
      <input
        type="number"
        step="0.01"
        value={formData.price_per_unit}
        onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
);

// Used in admin panel
export function AddWasteCodeModal({ facility, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ewc_code: '', notes: '', max_volume: '', volume_unit: 'tonnes', price_per_unit: '', currency: 'GBP'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.ewc_code) {
      alert('Please enter an EWC code');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('facility_waste_codes')
      .insert([{
        facility_id: facility.id,
        ...formData,
        max_volume: formData.max_volume ? parseFloat(formData.max_volume) : null,
        price_per_unit: formData.price_per_unit ? parseFloat(formData.price_per_unit) : null
      }]);

    if (error) {
      alert('Error adding waste code: ' + error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add Waste Code to {facility.name}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">EWC Code *</label>
            <input
              type="text"
              value={formData.ewc_code}
              onChange={(e) => setFormData({ ...formData, ewc_code: e.target.value })}
              placeholder="e.g., 17 01 01"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
          <WasteCodeFormFields formData={formData} setFormData={setFormData} />
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'Adding...' : 'Add Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddWasteCodeModal;

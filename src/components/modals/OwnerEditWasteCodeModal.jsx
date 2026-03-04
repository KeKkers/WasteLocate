import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function OwnerEditWasteCodeModal({ code, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    notes: code.notes || '',
    max_volume: code.max_volume || '',
    volume_unit: code.volume_unit || 'tonnes',
    price_per_unit: code.price_per_unit || '',
    currency: code.currency || 'GBP'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('facility_waste_codes')
        .update({
          notes: formData.notes.trim() || null,
          max_volume: formData.max_volume ? parseFloat(formData.max_volume) : null,
          volume_unit: formData.volume_unit,
          price_per_unit: formData.price_per_unit ? parseFloat(formData.price_per_unit) : null,
          currency: formData.currency
        })
        .eq('id', code.id);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error updating waste code:', error);
      alert('Error updating waste code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Waste Code</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">EWC Code</label>
            <p className="px-4 py-2 bg-gray-100 rounded-lg font-mono font-bold text-gray-800">{code.ewc_code}</p>
            <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
          </div>
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
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

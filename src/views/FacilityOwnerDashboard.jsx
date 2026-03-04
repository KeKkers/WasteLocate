import React, { useState, useEffect } from 'react';
import { Home, Building2, Edit2, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerAddWasteCodeModal from '../components/modals/OwnerAddWasteCodeModal';
import OwnerEditWasteCodeModal from '../components/modals/OwnerEditWasteCodeModal';

export default function FacilityOwnerDashboard({ user, userProfile, onBack }) {
  const [myFacilities, setMyFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [wasteCodes, setWasteCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFacility, setEditingFacility] = useState(false);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [facilityForm, setFacilityForm] = useState({});

  useEffect(() => {
    if (user) loadMyFacility();
  }, [user]);

  const loadMyFacility = async () => {
    setLoading(true);
    try {
      const { data: facilityData, error: facilityError } = await supabase
        .from('facilities')
        .select('*')
        .eq('owner_id', user.id)
        .order('name');

      console.log('Loaded facilities:', facilityData);

      if (facilityError) throw facilityError;

      if (!facilityData || facilityData.length === 0) {
        setMyFacilities([]);
        setSelectedFacility(null);
      } else {
        setMyFacilities(facilityData);
        if (facilityData.length === 1 || !selectedFacility) {
          handleSelectFacility(facilityData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading facilities:', error);
      alert('Error loading your facilities: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility);
    setFacilityForm(facility);
    loadWasteCodes(facility.id);
  };

  const loadWasteCodes = async (facilityId) => {
    const { data, error } = await supabase
      .from('facility_waste_codes')
      .select('*')
      .eq('facility_id', facilityId)
      .order('ewc_code');

    if (error) {
      console.error('Error loading waste codes:', error);
    } else {
      setWasteCodes(data || []);
    }
  };

  const updateFacility = async () => {
    try {
      const { error } = await supabase
        .from('facilities')
        .update({
          name: facilityForm.name,
          operator_name: facilityForm.operator_name,
          address_line1: facilityForm.address_line1,
          address_line2: facilityForm.address_line2,
          city: facilityForm.city,
          postcode: facilityForm.postcode,
          phone: facilityForm.phone,
          email: facilityForm.email,
          website: facilityForm.website
        })
        .eq('id', selectedFacility.id);

      if (error) throw error;

      alert('Facility updated successfully!');
      setEditingFacility(false);
      loadMyFacility();
    } catch (error) {
      console.error('Error updating facility:', error);
      alert('Error updating facility: ' + error.message);
    }
  };

  const deleteWasteCode = async (codeId) => {
    if (!confirm('Are you sure you want to remove this waste code?')) return;

    const { error } = await supabase
      .from('facility_waste_codes')
      .delete()
      .eq('id', codeId);

    if (error) {
      alert('Error deleting waste code: ' + error.message);
    } else {
      loadWasteCodes(selectedFacility.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your facility...</p>
        </div>
      </div>
    );
  }

  if (myFacilities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors mb-6">
            <Home className="w-5 h-5" />Back
          </button>
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Facilities Assigned</h2>
            <p className="text-gray-600">You don't have any facilities assigned to your account yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { label: 'Facility Name', key: 'name', type: 'text' },
    { label: 'Operator Name', key: 'operator_name', type: 'text' },
    { label: 'Address Line 1', key: 'address_line1', type: 'text', colSpan: false },
    { label: 'Address Line 2', key: 'address_line2', type: 'text' },
    { label: 'City', key: 'city', type: 'text' },
    { label: 'Postcode', key: 'postcode', type: 'text', uppercase: true },
    { label: 'Phone', key: 'phone', type: 'tel' },
    { label: 'Email', key: 'email', type: 'email' },
    { label: 'Website', key: 'website', type: 'url', placeholder: 'https://' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors">
              <Home className="w-5 h-5" />Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Facilities Dashboard</h1>
              <p className="text-gray-600">Manage your facility information and waste codes</p>
            </div>
          </div>
        </div>

        {/* Facility Selector */}
        {myFacilities.length > 1 && (
          <div className="bg-white rounded-lg shadow-xl p-4 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Facility to Manage</label>
            <select
              value={selectedFacility?.id || ''}
              onChange={(e) => {
                const facility = myFacilities.find(f => f.id === e.target.value);
                if (facility) handleSelectFacility(facility);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            >
              {myFacilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} - {facility.permit_number}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Facility Information */}
        {selectedFacility && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Facility Information</h2>
              {!editingFacility ? (
                <button onClick={() => setEditingFacility(true)} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />Edit Details
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={updateFacility} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Save className="w-4 h-4" />Save Changes
                  </button>
                  <button
                    onClick={() => { setEditingFacility(false); setFacilityForm(selectedFacility); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Permit number - read only */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Permit Number</label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 font-mono">{selectedFacility.permit_number}</p>
                <p className="text-xs text-gray-500 mt-1">Contact admin to change permit number</p>
              </div>

              {fields.map(({ label, key, type, placeholder, uppercase }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  {editingFacility ? (
                    <input
                      type={type}
                      value={facilityForm[key] || ''}
                      onChange={(e) => setFacilityForm({ ...facilityForm, [key]: uppercase ? e.target.value.toUpperCase() : e.target.value })}
                      placeholder={placeholder || ''}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{selectedFacility[key] || '-'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waste Codes */}
        {selectedFacility && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Accepted Waste Codes</h2>
                <p className="text-sm text-gray-600 mt-1">Manage the EWC codes your facility can accept</p>
              </div>
              <button
                onClick={() => setShowAddCodeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />Add Waste Code
              </button>
            </div>

            {wasteCodes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No waste codes added yet</p>
                <p className="text-sm text-gray-500">Add waste codes to let users know what waste you can accept</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {wasteCodes.map(code => (
                  <div key={code.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-mono font-bold text-lg text-gray-800">{code.ewc_code}</p>
                        {code.notes && <p className="text-sm text-gray-600 mt-1">{code.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingCode(code)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteWasteCode(code.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      {code.max_volume && (
                        <div className="bg-blue-50 px-3 py-2 rounded">
                          <p className="text-xs text-gray-600">Max Volume</p>
                          <p className="font-semibold text-gray-800">{code.max_volume} {code.volume_unit}</p>
                        </div>
                      )}
                      {code.price_per_unit && (
                        <div className="bg-green-50 px-3 py-2 rounded">
                          <p className="text-xs text-gray-600">Price</p>
                          <p className="font-semibold text-gray-800">£{code.price_per_unit}/tonne</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddCodeModal && selectedFacility && (
        <OwnerAddWasteCodeModal
          facilityId={selectedFacility.id}
          onClose={() => setShowAddCodeModal(false)}
          onSuccess={() => { setShowAddCodeModal(false); loadWasteCodes(selectedFacility.id); }}
        />
      )}

      {editingCode && (
        <OwnerEditWasteCodeModal
          code={editingCode}
          onClose={() => setEditingCode(null)}
          onSuccess={() => { setEditingCode(null); loadWasteCodes(selectedFacility.id); }}
        />
      )}
    </div>
  );
}

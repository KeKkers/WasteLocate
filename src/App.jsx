import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, MapPin, Phone, Mail, LogIn, LogOut, Settings, Plus, Edit2, Trash2, Home, AlertCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

export default function EWCWasteManagementSystem() {
  const [currentView, setCurrentView] = useState('public');
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedSubchapter, setSelectedSubchapter] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [finalSelection, setFinalSelection] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [adminFacilities, setAdminFacilities] = useState([]);

  useEffect(() => {
    loadEWCData();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const loadEWCData = async () => {
    try {
      const response = await fetch('/ewc_hierarchy.json');
      const parsed = await response.json();
      setData(parsed);
      setLoading(false);
    } catch (err) {
      console.error('Error loading EWC data:', err);
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      setUser(data.user);
      setCurrentView('admin');
      await loadAdminFacilities();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('public');
  };

  const loadAdminFacilities = async () => {
    const { data, error } = await supabase
      .from('facilities')
      .select(`
        *,
        facility_waste_codes (
          ewc_code
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading facilities:', error);
    } else {
      setAdminFacilities(data);
    }
  };

  const searchFacilities = async () => {
    if (!finalSelection) return;
    
    setSearchLoading(true);
    
    const { data, error } = await supabase
      .from('facility_waste_codes')
      .select(`
        *,
        facilities (
          id,
          name,
          permit_number,
          address_line1,
          address_line2,
          city,
          postcode,
          phone,
          email,
          website,
          latitude,
          longitude
        )
      `)
      .eq('ewc_code', finalSelection.code)
      .eq('facilities.status', 'active');

    if (error) {
      console.error('Error searching facilities:', error);
      alert('Error searching facilities. Please try again.');
    } else {
      const formattedFacilities = data.map(item => ({
        id: item.facilities.id,
        name: item.facilities.name,
        permit_number: item.facilities.permit_number,
        address: `${item.facilities.address_line1}${item.facilities.address_line2 ? ', ' + item.facilities.address_line2 : ''}, ${item.facilities.city}`,
        postcode: item.facilities.postcode,
        phone: item.facilities.phone,
        email: item.facilities.email,
        website: item.facilities.website,
        max_volume: item.max_volume,
        volume_unit: item.volume_unit,
        price_per_unit: item.price_per_unit,
        currency: item.currency || 'GBP'
      }));
      
      setFacilities(formattedFacilities);
    }
    
    setSearchLoading(false);
  };

  const getChapters = () => {
    if (!data) return [];
    return Object.keys(data)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => ({ code: key, description: data[key].description }));
  };

  const getSubchapters = () => {
    if (!selectedChapter || !data?.[selectedChapter]?.subchapters) return [];
    const subchapters = data[selectedChapter].subchapters;
    return Object.keys(subchapters)
      .sort((a, b) => a.localeCompare(b))
      .map(key => ({ code: key, name: subchapters[key].name }));
  };

  const getCodes = () => {
    if (!selectedChapter || !selectedSubchapter || !data?.[selectedChapter]?.subchapters?.[selectedSubchapter]?.codes) return [];
    const codes = data[selectedChapter].subchapters[selectedSubchapter].codes;
    return Object.keys(codes).map(key => ({ code: key, description: codes[key] }));
  };

  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} onBack={() => setCurrentView('public')} />;
  }

  if (currentView === 'admin' && user) {
    return (
      <AdminPanel
        facilities={adminFacilities}
        onRefresh={loadAdminFacilities}
        onLogout={handleLogout}
        onBack={() => setCurrentView('public')}
      />
    );
  }

  const chapters = getChapters();
  const subchapters = getSubchapters();
  const codes = getCodes();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">EWC Waste Management System</h1>
            <p className="text-gray-600">Find permitted facilities for your waste</p>
          </div>
          <button
            onClick={() => setCurrentView('login')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings className="w-4 h-4" />
            Admin
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Waste Code</h2>
          
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Step 1: Select Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  setSelectedSubchapter('');
                  setSelectedCode('');
                  setFinalSelection(null);
                  setFacilities([]);
                }}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a chapter...</option>
                {chapters.map(ch => (
                  <option key={ch.code} value={ch.code}>{ch.code} - {ch.description}</option>
                ))}
              </select>
            </div>

            {selectedChapter && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Step 2: Select Subchapter</label>
                <select
                  value={selectedSubchapter}
                  onChange={(e) => {
                    setSelectedSubchapter(e.target.value);
                    setSelectedCode('');
                    setFinalSelection(null);
                    setFacilities([]);
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a subchapter...</option>
                  {subchapters.map(sub => (
                    <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedSubchapter && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Step 3: Select Waste Code</label>
                <select
                  value={selectedCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedCode(code);
                    if (code) {
                      setFinalSelection(getCodes().find(c => c.code === code));
                      setFacilities([]);
                    } else {
                      setFinalSelection(null);
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a waste code...</option>
                  {codes.map(code => (
                    <option key={code.code} value={code.code}>{code.code} - {code.description}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {finalSelection && (
            <div className="mb-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-800">Selected: {finalSelection.code}</p>
                <p className="text-sm text-gray-600">{finalSelection.description}</p>
              </div>
              <button
                onClick={searchFacilities}
                disabled={searchLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {searchLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Permitted Facilities
                  </>
                )}
              </button>
            </div>
          )}

          {facilities.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Found {facilities.length} Facilities</h3>
              <div className="space-y-4">
                {facilities.map(facility => (
                  <div key={facility.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{facility.name}</h4>
                        <p className="text-sm text-gray-600">{facility.permit_number}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{facility.address}, {facility.postcode}</span>
                      </div>
                      {facility.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{facility.phone}</span>
                        </div>
                      )}
                      {facility.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{facility.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <p className="font-semibold text-gray-700">Capacity: {facility.max_volume} {facility.volume_unit}</p>
                      {facility.price_per_unit && (
                        <p className="text-gray-600">Price: £{facility.price_per_unit} per tonne</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {finalSelection && facilities.length === 0 && !searchLoading && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No facilities found for this waste code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            <Home className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ facilities, onRefresh, onLogout, onBack }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const deleteFacility = async (id) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;

    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting facility: ' + error.message);
    } else {
      await onRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600">Manage facilities and permits</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              <Home className="w-4 h-4" />
              Public
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Facilities</h3>
            <p className="text-3xl font-bold text-blue-600">{facilities.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Permits</h3>
            <p className="text-3xl font-bold text-green-600">{facilities.filter(f => f.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Waste Codes</h3>
            <p className="text-3xl font-bold text-orange-600">
              {facilities.reduce((sum, f) => sum + (f.facility_waste_codes?.length || 0), 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Facilities</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Facility
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permit Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Postcode</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {facilities.map(facility => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{facility.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{facility.permit_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{facility.postcode}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        facility.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {facility.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingFacility(facility)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteFacility(facility.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddFacilityModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            onRefresh();
          }}
        />
      )}

      {editingFacility && (
        <EditFacilityModal
          facility={editingFacility}
          onClose={() => setEditingFacility(null)}
          onSuccess={() => {
            setEditingFacility(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function AddFacilityModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    permit_number: '',
    operator_name: '',
    address_line1: '',
    city: '',
    postcode: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.permit_number || !formData.postcode) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from('facilities')
      .insert([formData]);

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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Facility Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Permit Number *</label>
              <input
                type="text"
                value={formData.permit_number}
                onChange={(e) => setFormData({...formData, permit_number: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Operator Name</label>
            <input
              type="text"
              value={formData.operator_name}
              onChange={(e) => setFormData({...formData, operator_name: e.target.value})}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode *</label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Facility'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditFacilityModal({ facility, onClose, onSuccess }) {
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
    
    const { error } = await supabase
      .from('facilities')
      .update(formData)
      .eq('id', facility.id);

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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Facility Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Permit Number *</label>
              <input
                type="text"
                value={formData.permit_number}
                onChange={(e) => setFormData({...formData, permit_number: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Operator Name</label>
            <input
              type="text"
              value={formData.operator_name}
              onChange={(e) => setFormData({...formData, operator_name: e.target.value})}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode *</label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Facility'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
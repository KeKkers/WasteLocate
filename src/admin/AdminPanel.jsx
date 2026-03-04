import React, { useState, useEffect } from 'react';
import { Home, LogOut, Plus, Edit2, Trash2, Shield, User, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { AddFacilityModal, EditFacilityModal } from '../components/modals/FacilityModals';
import { AddWasteCodeModal } from '../components/modals/WasteCodeModals';

// ─── UsersManagement ────────────────────────────────────────────────────────

function UsersManagement({ users, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredUsers = users.filter(u =>
    u.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const toggleAdmin = async (userId, currentStatus) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !currentStatus }).eq('id', userId);
    if (error) alert('Error updating admin status: ' + error.message);
    else onRefresh();
  };

  const updateSubscription = async (userId, newStatus) => {
    const { error } = await supabase.from('profiles').update({ subscription_status: newStatus }).eq('id', userId);
    if (error) alert('Error updating subscription: ' + error.message);
    else onRefresh();
  };

  const resetSearchCount = async (userId) => {
    const { error } = await supabase.from('profiles').update({ search_count: 0 }).eq('id', userId);
    if (error) alert('Error resetting search count: ' + error.message);
    else onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">User Management</h2>
          <input
            type="text"
            placeholder="Search by email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-80"
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Email', 'Plan', 'Searches', 'Admin', 'Created', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{user.email || user.id.substring(0, 8) + '...'}</td>
                <td className="px-6 py-4">
                  <select value={user.subscription_status} onChange={(e) => updateSubscription(user.id, e.target.value)} className="text-sm px-2 py-1 border border-gray-300 rounded">
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.search_count}/{user.search_limit}
                  {user.subscription_status === 'free' && (
                    <button onClick={() => resetSearchCount(user.id)} className="ml-2 text-blue-600 hover:text-blue-800 text-xs">Reset</button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleAdmin(user.id, user.is_admin)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {user.is_admin ? 'Admin' : 'User'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => { if (confirm('Are you sure you want to delete this user?')) supabase.from('profiles').delete().eq('id', user.id).then(() => onRefresh()); }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}

// ─── WasteCodesManagement ────────────────────────────────────────────────────

function WasteCodesManagement({ facilities, onRefresh }) {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityCodes, setFacilityCodes] = useState([]);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);

  const loadFacilityCodes = async (facilityId) => {
    const { data, error } = await supabase.from('facility_waste_codes').select('*').eq('facility_id', facilityId);
    if (error) alert('Error loading waste codes: ' + error.message);
    else setFacilityCodes(data || []);
  };

  const handleSelectFacility = (facility) => { setSelectedFacility(facility); loadFacilityCodes(facility.id); };

  const deleteCode = async (codeId) => {
    if (!confirm('Are you sure you want to delete this waste code?')) return;
    const { error } = await supabase.from('facility_waste_codes').delete().eq('id', codeId);
    if (error) alert('Error deleting waste code: ' + error.message);
    else { loadFacilityCodes(selectedFacility.id); onRefresh(); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Select Facility</h2>
          <p className="text-sm text-gray-600 mt-1">Choose a facility to manage its waste codes</p>
        </div>
        <div className="p-4 max-h-[600px] overflow-y-auto">
          {facilities.map(facility => (
            <button
              key={facility.id}
              onClick={() => handleSelectFacility(facility)}
              className={`w-full text-left p-4 mb-2 rounded-lg border-2 transition-colors ${selectedFacility?.id === facility.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <p className="font-semibold text-gray-800">{facility.name}</p>
              <p className="text-sm text-gray-600">{facility.permit_number}</p>
              <p className="text-xs text-gray-500 mt-1">{facility.facility_waste_codes?.length || 0} waste codes</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Waste Codes</h2>
              {selectedFacility && <p className="text-sm text-gray-600 mt-1">{selectedFacility.name}</p>}
            </div>
            {selectedFacility && (
              <button onClick={() => setShowAddCodeModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="w-4 h-4" />Add Code
              </button>
            )}
          </div>
        </div>
        <div className="p-4 max-h-[600px] overflow-y-auto">
          {!selectedFacility ? (
            <p className="text-center text-gray-500 py-8">Select a facility to view its waste codes</p>
          ) : facilityCodes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No waste codes added yet</p>
          ) : (
            <div className="space-y-2">
              {facilityCodes.map(code => (
                <div key={code.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{code.ewc_code}</p>
                      {code.notes && <p className="text-sm text-gray-600 mt-1">{code.notes}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        {code.max_volume && <span>Max: {code.max_volume} {code.volume_unit}</span>}
                        {code.price_per_unit && <span>£{code.price_per_unit}/tonne</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteCode(code.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddCodeModal && selectedFacility && (
        <AddWasteCodeModal
          facility={selectedFacility}
          onClose={() => setShowAddCodeModal(false)}
          onSuccess={() => { setShowAddCodeModal(false); loadFacilityCodes(selectedFacility.id); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ─── ApplicationsManagement ──────────────────────────────────────────────────

function ApplicationsManagement({ applications, onRefresh }) {
  const [processingId, setProcessingId] = useState(null);

  const handleApplication = async (applicationId, facilityId, userId, status) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;

    setProcessingId(applicationId);

    try {
      if (status === 'approved') {
        console.log('Approving application for user:', userId, 'facility:', facilityId);

        const check = await supabase.from('facilities').select('id').eq('id', facilityId);
        console.log('CHECK MATCH:', check);

        const { data: facilityData, error: facilityError } = await supabase
          .from('facilities').update({ owner_id: userId }).eq('id', facilityId).select();
        console.log('Facility update result:', facilityData, facilityError);
        if (facilityError) throw facilityError;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles').update({ owns_facility: true }).eq('id', userId).select();
        console.log('Profile update result:', profileData, profileError);
        if (profileError) throw profileError;
      }

      const { data: appData, error: appError } = await supabase
        .from('facility_applications')
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: (await supabase.auth.getUser()).data.user.id })
        .eq('id', applicationId).select();
      console.log('Application update result:', appData, appError);
      if (appError) throw appError;

      alert(`Application ${action}ed successfully!`);
      onRefresh();
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      alert(`Failed to ${action} application: ` + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const pendingApplications = applications.filter(a => a.status === 'pending');
  const reviewedApplications = applications.filter(a => a.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Pending Applications ({pendingApplications.length})</h2>
          <p className="text-sm text-gray-600 mt-1">Review and approve facility management applications</p>
        </div>
        <div className="p-6">
          {pendingApplications.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No pending applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map(app => (
                <div key={app.id} className="border-2 border-yellow-200 rounded-lg p-5 bg-yellow-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{app.facilities.name}</h3>
                      <p className="text-sm text-gray-600">{app.facilities.permit_number} • {app.facilities.city}, {app.facilities.postcode}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{app.profiles.name || 'Name not provided'}</p>
                        <p className="text-sm text-gray-600">{app.profiles.email}</p>
                        {app.profiles.company && <p className="text-xs text-gray-500">{app.profiles.company}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Application Message:</p>
                    <p className="text-sm text-gray-700">{app.message}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Applied: {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApplication(app.id, app.facility_id, app.user_id, 'approved')}
                      disabled={processingId === app.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                    >
                      {processingId === app.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Shield className="w-4 h-4" />Approve</>}
                    </button>
                    <button
                      onClick={() => handleApplication(app.id, app.facility_id, app.user_id, 'rejected')}
                      disabled={processingId === app.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                    >
                      {processingId === app.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Trash2 className="w-4 h-4" />Reject</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviewedApplications.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Reviewed Applications ({reviewedApplications.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Applicant', 'Facility', 'Status', 'Applied', 'Reviewed'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewedApplications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><p className="text-sm font-semibold text-gray-800">{app.profiles.name || 'N/A'}</p><p className="text-xs text-gray-600">{app.profiles.email}</p></td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-800">{app.facilities.name}</p><p className="text-xs text-gray-600">{app.facilities.permit_number}</p></td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AdminPanel ──────────────────────────────────────────────────────────────

export default function AdminPanel({ facilities, onRefresh, onLogout, onBack }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('facilities');
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const itemsPerPage = 50;

  useEffect(() => {
    onRefresh();
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'applications') loadApplications();
  }, [activeTab]);

  const loadUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) alert('Error loading users: ' + error.message);
    else setUsers(data || []);
  };

  const loadApplications = async () => {
    try {
      const { data: appsData, error: appsError } = await supabase
        .from('facility_applications')
        .select(`*, facilities (name, permit_number, postcode, city)`)
        .order('created_at', { ascending: false });
      if (appsError) throw appsError;
      if (!appsData || appsData.length === 0) { setApplications([]); return; }

      const userIds = [...new Set(appsData.map(app => app.user_id))];
      const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id, email, name, company').in('id', userIds);
      if (profilesError) throw profilesError;

      const profilesMap = {};
      (profilesData || []).forEach(p => { profilesMap[p.id] = p; });
      setApplications(appsData.map(app => ({ ...app, profiles: profilesMap[app.user_id] || { email: 'Unknown', name: null, company: null } })));
    } catch (error) {
      console.error('Error loading applications:', error);
      alert('Error loading applications: ' + error.message);
    }
  };

  const filteredFacilities = facilities.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.operator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.permit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.postcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFacilities = filteredFacilities.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const deleteFacility = async (id) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    const { error } = await supabase.from('facilities').delete().eq('id', id);
    if (error) alert('Error deleting facility: ' + error.message);
    else await onRefresh();
  };

  const tabs = [
    { key: 'facilities', label: `Facilities (${facilities.length})` },
    { key: 'users', label: `Users (${users.length})` },
    { key: 'waste-codes', label: 'Waste Codes' },
    { key: 'applications', label: `Applications (${applications.length})` },
  ];

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
              <Home className="w-4 h-4" />Public View
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6"><h3 className="text-sm font-semibold text-gray-600 mb-2">Total Facilities</h3><p className="text-3xl font-bold text-blue-600">{facilities.length}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><h3 className="text-sm font-semibold text-gray-600 mb-2">Active Permits</h3><p className="text-3xl font-bold text-green-600">{facilities.filter(f => f.status === 'active').length}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><h3 className="text-sm font-semibold text-gray-600 mb-2">Total Waste Codes</h3><p className="text-3xl font-bold text-orange-600">{facilities.reduce((sum, f) => sum + (f.facility_waste_codes?.length || 0), 0)}</p></div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === tab.key ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Tab */}
        {activeTab === 'facilities' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Facilities</h2>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search by name, operator, permit, city, or postcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-80"
                  />
                  <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap">
                    <Plus className="w-4 h-4" />Add Facility
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredFacilities.length)} of {filteredFacilities.length} facilities
                {searchTerm && ` (filtered from ${facilities.length} total)`}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Operator', 'Permit Number', 'City', 'Postcode', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedFacilities.length > 0 ? paginatedFacilities.map(facility => (
                    <tr key={facility.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{facility.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{facility.operator_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{facility.permit_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{facility.city || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{facility.postcode}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${facility.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {facility.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingFacility(facility)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteFacility(facility.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">{searchTerm ? `No facilities found matching "${searchTerm}"` : 'No facilities found'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50">Previous</button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && <UsersManagement users={users} onRefresh={loadUsers} />}
        {activeTab === 'waste-codes' && <WasteCodesManagement facilities={facilities} onRefresh={onRefresh} />}
        {activeTab === 'applications' && <ApplicationsManagement applications={applications} onRefresh={() => { loadApplications(); onRefresh(); }} />}
      </div>

      {showAddModal && (
        <AddFacilityModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); onRefresh(); }} />
      )}
      {editingFacility && (
        <EditFacilityModal facility={editingFacility} onClose={() => setEditingFacility(null)} onSuccess={() => { setEditingFacility(null); onRefresh(); }} />
      )}
    </div>
  );
}

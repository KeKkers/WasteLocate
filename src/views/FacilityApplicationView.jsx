import React, { useState, useEffect } from 'react';
import { Home, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function FacilityApplicationView({ user, onBack, facilities }) {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  useEffect(() => {
    loadMyApplications();
  }, [user]);

  const loadMyApplications = async () => {
    if (!user) return;

    setApplicationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('facility_applications')
        .select(`*, facilities (name, permit_number, postcode)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFacility) {
      alert('Please select a facility');
      return;
    }
    if (!message.trim()) {
      alert('Please provide a message explaining why you should manage this facility');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('facility_applications')
        .insert([{ user_id: user.id, facility_id: selectedFacility, message: message.trim() }]);

      if (error) throw error;

      alert('Application submitted successfully! We will review it shortly.');
      setSelectedFacility('');
      setMessage('');
      loadMyApplications();
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.permit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.postcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors">
            <Home className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Apply to Manage a Facility</h1>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Submit New Application</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search for Facility</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, permit number, or postcode..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Facility *</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a facility...</option>
                {filteredFacilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.permit_number} ({facility.postcode})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{filteredFacilities.length} facilities available</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Why should you manage this facility? *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain your connection to this facility and why you should be granted management access..."
                rows="5"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />Submitting...</>
              ) : (
                <><Building2 className="w-5 h-5" />Submit Application</>
              )}
            </button>
          </div>
        </div>

        {/* My Applications */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">My Applications</h3>

          {applicationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : myApplications.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{app.facilities.name}</p>
                      <p className="text-sm text-gray-600">{app.facilities.permit_number}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{app.message}</p>
                  <p className="text-xs text-gray-500">
                    Applied: {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Home, Mail, Calendar, CreditCard, Edit2, Save, Search, AlertCircle, Building2, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ProfileView({ user, userProfile, onBack, onRefreshProfile, onNavigateToApply }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    company: userProfile?.company || '',
    phone: userProfile?.phone || '',
    postcode: userProfile?.postcode || ''
  });

  useEffect(() => {
    setFormData({
      name: userProfile?.name || '',
      company: userProfile?.company || '',
      phone: userProfile?.phone || '',
      postcode: userProfile?.postcode || ''
    });
  }, [userProfile]);

  useEffect(() => {
    loadSearchHistory();
  }, [user]);

  const loadSearchHistory = async () => {
    if (!user) return;

    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('searched_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      setIsEditing(false);
      onRefreshProfile && onRefreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors">
              <Home className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Member since: {formatDate(userProfile?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className={`rounded-lg shadow-xl p-6 ${userProfile?.subscription_status === 'pro' ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-white'}`}>
            <div className="flex items-start gap-3">
              <CreditCard className={`w-5 h-5 mt-0.5 ${userProfile?.subscription_status === 'pro' ? 'text-green-600' : 'text-gray-500'}`} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-3">Subscription Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${userProfile?.subscription_status === 'pro' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {userProfile?.subscription_status === 'pro' ? '⭐ Pro Plan' : 'Free Plan'}
                    </span>
                  </div>
                  {userProfile?.subscription_status === 'free' && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Searches Used:</span> {userProfile?.search_count || 0} / {userProfile?.search_limit || 2}
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${((userProfile?.search_count || 0) / (userProfile?.search_limit || 2)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {userProfile?.subscription_status === 'pro' && (
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-sm text-gray-700">✓ Unlimited searches</div>
                      {userProfile?.subscription_expires_at && (
                        <div className="text-sm text-gray-600 mt-1">
                          Renews: {formatDate(userProfile.subscription_expires_at)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Personal Details</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Details
                </button>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter your name' },
                { label: 'Company / Organization', key: 'company', type: 'text', placeholder: 'Enter company name' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: 'Enter phone number' },
                { label: 'Postcode', key: 'postcode', type: 'text', placeholder: 'e.g., M1 1AE' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  {isEditing ? (
                    <input
                      type={type}
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: key === 'postcode' ? e.target.value.toUpperCase() : e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                      {formData[key] || <span className="text-gray-400">Not provided</span>}
                    </div>
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" />Save Changes</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: userProfile?.name || '',
                        company: userProfile?.company || '',
                        phone: userProfile?.phone || '',
                        postcode: userProfile?.postcode || ''
                      });
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Facility Owner Section */}
          {userProfile?.owns_facility && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-xl p-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">Facility Owner</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    You are registered as a facility owner. Manage your facility information and waste codes.
                  </p>
                  <button
                    onClick={() => {
                      onBack();
                      setTimeout(() => { window.location.hash = 'facility-dashboard'; }, 100);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Go to Facility Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Apply to Manage Facility */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-xl p-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {userProfile?.owns_facility ? 'Manage More Facilities?' : 'Facility Owner?'}
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  {userProfile?.owns_facility
                    ? 'Apply to manage additional waste facilities that you own or operate.'
                    : 'If you own or operate a waste facility, apply to manage your facility listing and keep it up to date.'
                  }
                </p>
                <button
                  onClick={onNavigateToApply}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  {userProfile?.owns_facility ? 'Apply for Another Facility' : 'Apply to Manage Facility'}
                </button>
              </div>
            </div>
          </div>

          {/* Search History */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800 text-lg">Recent Searches</h3>
              </div>
              <span className="text-sm text-gray-500">Last {searchHistory.length} searches</span>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No search history yet</p>
                <p className="text-sm text-gray-500 mt-1">Your searches will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((search) => (
                  <div
                    key={search.id}
                    className="flex flex-col md:flex-row md:items-start md:justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-blue-600">{search.ewc_code}</span>
                        {search.postcode && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            <MapPin className="w-3 h-3" />
                            {search.postcode}
                          </span>
                        )}
                        {search.description && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                            {search.description.length > 50 ? search.description.substring(0, 50) + '...' : search.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(search.searched_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Rerun this search? This could count against your search limit.')) {
                          onBack();
                          window.rerunSearch = { ewcCode: search.ewc_code, postcode: search.postcode || '' };
                        }
                      }}
                      className="w-full md:w-auto md:ml-4 px-3 py-2 text-sm md:text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Rerun this search (free)"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Rerun
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

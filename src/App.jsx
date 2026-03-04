import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, MapPin, Phone, Mail, Globe, LogIn, LogOut, Settings, Shield, User, Building2, BookOpen, AlertCircle } from 'lucide-react';

import Footer from './Footer';
import { useAuth } from './hooks/useAuth';
import { useEWCData } from './hooks/useEWCData';
import { useFacilities } from './hooks/useFacilities';
import EWCKeywordSearch from './components/EWCKeywordSearch';
import WasteTransferNoteButton from './components/WasteTransferNoteButton';
import WM3Guide from './components/WM3Guide';

import LoginView from './views/LoginView';
import ResetPasswordView from './views/ResetPasswordView';
import PricingView from './views/PricingView';
import ProfileView from './views/ProfileView';
import FacilityApplicationView from './views/FacilityApplicationView';
import FacilityOwnerDashboard from './views/FacilityOwnerDashboard';
import AdminPanel from './admin/AdminPanel';

export default function App() {
  const [currentView, setCurrentView] = useState('public');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRerunningSearch, setIsRerunningSearch] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showWM3Guide, setShowWM3Guide] = useState(false);
  const menuRef = useRef(null);

  // Auth hook
  const {
    session, user, userProfile, setUserProfile, profileLoading,
    handleSignup, handleLogin, handleLogout, loadUserProfile
  } = useAuth(setCurrentView);

  // EWC data hook
  const {
    data, loading,
    selectedChapter, setSelectedChapter,
    selectedSubchapter, setSelectedSubchapter,
    selectedCode, setSelectedCode,
    finalSelection, setFinalSelection,
    getChapters, getSubchapters, getCodes, isHazardous,
    searchEWCCodes, selectFromSearch,
  } = useEWCData();

  // Facilities hook
  const {
    facilities, setFacilities,
    adminFacilities, searchLoading,
    expandedFacilityId, setExpandedFacilityId,
    userPostcode, setUserPostcode,
    sortByDistance, setSortByDistance,
    loadAdminFacilities, searchFacilities: _searchFacilities,
  } = useFacilities({ user, session, userProfile, setUserProfile, setCurrentView, isRerunningSearch, setIsRerunningSearch, finalSelection });

  const searchFacilities = () => _searchFacilities(handleLogout);

  // SEO meta tags
  useEffect(() => {
    document.title = 'Find Permitted Waste Facilities in UK';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', 'Search UK waste facilities by EWC code. Find licensed disposal sites for hazardous and non-hazardous waste. Connect waste producers with permitted facilities.');
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', 'EWC codes, waste management, UK waste facilities, hazardous waste disposal, waste permit search, waste classification, waste disposal sites');
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowUserMenu(false);
    };
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Hash-based navigation
  useEffect(() => {
    const handleHashNavigation = () => {
      if (window.location.hash === '#apply-facility') { setCurrentView('apply-facility'); window.location.hash = ''; }
      else if (window.location.hash === '#facility-dashboard') { setCurrentView('facility-dashboard'); window.location.hash = ''; }
    };
    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, []);

  // Rerun search from history
  useEffect(() => {
    if (window.rerunSearch && data) {
      const { ewcCode, postcode } = window.rerunSearch;
      const parts = ewcCode.split(' ');
      if (parts.length >= 3) {
        const chapter = parts[0];
        const subchapter = `${parts[0]} ${parts[1]}`;
        setSelectedChapter(chapter);
        setSelectedSubchapter(subchapter);
        setSelectedCode(ewcCode);

        const codes = data[chapter]?.subchapters?.[subchapter]?.codes;
        if (codes && codes[ewcCode]) {
          setFinalSelection({ code: ewcCode, description: codes[ewcCode] });
          if (postcode) { setUserPostcode(postcode); setSortByDistance(true); }
          setIsRerunningSearch(true);
          setTimeout(() => searchFacilities(), 100);
        }
      }
      delete window.rerunSearch;
    }
  }, [data, currentView]);

  // Load admin facilities when entering apply-facility view
  useEffect(() => {
    if (currentView === 'apply-facility' && adminFacilities.length === 0) loadAdminFacilities();
  }, [currentView]);

  // ── Route to views ─────────────────────────────────────────────────────────
  if (currentView === 'login') return <LoginView onLogin={handleLogin} onSignup={handleSignup} onBack={() => setCurrentView('public')} />;
  if (currentView === 'reset-password') return <ResetPasswordView onBack={() => setCurrentView('login')} />;
  if (currentView === 'pricing') return <PricingView onBack={() => setCurrentView('public')} user={user} userProfile={userProfile} onSuccess={() => loadUserProfile(user?.id)} />;
  if (currentView === 'admin' && user && userProfile?.is_admin) return <AdminPanel facilities={adminFacilities} onRefresh={loadAdminFacilities} onLogout={handleLogout} onBack={() => setCurrentView('public')} />;
  if (currentView === 'profile' && user) return <ProfileView user={user} userProfile={userProfile} onBack={() => setCurrentView('public')} onRefreshProfile={() => loadUserProfile(user.id)} onNavigateToApply={() => setCurrentView('apply-facility')} />;
  if (currentView === 'apply-facility' && user) {
    if (adminFacilities.length === 0) loadAdminFacilities();
    return <FacilityApplicationView user={user} onBack={() => setCurrentView('public')} facilities={adminFacilities} />;
  }
  if (currentView === 'facility-dashboard' && user && userProfile?.owns_facility) return <FacilityOwnerDashboard user={user} userProfile={userProfile} onBack={() => setCurrentView('public')} />;

  // ── Derived data ───────────────────────────────────────────────────────────
  const chapters = getChapters();
  const subchapters = getSubchapters();
  const codes = getCodes();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Public view ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img
              src="/wastelocate-logo.png"
              alt="WasteLocate Logo"
              className="h-20 w-auto"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="w-16 h-16 bg-green-600 rounded-lg items-center justify-center text-white font-bold text-2xl" style={{ display: 'none' }}>WL</div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm md:text-base">Find permitted facilities for your waste</p>
            </div>
          </div>

          {/* User menu */}
          <div className="flex gap-3 items-center w-full md:w-auto justify-end">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <div className="text-sm text-gray-700 text-right">
                    <p className="font-semibold">{user.email}</p>
                    {profileLoading ? (
                      <p className="text-xs text-gray-500">Loading...</p>
                    ) : userProfile ? (
                      <p className="text-xs text-gray-500">Free access</p>
                    ) : (
                      <p className="text-xs text-gray-500">Profile unavailable</p>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">{user.email}</p>
                      {profileLoading ? (
                        <p className="text-xs text-gray-600 mt-1">Loading profile...</p>
                      ) : userProfile ? (
                        <p className="text-xs text-gray-600 mt-1">Free access</p>
                      ) : (
                        <p className="text-xs text-gray-600 mt-1">Profile unavailable</p>
                      )}
                    </div>

                    {userProfile?.is_admin && (
                      <button onClick={() => { setShowUserMenu(false); setCurrentView('admin'); }} className="w-full text-left px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 border-t border-gray-200">
                        <Shield className="w-4 h-4" />Admin Panel
                      </button>
                    )}
                    <button onClick={() => { setShowUserMenu(false); setCurrentView('profile'); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200">
                      <User className="w-4 h-4" />My Profile
                    </button>
                    <button onClick={() => { setShowUserMenu(false); window.location.href = '/blog'; }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200">
                      <BookOpen className="w-4 h-4" />Blog & Resources
                    </button>
                    <button onClick={() => { setShowUserMenu(false); handleLogout(); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200">
                      <LogOut className="w-4 h-4" />Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setCurrentView('login')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <LogIn className="w-4 h-4" />Login / Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 md:p-8 mb-6 border-2 border-green-200">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            UK Waste Management Made Simple: Find Licensed Facilities & Ensure Compliance
          </h1>
          <p className="text-lg leading-relaxed text-gray-700">
            WasteLocate is the UK's comprehensive waste facility directory, designed to connect waste producers with licensed disposal sites while helping businesses maintain regulatory compliance. Whether you're managing construction waste, industrial by-products, or commercial refuse, our platform simplifies the complex process of finding appropriate, permitted facilities for your specific waste streams.
          </p>
        </div>

        {/* Search panel */}
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Waste Code</h2>

          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold mb-2">How to Use</h2>
            <ol className="list-decimal ml-5 space-y-2 text-sm">
              <li><strong>Quick search:</strong> type a keyword below to instantly find your EWC code.</li>
              <li>Or use the dropdowns to browse by waste origin, process, and code.</li>
              <li>Once a code is selected, enter your postcode and search for nearby permitted facilities.</li>
              <li>When you find a suitable facility, click <strong>Download WTN</strong> or <strong>Download Consignment Note</strong> to get your pre-filled document.</li>
            </ol>
          </div>

          {/* WM3 Classification Guide button */}
          <div className="mb-5 bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <span>📋</span> Not sure if your waste is hazardous?
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Use our WM3 classification guide to work through the EA's decision process step-by-step.</p>
            </div>
            <button
              onClick={() => setShowWM3Guide(true)}
              className="flex-shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Open WM3 Guide
            </button>
          </div>

          {showWM3Guide && (
            <WM3Guide
              onClose={() => setShowWM3Guide(false)}
              searchEWCCodes={searchEWCCodes}
              isHazardous={isHazardous}
              onSelectEWC={(result) => {
                selectFromSearch(result, setFacilities);
                setShowWM3Guide(false);
              }}
            />
          )}

          <EWCKeywordSearch
            searchEWCCodes={searchEWCCodes}
            selectFromSearch={(result) => selectFromSearch(result, setFacilities)}
            setFacilities={setFacilities}
            isHazardous={isHazardous}
          />

          <div className="space-y-6 mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">— or browse by category —</p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Step 1: Select Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => { setSelectedChapter(e.target.value); setSelectedSubchapter(''); setSelectedCode(''); setFinalSelection(null); setFacilities([]); }}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a chapter...</option>
                {chapters.map(ch => <option key={ch.code} value={ch.code}>{ch.code} - {ch.description}</option>)}
              </select>
            </div>

            {selectedChapter && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Step 2: Select Subchapter</label>
                <select
                  value={selectedSubchapter}
                  onChange={(e) => { setSelectedSubchapter(e.target.value); setSelectedCode(''); setFinalSelection(null); setFacilities([]); }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a subchapter...</option>
                  {subchapters.map(sub => <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>)}
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
                    if (code) { setFinalSelection(getCodes().find(c => c.code === code)); setFacilities([]); }
                    else setFinalSelection(null);
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a waste code...</option>
                  {codes.map(code => <option key={code.code} value={code.code}>{code.code} - {code.description}</option>)}
                </select>
              </div>
            )}
          </div>

          {finalSelection && (
            <div className="mb-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-800">Selected: {finalSelection.code}</p>
                <p className="text-sm text-gray-600 mb-2">{finalSelection.description}</p>
                <p className="text-sm">
                  <span className="font-semibold">Classification: </span>
                  <span className={isHazardous(finalSelection.description) ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                    {isHazardous(finalSelection.description) ? 'Hazardous (MH/AH)' : 'Non-hazardous (AN/MN)'}
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Postcode (Optional - for distance sorting)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={userPostcode}
                    onChange={(e) => setUserPostcode(e.target.value.toUpperCase())}
                    placeholder="e.g., M1 1AE"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                    <input type="checkbox" checked={sortByDistance} onChange={(e) => setSortByDistance(e.target.checked)} className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-700">Sort by distance</span>
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-2">Enter your postcode to see facilities sorted by distance from your location</p>
              </div>

              <button
                onClick={searchFacilities}
                disabled={searchLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {searchLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />Searching...</>) : (<><Search className="w-5 h-5" />Search Permitted Facilities</>)}
              </button>
            </div>
          )}

          {/* Results */}
          {facilities.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Found {facilities.length} Facilit{facilities.length === 1 ? 'y' : 'ies'}</h3>

              {!user && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">{facilities.length}</div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-800 mb-2">{facilities.length} {facilities.length === 1 ? 'Facility' : 'Facilities'} Found!</p>
                      <p className="text-sm text-gray-700 mb-3">Sign up for free to save your search history and get results faster next time.</p>
                      <button onClick={() => setCurrentView('login')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2">
                        <LogIn className="w-4 h-4" />Create Free Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {facilities.map((facility) => (
                  <div key={facility.id} className="relative">
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-colors">
                      <button
                        onClick={() => setExpandedFacilityId(expandedFacilityId === facility.id ? null : facility.id)}
                        className="w-full px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-start md:items-center gap-3 md:justify-between bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFacilityId === facility.id ? 'rotate-180' : ''}`} />
                          <div className="text-left">
                            {facility.operator_name && <h4 className="text-lg font-bold text-gray-800">{facility.operator_name}</h4>}
                            <p className={`${facility.operator_name ? 'text-sm' : 'text-lg font-bold'} text-gray-600`}>{facility.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
                          {facility.distance !== undefined && facility.distance !== null && (
                            <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{facility.distance} miles</span>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{facility.postcode}</span>
                        </div>
                      </button>

                      {expandedFacilityId === facility.id && (
                        <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                          <div className="pt-4">
                            <p className="text-xs text-gray-500 mb-4">{facility.permit_number}</p>
                            <div className="space-y-3 mb-4 text-sm">
                              <div className="flex items-start gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{facility.address}, {facility.postcode}</span>
                              </div>
                              {facility.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <a href={`tel:${facility.phone}`} className="text-blue-600 hover:underline">{facility.phone}</a>
                                </div>
                              )}
                              {facility.email && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <a href={`mailto:${facility.email}`} className="text-blue-600 hover:underline">{facility.email}</a>
                                </div>
                              )}
                              {facility.website && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Globe className="w-4 h-4 flex-shrink-0" />
                                  <a href={facility.website.startsWith('http') ? facility.website : `https://${facility.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visit Website</a>
                                </div>
                              )}
                            </div>
                            <div className="bg-white rounded p-4 text-sm space-y-1 border border-gray-200">
                              <p className="font-semibold text-gray-700">Capacity: {facility.max_volume} {facility.volume_unit}</p>
                              {facility.price_per_unit && <p className="text-gray-600">Price: £{facility.price_per_unit} per tonne</p>}
                              {facility.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
                                  <p className="text-xs text-gray-600">{facility.notes}</p>
                                </div>
                              )}
                            </div>

                            {finalSelection && (
                              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-xs text-gray-500">Download a pre-filled Waste Transfer Note for this facility</p>
                                <WasteTransferNoteButton
                                  facility={facility}
                                  ewcCode={finalSelection.code}
                                  ewcDescription={finalSelection.description}
                                  isHazardous={isHazardous(finalSelection.description)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
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

        {/* SEO Content sections */}
        <div className="mt-8 space-y-4">
          {[
            {
              key: 'compliance',
              title: 'UK Waste Duty of Care & Regulatory Compliance',
              content: [
                'Under the Environmental Protection Act 1990 and the Waste (England and Wales) Regulations 2011, businesses have a legal Duty of Care when handling waste. This means you must ensure your waste is properly described, stored, transported, and disposed of at appropriately licensed facilities. Failure to comply can result in significant fines and potential criminal prosecution. WasteLocate serves as an essential compliance tool, helping you fulfill these legal obligations by verifying that facilities have the necessary environmental permits to accept your specific waste streams.',
                'Our platform enables businesses to perform proper due diligence before engaging with waste contractors or facilities. Every facility in our database includes its Environment Agency permit number, which you can cross-reference with official records. This transparency helps you avoid the serious legal and financial consequences of inadvertently using unlicensed operators or facilities that don\'t have the appropriate permissions for your waste type.'
              ]
            },
            {
              key: 'documentation',
              title: 'Supporting Waste Transfer Documentation',
              content: [
                'When transferring waste, UK law requires proper documentation including waste transfer notes (for non-hazardous waste) or consignment notes (for hazardous waste). These documents must include accurate EWC codes and details of where the waste is being taken. WasteLocate streamlines this process by providing you with verified facility information and correct EWC codes, making it easier to complete your waste transfer documentation accurately.',
                'For businesses that regularly produce the same waste streams, our search history feature (available to registered users) allows you to quickly access previously searched waste codes and facilities.'
              ]
            },
            {
              key: 'distance',
              title: 'Distance-Based Search and Local Solutions',
              content: [
                'Environmental responsibility increasingly means minimizing waste miles—the distance waste travels from generation to final disposal. Transporting waste long distances increases carbon emissions, fuel costs, and the overall environmental impact of waste management. WasteLocate\'s postcode-based distance sorting helps you identify the nearest appropriate facilities, supporting both environmental objectives and cost reduction.',
                'By entering your postcode, you can see facilities ranked by proximity, with distances calculated in miles. This feature is particularly valuable for high-volume waste producers or those managing regular waste collections.'
              ]
            },
            {
              key: 'ewc-codes',
              title: 'Understanding EWC Codes and Waste Classification',
              content: [
                'The European Waste Catalogue provides a standardized system for classifying waste across all member states (and continues to be used in the UK post-Brexit). Each waste type is assigned a six-digit code, structured hierarchically: the first two digits represent the chapter (waste source), the next two represent the subchapter (specific process), and the final two identify the exact waste type.',
                'Some waste codes are marked as "mirror entries," meaning they have both hazardous (marked MH/AH) and non-hazardous (marked AN/MN) versions depending on the waste\'s properties. WasteLocate clearly indicates whether codes are hazardous or non-hazardous, but final classification responsibility remains with the waste producer, supported by appropriate testing and assessment as outlined in WM3 guidance.'
              ]
            },
            {
              key: 'cost',
              title: 'Planning Ahead and Cost Transparency',
              content: [
                'Understanding disposal costs before waste is generated allows for better project planning and budgeting. Where facility operators have provided pricing information, WasteLocate displays indicative rates per tonne, giving you a starting point for cost estimates.',
                'This transparency also helps identify when waste segregation at source might be cost-effective. Some mixed waste streams incur higher disposal costs than separated materials, so understanding the economics can influence your waste management strategy.'
              ]
            },
          ].map(({ key, title, content }) => (
            <div key={key} className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-800 text-left">{title}</h3>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ${expandedSection === key ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === key && (
                <div className="p-6 bg-white border-t border-gray-200 space-y-4">
                  {content.map((para, i) => <p key={i} className="leading-relaxed text-gray-700">{para}</p>)}
                </div>
              )}
            </div>
          ))}

          {/* For Facility Operators */}
          <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-blue-50">
            <button onClick={() => setExpandedSection(expandedSection === 'facility-operators' ? null : 'facility-operators')} className="w-full flex items-center justify-between p-4 bg-blue-100 hover:bg-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">For Facility Operators: Get Your Permit Listed</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${expandedSection === 'facility-operators' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'facility-operators' && (
              <div className="p-6 bg-blue-50 border-t border-blue-200 space-y-3">
                <p className="leading-relaxed text-gray-700">Do you operate a licensed waste facility in the UK? Ensure your facility is discoverable by the thousands of waste producers using WasteLocate each month.</p>
                <p className="leading-relaxed text-gray-700">To have your facility and environmental permit included in our database, simply email your permit details to <a href="mailto:info@wastelocate.co.uk" className="text-blue-600 hover:underline font-semibold">info@wastelocate.co.uk</a>. We'll review your submission and add your facility — there's no cost to be listed.</p>
              </div>
            )}
          </div>

          {/* Missing Permit */}
          <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-green-50">
            <button onClick={() => setExpandedSection(expandedSection === 'missing-permit' ? null : 'missing-permit')} className="w-full flex items-center justify-between p-4 bg-green-100 hover:bg-green-200 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-800">Missing Permit? Request a Review</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${expandedSection === 'missing-permit' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'missing-permit' && (
              <div className="p-6 bg-green-50 border-t border-green-200 space-y-3">
                <p className="leading-relaxed text-gray-700">Can't find a facility you know should be listed? Email the facility details and permit number to <a href="mailto:info@wastelocate.co.uk" className="text-blue-600 hover:underline font-semibold">info@wastelocate.co.uk</a>, and our team will review and add it to our database free of charge.</p>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

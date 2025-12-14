import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, MapPin, Phone, Mail, Globe, LogIn, LogOut, Settings, Plus, Edit2, Trash2, Home, AlertCircle, Shield, CreditCard, User, Building2, Calendar, Save } from 'lucide-react';
import { supabase } from './supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import Footer from './Footer';
import { BookOpen } from 'lucide-react';



// Initialize Stripe - Replace with your publishable key
const stripePromise = loadStripe('pk_live_51SSmVkRy6wJc4RiFsf77CnjFRUkZ1qKRkN8LRwUWr792J4JS0NZ3nuOzRoPGbVsZrxk9A28ZIHhn39ixa6kqEm6d002zcepCbL');

export default function EWCWasteManagementSystem() {
  const [currentView, setCurrentView] = useState('public');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showFacilityApplication, setShowFacilityApplication] = useState(false);
  
// SEO Meta tags
  useEffect(() => {
    document.title = 'Find Permitted Waste Facilities in UK';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Search UK waste facilities by EWC code. Find licensed disposal sites for hazardous and non-hazardous waste. Connect waste producers with permitted facilities.');
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'EWC codes, waste management, UK waste facilities, hazardous waste disposal, waste permit search, waste classification, waste disposal sites');
    }
  }, []);



  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedSubchapter, setSelectedSubchapter] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [finalSelection, setFinalSelection] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [adminFacilities, setAdminFacilities] = useState([]);
  const [expandedFacilityId, setExpandedFacilityId] = useState(null);
  const [userPostcode, setUserPostcode] = useState('');
  const [sortByDistance, setSortByDistance] = useState(false);
  const menuRef = React.useRef(null);
  const [isRerunningSearch, setIsRerunningSearch] = useState(false);

  useEffect(() => {
    loadEWCData();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT' || !currentSession) {
        console.log('User signed out or session expired');
        setUserProfile(null);
        setCurrentView('public');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        console.log('Setting user from session');
        if (currentSession?.user?.id) {
          setTimeout(() => {
            loadUserProfile(currentSession.user.id);
          }, 0);
        }
      }
    });
    
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user?.id) {
        setTimeout(() => {
          loadUserProfile(currentSession.user.id);
        }, 0);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);


useEffect(() => {
  const handleHashNavigation = () => {
    if (window.location.hash === '#apply-facility') {
      setCurrentView('apply-facility');
      window.location.hash = '';
    } else if (window.location.hash === '#facility-dashboard') {
      setCurrentView('facility-dashboard');
      window.location.hash = '';
    }
  };

  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);
  
  return () => window.removeEventListener('hashchange', handleHashNavigation);
}, []);

useEffect(() => {
  // Check if there's a rerun search request
  if (window.rerunSearch) {
    const { ewcCode, postcode } = window.rerunSearch;
    
    // Find the code in the data
    if (data) {
      // Parse the EWC code (e.g., "17 01 01" -> chapter: "17", subchapter: "17 01", code: "17 01 01")
      const parts = ewcCode.split(' ');
      if (parts.length >= 3) {
        const chapter = parts[0];
        const subchapter = `${parts[0]} ${parts[1]}`;
        
        setSelectedChapter(chapter);
        setSelectedSubchapter(subchapter);
        setSelectedCode(ewcCode);
        
        // Set the final selection
        const codes = data[chapter]?.subchapters?.[subchapter]?.codes;
        if (codes && codes[ewcCode]) {
          const selection = {
            code: ewcCode,
            description: codes[ewcCode]
          };
          setFinalSelection(selection);
          
          // Set the postcode if available
          if (postcode) {
            setUserPostcode(postcode);
            setSortByDistance(true);
          }
          
          // Mark as rerun and trigger search after state updates
          setIsRerunningSearch(true);
          
          // Trigger search after a brief delay to ensure state is updated
          setTimeout(() => {
            searchFacilities();
          }, 100);
        }
      }
    }
    
    // Clear the rerun flag
    delete window.rerunSearch;
  }
}, [data, currentView]);

useEffect(() => {
  if (currentView === 'apply-facility' && adminFacilities.length === 0) {
    loadAdminFacilities();
  }
}, [currentView]);



  const loadUserProfile = async (userId) => {
    console.log('Loading profile for user:', userId);
    
    if (!userId) {
      console.error('No userId provided to loadUserProfile');
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }
    
    setProfileLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('Profile data:', data);
      console.log('Profile error:', error);
      
      if (error) {
        console.error('Error loading profile:', error);
        
        if (error.code === 'PGRST116') {
          console.log('Profile not found - might be a new user');
          setUserProfile(null);
        }
        setProfileLoading(false);
        return;
      }
      
      if (data) {
        setUserProfile(data);
        console.log('Profile loaded successfully:', data);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Exception loading profile:', err);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadEWCData = async () => {
    try {
      const response = await fetch('/ewc_hierarchy.json');
      const parsed = await response.json();
      console.log('EWC Data loaded:', parsed);
      console.log('Number of chapters:', Object.keys(parsed).length);
      setData(parsed);
      setLoading(false);
    } catch (err) {
      console.error('Error loading EWC data:', err);
      alert('Failed to load EWC data. Please check if ewc_hierarchy.json is in the public folder.');
      setLoading(false);
    }
  };

  const handleSignup = async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      alert(authError.message);
      return false;
    }
    
    if (authData.user) {
      alert('Signup successful! Please check your email to verify your account before logging in.');
      return true;
    }
    return false;
  };

  const handleLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      alert(error.message);
      return false;
    }
    
    setUser(data.user);
    await loadUserProfile(data.user.id);
    setCurrentView('public');
    return true;
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    
    // Clear state immediately for better UX
    setUser(null);
    setUserProfile(null);
    setShowUserMenu(false);
    setCurrentView('public');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        // Don't alert for "Auth session missing" - this is expected if session already expired
        if (error.message !== 'Auth session missing!' && !error.message.includes('session')) {
          alert('Logout error: ' + error.message);
        }
      } else {
        console.log('Logout successful');
      }
    } catch (err) {
      console.error('Logout exception:', err);
      // Silent fail - user state is already cleared
    }
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
      alert('Error loading facilities: ' + error.message);
    } else {
      setAdminFacilities(data || []);
      console.log('Loaded facilities:', data?.length);
    }
  };

  const calculatePostcodeDistance = async (postcode1, postcode2) => {
    try {
      const [response1, response2] = await Promise.all([
        fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode1.replace(/\s/g, ''))}`),
        fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode2.replace(/\s/g, ''))}`)
      ]);
      
      if (!response1.ok || !response2.ok) {
        console.log('Invalid postcode(s)');
        return null;
      }
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      if (!data1.result || !data2.result) {
        return null;
      }
      
      const lat1 = data1.result.latitude;
      const lon1 = data1.result.longitude;
      const lat2 = data2.result.latitude;
      const lon2 = data2.result.longitude;
      
      const R = 3959;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return Math.round(distance * 10) / 10;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  };

  const searchFacilities = async () => {
    if (!finalSelection) {
      console.log('No final selection');
      setSearchLoading(false);
      setIsRerunningSearch(false); // Reset rerun flag
      return;
    }
    
console.log('Search check:', { isRerunningSearch, user: !!user, session: !!session, searchCount: userProfile?.search_count, searchLimit: userProfile?.search_limit });

if (user && session && !isRerunningSearch) {
  if (userProfile && userProfile.subscription_status === 'free' && userProfile.search_count >= userProfile.search_limit) {
    console.log('Search limit reached');
    if (window.confirm('You have reached your free search limit. Would you like to upgrade to continue?')) {
      setCurrentView('pricing');
    }
    return;
  }
}

    setSearchLoading(true);
    console.log('Starting database query...');
    
    try {
      const { data, error } = await supabase
        .from('facility_waste_codes')
        .select(`
          notes,
          max_volume,
          volume_unit,
          price_per_unit,
          currency,
          facilities (
            id,
            name,
            operator_name,
            permit_number,
            address_line1,
            address_line2,
            city,
            postcode,
            phone,
            email,
            website,
            latitude,
            longitude,
            status
          )
        `)
        .eq('ewc_code', finalSelection.code)
        .eq('facilities.status', 'active');

      console.log('Query completed');

      if (error) {
        console.error('Error searching facilities:', error);
        
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          setSearchLoading(false);
          if (user) {
            alert('Your session has expired. Please log in again.');
            await handleLogout();
            setCurrentView('login');
          }
          return;
        }
        
        alert('Error searching facilities: ' + error.message);
        setSearchLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No facilities found for code:', finalSelection.code);
        setFacilities([]);
        setSearchLoading(false);
        
        if (user && userProfile && !isRerunningSearch) {
          console.log('Incrementing search count (not a rerun)');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ search_count: userProfile.search_count + 1 })
            .eq('id', user.id);
          
          if (!updateError) {
            setUserProfile({ ...userProfile, search_count: userProfile.search_count + 1 });
          }
        } else {
          console.log('Skipping search count increment:', { user: !!user, userProfile: !!userProfile, isRerunningSearch });
        }

        return;
      }

      if (user && userProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ search_count: userProfile.search_count + 1 })
          .eq('id', user.id);
        
        if (!updateError) {
          setUserProfile({ ...userProfile, search_count: userProfile.search_count + 1 });
        }
      }

      // Record search to history (but not for reruns)
      if (user && !isRerunningSearch) {
        const { error: historyError } = await supabase
          .from('search_history')
          .insert([{
            user_id: user.id,
            ewc_code: finalSelection.code,
            description: finalSelection.description,
            postcode: userPostcode.trim() || null
          }]);
        
        if (historyError) {
          console.error('Error saving search history:', historyError);
        }
      }
      let formattedFacilities = data.map(item => ({
        id: item.facilities.id,
        name: item.facilities.name,
        operator_name: item.facilities.operator_name,
        permit_number: item.facilities.permit_number,
        address: `${item.facilities.address_line1}${item.facilities.address_line2 ? ', ' + item.facilities.address_line2 : ''}, ${item.facilities.city}`,
        postcode: item.facilities.postcode,
        phone: item.facilities.phone,
        email: item.facilities.email,
        website: item.facilities.website,
        notes: item.notes,
        max_volume: item.max_volume,
        volume_unit: item.volume_unit,
        price_per_unit: item.price_per_unit,
        currency: item.currency || 'GBP'
      }));
      
      if (userPostcode.trim() && sortByDistance) {
        const facilitiesWithDistance = await Promise.all(
          formattedFacilities.map(async (facility) => {
            const distance = await calculatePostcodeDistance(userPostcode, facility.postcode);
            return { ...facility, distance };
          })
        );
        
        facilitiesWithDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        
        setFacilities(facilitiesWithDistance);
      } else {
        setFacilities(formattedFacilities);
      }
    } catch (err) {
      console.error('Exception during search:', err);
      alert('An error occurred during search: ' + err.message);
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

  const isHazardous = (description) => {
    if (!description) return false;
    const desc = description.toUpperCase();
    return desc.includes(' MH') || desc.includes(' AH') || 
           desc.includes('MH ') || desc.includes('AH ') ||
           desc.endsWith('MH') || desc.endsWith('AH');
  };

  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} onSignup={handleSignup} onBack={() => setCurrentView('public')} />;
  }

  if (currentView === 'pricing') {
    return <PricingView onBack={() => setCurrentView('public')} user={user} userProfile={userProfile} onSuccess={() => loadUserProfile(user?.id)} />;
  }

  if (currentView === 'admin' && user && userProfile?.is_admin) {
  return (
    <AdminPanel
      facilities={adminFacilities}
      onRefresh={loadAdminFacilities}
      onLogout={handleLogout}
      onBack={() => setCurrentView('public')}
    />
  );
}
if (currentView === 'profile' && user) {
  return (
    <ProfileView
      user={user}
      userProfile={userProfile}
      onBack={() => setCurrentView('public')}
      onRefreshProfile={() => loadUserProfile(user.id)}
      onNavigateToApply={() => setCurrentView('apply-facility')}
    />
  );
}

if (currentView === 'apply-facility' && user) {
  // Load facilities if not already loaded
  if (adminFacilities.length === 0) {
    loadAdminFacilities();
  }
  
  return (
    <FacilityApplicationView
      user={user}
      onBack={() => setCurrentView('public')}
      facilities={adminFacilities}
    />
  );
}

if (currentView === 'facility-dashboard' && user && userProfile?.owns_facility) {
  return (
    <FacilityOwnerDashboard
      user={user}
      userProfile={userProfile}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
  <div className="flex items-center gap-4 w-full md:w-auto">
            <img 
              src="/wastelocate-logo.png" 
              alt="WasteLocate Logo" 
              className="h-20 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-16 h-16 bg-green-600 rounded-lg items-center justify-center text-white font-bold text-2xl" style={{display: 'none'}}>
              WL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm md:text-base">Find permitted facilities for your waste</p>
            </div>
          </div>
          <div className="flex gap-3 items-center w-full md:w-auto justify-end">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <div className="text-sm text-gray-700 text-right">
                    <p className="font-semibold">{user.email}</p>
                    {profileLoading ? (
                      <p className="text-xs text-gray-500">Loading...</p>
                    ) : userProfile ? (
                      <p className="text-xs">
                        {userProfile.subscription_status === 'free' 
                          ? `${userProfile.search_count}/${userProfile.search_limit} searches` 
                          : 'Pro Plan ⭐'}
                      </p>
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
                        <>
                          <p className="text-xs text-gray-600 mt-1">
                            Plan: <span className="font-semibold">{userProfile.subscription_status === 'free' ? 'Free' : 'Pro'}</span>
                          </p>
                          {userProfile.subscription_status === 'free' && (
                            <p className="text-xs text-gray-600">
                              Searches: {userProfile.search_count}/{userProfile.search_limit}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-gray-600 mt-1">Profile unavailable</p>
                      )}
                    </div>
                    
                    {userProfile?.subscription_status === 'free' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setCurrentView('pricing');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-green-50 font-semibold flex items-center gap-2 border-t border-gray-200"
                      >
                        <span className="text-lg">⭐</span>
                        Upgrade to Pro
                      </button>
                    )}
                    
                    {userProfile?.is_admin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setCurrentView('admin');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 border-t border-gray-200"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </button>
                    )}
                      <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentView('profile');
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      window.location.href = '/blog';
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200"
                  >
                    <BookOpen className="w-4 h-4" />
                    Blog & Resources
                  </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <LogIn className="w-4 h-4" />
                Login / Sign Up
              </button>
            )}
          </div>
        </div>


        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 md:p-8 mb-6 border-2 border-green-200">
  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
    UK Waste Management Made Simple: Find Licensed Facilities & Ensure Compliance
  </h1>
  
  <p className="text-lg leading-relaxed text-gray-700">
    WasteLocate is the UK's comprehensive waste facility directory, designed to connect waste producers with licensed disposal sites while helping businesses maintain regulatory compliance. Whether you're managing construction waste, industrial by-products, or commercial refuse, our platform simplifies the complex process of finding appropriate, permitted facilities for your specific waste streams.
  </p>
</div>

        
        
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Waste Code</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold mb-2">How to Use</h2>
            <ol className="list-decimal ml-5 space-y-2 text-sm">
              <li>Select the <strong>waste origin</strong> (where the waste is generated).</li>
              <li>Then select the <strong>process</strong> that creates the waste.</li>
              <li>Make the final selection to view the most relevant <strong>EWC code</strong>.</li>
            </ol>
            <p className="text-sm mt-3">
              Once selected, a list of disposal sites that accept this waste type will be available.
            </p>
          </div>

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
                <p className="text-sm text-gray-600 mb-2">{finalSelection.description}</p>
                <p className="text-sm">
                  <span className="font-semibold">Classification: </span>
                  <span className={isHazardous(finalSelection.description) ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                    {isHazardous(finalSelection.description) ? 'Hazardous (MH/AH)' : 'Non-hazardous (AN/MN)'}
                  </span>
                </p>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Postcode (Optional - for distance sorting)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={userPostcode}
                    onChange={(e) => setUserPostcode(e.target.value.toUpperCase())}
                    placeholder="e.g., M1 1AE"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                 <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 
                rounded-lg cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                  <input 
                    type="checkbox"
                    checked={sortByDistance}
                    onChange={(e) => setSortByDistance(e.target.checked)}
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-sm font-semibold text-gray-700">Sort by distance</span>
                </label>

                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Enter your postcode to see facilities sorted by distance from your location
                </p>
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Found {facilities.length} Facilit{facilities.length === 1 ? 'y' : 'ies'}
              </h3>
              
              {!user && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {facilities.length}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-800 mb-2">
                        {facilities.length} {facilities.length === 1 ? 'Facility' : 'Facilities'} Available!
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        Sign up for <strong>FREE</strong> to view full facility details including contact information, capacity, and pricing.
                      </p>
                      <button
                        onClick={() => setCurrentView('login')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign Up Free - Get 1 Free Search
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {facilities.map((facility, index) => (
                  <div key={facility.id} className={`relative ${!user ? 'pointer-events-none' : ''}`}>
                    <div className={`border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-colors ${!user ? 'blur-sm' : ''}`}>
                      <button
                        onClick={() => setExpandedFacilityId(expandedFacilityId === facility.id ? null : facility.id)}
                        className="w-full px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-start md:items-center gap-3 md:justify-between bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFacilityId === facility.id ? 'rotate-180' : ''}`} />
                          <div className="text-left">
                            {facility.operator_name && (
                              <h4 className="text-lg font-bold text-gray-800">{facility.operator_name}</h4>
                            )}
                            <p className={`${facility.operator_name ? 'text-sm' : 'text-lg font-bold'} text-gray-600`}>
                              {facility.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">                          {facility.distance !== undefined && facility.distance !== null && (
                            <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                              {facility.distance} miles
                            </span>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {facility.postcode}
                          </span>
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
                                  <a href={`tel:${facility.phone}`} className="text-blue-600 hover:underline">
                                    {facility.phone}
                                  </a>
                                </div>
                              )}
                              {facility.email && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <a href={`mailto:${facility.email}`} className="text-blue-600 hover:underline">
                                    {facility.email}
                                  </a>
                                </div>
                              )}
                              {facility.website && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Globe className="w-4 h-4 flex-shrink-0" />
                                  <a 
                                    href={facility.website.startsWith('http') ? facility.website : `https://${facility.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:underline"
                                  >
                                    Visit Website
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            <div className="bg-white rounded p-4 text-sm space-y-1 border border-gray-200">
                              <p className="font-semibold text-gray-700">Capacity: {facility.max_volume} {facility.volume_unit}</p>
                              {facility.price_per_unit && (
                                <p className="text-gray-600">Price: Â£{facility.price_per_unit} per tonne</p>
                              )}
                              {facility.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
                                  <p className="text-xs text-gray-600">{facility.notes}</p>
                                </div>
                              )}
                            </div>
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

          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="bg-white border border-red-300 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-red-700 mb-2">
                Important Disclaimer
              </h2>
              <p className="text-sm leading-relaxed">
                This tool is provided as a <strong>guide only</strong>. You must always follow the official <strong><a href="https://assets.publishing.service.gov.uk/media/6152d0b78fa8f5610b9c222b/Waste_classification_technical_guidance_WM3.pdf" className="underline text-blue-600" target="_blank" rel="noopener">WM3: Guidance on the Classification and Assessment of Waste</a></strong> and ensure compliance with all applicable legislation and internal procedures.
              </p>
              <div className="text-sm leading-relaxed mt-2">
                <p className="mb-1">Key legislation includes:</p>
                <ul className="list-disc ml-5 mt-1 text-xs text-gray-700">
                  <li><a href="https://www.legislation.gov.uk/uksi/2011/988/contents" className="underline text-blue-600" target="_blank" rel="noopener">The Waste (England and Wales) Regulations 2011</a></li>
                  <li><a href="https://www.legislation.gov.uk/uksi/2005/894/contents" className="underline text-blue-600" target="_blank" rel="noopener">The Hazardous Waste (England and Wales) Regulations 2005</a></li>
                  <li><a href="https://www.gov.uk/government/publications/waste-duty-of-care-code-of-practice" className="underline text-blue-600" target="_blank" rel="noopener">Waste Duty of Care Code of Practice</a></li>
                </ul>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Decisions made using this tool remain your responsibility. If uncertain, consult WM3 or seek professional advice.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 mt-8">
  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
    Complete Guide to Using WasteLocate
  </h2>
  
  <div className="prose max-w-none text-gray-700 space-y-6">
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        How WasteLocate Works for Waste Producers
      </h3>
      
      <p className="leading-relaxed mb-4">
        Finding the right waste facility doesn't need to be complicated. Our intuitive three-step process guides you through the European Waste Catalogue (EWC) hierarchy to identify your exact waste code. Start by selecting the chapter that represents where your waste originates—whether that's construction and demolition, manufacturing processes, or service industries. Next, narrow down to the specific subprocess or activity that generates your waste. Finally, select the precise six-digit EWC code that matches your waste stream.
      </p>

      <p className="leading-relaxed">
        Once you've identified your waste code, WasteLocate instantly searches our comprehensive database of UK waste facilities to show you all permitted sites that can legally accept your waste type. Each facility listing includes crucial information: the operator's contact details, permit numbers for verification, facility addresses with postcode-based distance sorting, capacity information, and indicative pricing where available. This means you can make informed decisions about waste disposal quickly and efficiently, without spending hours researching individual permits or making countless phone calls.
      </p>
    </div>

    <div className="border-t-2 border-gray-200 pt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Compliance Verification and Due Diligence
      </h3>
      
      <p className="leading-relaxed mb-4">
        Under the Environmental Protection Act 1990 and the Waste (England and Wales) Regulations 2011, businesses have a legal Duty of Care when handling waste. This means you must ensure your waste is properly described, stored, transported, and disposed of at appropriately licensed facilities. Failure to comply can result in significant fines and potential criminal prosecution. WasteLocate serves as an essential compliance tool, helping you fulfill these legal obligations by verifying that facilities have the necessary environmental permits to accept your specific waste streams.
      </p>

      <p className="leading-relaxed mb-4">
        Our platform enables businesses to perform proper due diligence before engaging with waste contractors or facilities. Every facility in our database includes its Environment Agency permit number, which you can cross-reference with official records. This transparency helps you avoid the serious legal and financial consequences of inadvertently using unlicensed operators or facilities that don't have the appropriate permissions for your waste type. For businesses managing hazardous waste classified as MH (Mirror Hazardous) or AH (Absolute Hazardous), this verification process is particularly critical, as the regulations and penalties are more stringent.
      </p>

      <p className="leading-relaxed">
        WasteLocate also assists with waste classification checks—one of the most common areas where businesses fall foul of regulations. By clearly indicating whether a waste code is hazardous or non-hazardous, we help you ensure your waste is correctly classified before disposal. This is crucial because misclassifying hazardous waste as non-hazardous (or vice versa) can lead to environmental damage, regulatory breaches, and substantial fines. While our tool provides guidance, we always recommend following the official WM3 guidance document for definitive waste classification, particularly for complex or borderline cases.
      </p>
    </div>

    <div className="border-t-2 border-gray-200 pt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Supporting Waste Transfer Documentation
      </h3>
      
      <p className="leading-relaxed mb-4">
        When transferring waste, UK law requires proper documentation including waste transfer notes (for non-hazardous waste) or consignment notes (for hazardous waste). These documents must include accurate EWC codes and details of where the waste is being taken. WasteLocate streamlines this process by providing you with verified facility information and correct EWC codes, making it easier to complete your waste transfer documentation accurately. This reduces the risk of errors that could invalidate your paperwork and leave you exposed to regulatory action.
      </p>

      <p className="leading-relaxed">
        For businesses that regularly produce the same waste streams, our search history feature (available to registered users) allows you to quickly access previously searched waste codes and facilities. This consistency in your waste management practices not only saves time but also demonstrates a systematic approach to compliance—something that environmental regulators and auditors look for when assessing your waste management procedures.
      </p>
    </div>

    <div className="border-t-2 border-gray-200 pt-6">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              For Facility Operators: Get Your Permit Listed
            </h3>
            <p className="leading-relaxed mb-3">
              Do you operate a licensed waste facility in the UK? Ensure your facility is discoverable by the thousands of waste producers using WasteLocate each month. Being listed on our platform increases your visibility to potential customers actively searching for facilities that can accept their specific waste streams.
            </p>
            <p className="leading-relaxed mb-3">
              To have your facility and environmental permit included in our database, simply email your permit details to <a href="mailto:info@wastelocate.co.uk" className="text-blue-600 hover:underline font-semibold">info@wastelocate.co.uk</a>. We'll review your submission and add your facility to help connect you with waste producers in your area. There's no cost to be listed—we believe in supporting the UK's waste management infrastructure by making it easier for legitimate, licensed operators to reach their target market.
            </p>
            <p className="leading-relaxed">
              Once listed, you can also apply to manage your own facility profile, allowing you to update contact details, adjust accepted waste codes, and modify capacity information as your operations evolve. This ensures waste producers always have the most current information about your services.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Missing Permit? Request a Review
            </h3>
            <p className="leading-relaxed mb-3">
              Can't find a facility you know should be listed? We're constantly working to expand our database to include all licensed waste facilities across the UK. If you've searched for a waste code and notice that a facility with the appropriate environmental permit isn't featured in our results, we want to know about it.
            </p>
            <p className="leading-relaxed mb-3">
              Simply email the facility details and permit number to <a href="mailto:info@wastelocate.co.uk" className="text-blue-600 hover:underline font-semibold">info@wastelocate.co.uk</a>, and our team will review and add it to our database free of charge. This community-driven approach helps ensure WasteLocate remains the most comprehensive waste facility directory in the UK, benefiting all users by providing the widest possible choice of compliant disposal options.
            </p>
            <p className="leading-relaxed">
              Your feedback also helps us identify gaps in coverage and prioritize which regions or waste streams need additional facility listings, making the platform more valuable for everyone in the waste management sector.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t-2 border-gray-200 pt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Distance-Based Search and Local Solutions
      </h3>
      
      <p className="leading-relaxed mb-4">
        Environmental responsibility increasingly means minimizing waste miles—the distance waste travels from generation to final disposal. Transporting waste long distances increases carbon emissions, fuel costs, and the overall environmental impact of waste management. WasteLocate's postcode-based distance sorting helps you identify the nearest appropriate facilities, supporting both environmental objectives and cost reduction.
      </p>

      <p className="leading-relaxed">
        By entering your postcode, you can see facilities ranked by proximity, with distances calculated in miles. This feature is particularly valuable for high-volume waste producers or those managing regular waste collections, where transportation costs form a significant portion of overall waste management expenses. Choosing local facilities where possible also supports regional economic development and reduces the traffic impact of waste transportation on road networks.
      </p>
    </div>

    <div className="border-t-2 border-gray-200 pt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Understanding EWC Codes and Waste Classification
      </h3>
      
      <p className="leading-relaxed mb-4">
        The European Waste Catalogue provides a standardized system for classifying waste across all member states (and continues to be used in the UK post-Brexit). Each waste type is assigned a six-digit code, structured hierarchically: the first two digits represent the chapter (waste source), the next two represent the subchapter (specific process), and the final two identify the exact waste type. This system ensures clarity and consistency when discussing waste types with regulators, contractors, and disposal facilities.
      </p>

      <p className="leading-relaxed">
        Some waste codes are marked as "mirror entries," meaning they have both hazardous (marked with an asterisk or designated MH/AH) and non-hazardous (marked AN/MN) versions depending on the waste's properties. Correctly determining which applies to your waste is crucial, as hazardous and non-hazardous wastes are subject to different regulations, handling requirements, and disposal routes. WasteLocate clearly indicates whether codes are hazardous or non-hazardous, but final classification responsibility remains with the waste producer, supported by appropriate testing and assessment as outlined in WM3 guidance.
      </p>
    </div>

    <div className="border-t-2 border-gray-200 pt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Planning Ahead and Cost Transparency
      </h3>
      
      <p className="leading-relaxed mb-4">
        Understanding disposal costs before waste is generated allows for better project planning and budgeting. Where facility operators have provided pricing information, WasteLocate displays indicative rates per tonne, giving you a starting point for cost estimates. While final prices will depend on various factors including waste volumes, contamination levels, and specific handling requirements, having baseline pricing information helps you budget accurately and compare options.
      </p>

      <p className="leading-relaxed">
        This transparency also helps identify when waste segregation at source might be cost-effective. Some mixed waste streams incur higher disposal costs than separated materials, so understanding the economics can influence your waste management strategy. For construction projects, this information during the planning phase can inform material choices and waste minimization strategies, potentially reducing overall project costs while improving environmental performance.
      </p>
    </div>
  </div>
</div>

        
        <Footer />
        
      </div>
    </div>
  );
}

function LoginView({ onLogin, onSignup, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    if (isSignup) {
      await onSignup(email, password);
    } else {
      await onLogin(email, password);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isSignup ? 'Sign Up' : 'Login'}
          </h2>
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
              placeholder="you@example.com"
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
              placeholder="***************"
            />
          </div>
          {isSignup && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                By signing up, you get 1 free search. Upgrade to Pro for unlimited searches!
              </p>
            </div>
          )}
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
                {isSignup ? 'Sign Up' : 'Login'}
              </>
            )}
          </button>
          <div className="text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingView({ onBack, user, userProfile, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (priceId, productType) => {
  if (!user) {
    alert('Please log in to purchase');
    return;
  }

  console.log('User object:', user);
  console.log('User email:', user.email);

  if (!user.email) {
    alert('No email found for user. Please log out and log in again.');
    return;
  }

  setLoading(true);
  
  try {
    const requestData = {
      priceId,
      userId: user.id,
      email: user.email,
      productType,
    };
    
    console.log('Sending checkout request with data:', requestData);
    
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Function error:', errorText);
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL received');
      }
      
      console.log('Redirecting to Stripe checkout:', url);
      window.location.href = url;
      
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Failed to initiate purchase. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <Home className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 text-center mb-12">Find permitted waste facilities across the UK</p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Free Trial</h3>
            <p className="text-4xl font-bold text-gray-900 mb-4">£0</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> 1 free search
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Basic facility information
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> EWC code lookup
              </li>
            </ul>
            {!user ? (
              <button 
                onClick={onBack}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
              >
                Sign Up Free
              </button>
            ) : (
              <button disabled className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed">
                Current Plan
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              FLEXIBLE
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Pay As You Go</h3>
            <p className="text-4xl font-bold text-gray-900 mb-1">£10</p>
            <p className="text-sm text-gray-600 mb-4">for 5 searches</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> 5 facility searches
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Full contact details
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Disposal Costs (if available) 
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Distance sorting
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Email invoice
              </li>
            </ul>
            <button 
              onClick={() => handlePurchase('price_1STgeYRy6wJc4RiFxIERqEbK', 'payg')}
              disabled={loading || !user}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
            
            {!user && <p className="text-xs text-center text-gray-500 mt-2">Login required</p>}
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 border-4 border-green-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              BEST VALUE
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Pro Unlimited</h3>
            <div className="mb-4">
              <p className="text-4xl font-bold text-gray-900">£10<span className="text-lg font-normal text-gray-600">/month</span></p>
              <p className="text-sm text-gray-600 mt-1">or £100/year (save 17%)</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Unlimited searches
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Full facility details
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Priority support
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Advanced filtering
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Export facility lists
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span> Monthly invoices
              </li>
            </ul>
            <div className="space-y-2">
              <button 
                onClick={() => handlePurchase('price_1STgf8Ry6wJc4RiFatY8R1u5', 'pro_monthly')}
                disabled={loading || !user}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Processing...' : 'Subscribe Monthly'}
              </button>
              <button 
                onClick={() => handlePurchase('price_1STgg1Ry6wJc4RiF27FLeNlO', 'pro_annual')}
                disabled={loading || !user}
                className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Processing...' : 'Subscribe Annually'}
              </button>
            </div>
            {!user && <p className="text-xs text-center text-gray-500 mt-2">Login required</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Choose WasteLocate?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-600">Powered by Stripe. Your data is encrypted and secure.</p>
            </div>
            <div className="text-center">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 mb-2">Email Invoices</h4>
              <p className="text-sm text-gray-600">Receive detailed invoices for every transaction.</p>
            </div>
            <div className="text-center">
              <Phone className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800 mb-2">UK Support</h4>
              <p className="text-sm text-gray-600">Contact us at info@wastelocate.co.uk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function AdminPanel({ facilities, onRefresh, onLogout, onBack }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('facilities');
  const [users, setUsers] = useState([]);
  const itemsPerPage = 50;
  const [applications, setApplications] = useState([]);

useEffect(() => {
  onRefresh();
  if (activeTab === 'users') {
    loadUsers();
  } else if (activeTab === 'applications') {
    loadApplications();
  }
}, [activeTab]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading users:', error);
      alert('Error loading users: ' + error.message);
    } else {
      setUsers(data || []);
    }
  };
const loadApplications = async () => {
  try {
    // First, get all applications with facilities
    const { data: appsData, error: appsError } = await supabase
      .from('facility_applications')
      .select(`
        *,
        facilities (
          name,
          permit_number,
          postcode,
          city
        )
      `)
      .order('created_at', { ascending: false });
    
    if (appsError) throw appsError;
    
    if (!appsData || appsData.length === 0) {
      setApplications([]);
      return;
    }
    
    // Get unique user IDs
    const userIds = [...new Set(appsData.map(app => app.user_id))];
    
    // Fetch user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, company')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Create a map of profiles by ID
    const profilesMap = {};
    (profilesData || []).forEach(profile => {
      profilesMap[profile.id] = profile;
    });
    
    // Combine the data
    const combinedData = appsData.map(app => ({
      ...app,
      profiles: profilesMap[app.user_id] || { email: 'Unknown', name: null, company: null }
    }));
    
    setApplications(combinedData);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
              Public View
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

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'facilities'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Facilities ({facilities.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('waste-codes')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'waste-codes'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Waste Codes
            </button>

<button
  onClick={() => setActiveTab('applications')}
  className={`flex-1 px-6 py-4 font-semibold transition-colors ${
    activeTab === 'applications'
      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
  }`}
>
  Applications ({applications.length})
</button>



          </div>
        </div>

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
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Facility
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operator</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permit Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Postcode</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedFacilities.length > 0 ? (
                  paginatedFacilities.map(facility => (
                    <tr key={facility.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{facility.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{facility.operator_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{facility.permit_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{facility.city || '-'}</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `No facilities found matching "${searchTerm}"` : 'No facilities found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
        )}

        {activeTab === 'users' && (
          <UsersManagement users={users} onRefresh={loadUsers} />
        )}

        {activeTab === 'waste-codes' && (
          <WasteCodesManagement facilities={facilities} onRefresh={onRefresh} />
        )}
        {activeTab === 'applications' && (
  <ApplicationsManagement 
    applications={applications} 
    onRefresh={() => {
      loadApplications();
      onRefresh(); // Refresh facilities too since they might be updated
    }} 
  />
)}
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const toggleAdmin = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (error) {
      alert('Error updating admin status: ' + error.message);
    } else {
      onRefresh();
    }
  };

  const updateSubscription = async (userId, newStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: newStatus })
      .eq('id', userId);

    if (error) {
      alert('Error updating subscription: ' + error.message);
    } else {
      onRefresh();
    }
  };

  const resetSearchCount = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ search_count: 0 })
      .eq('id', userId);

    if (error) {
      alert('Error resetting search count: ' + error.message);
    } else {
      onRefresh();
    }
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Searches</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{user.email || user.id.substring(0, 8) + '...'}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.subscription_status}
                    onChange={(e) => updateSubscription(user.id, e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.search_count}/{user.search_limit}
                  {user.subscription_status === 'free' && (
                    <button
                      onClick={() => resetSearchCount(user.id)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Reset
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleAdmin(user.id, user.is_admin)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_admin
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {user.is_admin ? 'Admin' : 'User'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this user?')) {
                        supabase.from('profiles').delete().eq('id', user.id).then(() => onRefresh());
                      }
                    }}
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
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function WasteCodesManagement({ facilities, onRefresh }) {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityCodes, setFacilityCodes] = useState([]);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);

  const loadFacilityCodes = async (facilityId) => {
    const { data, error } = await supabase
      .from('facility_waste_codes')
      .select('*')
      .eq('facility_id', facilityId);
    
    if (error) {
      alert('Error loading waste codes: ' + error.message);
    } else {
      setFacilityCodes(data || []);
    }
  };

  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility);
    loadFacilityCodes(facility.id);
  };

  const deleteCode = async (codeId) => {
    if (!confirm('Are you sure you want to delete this waste code?')) return;

    const { error } = await supabase
      .from('facility_waste_codes')
      .delete()
      .eq('id', codeId);

    if (error) {
      alert('Error deleting waste code: ' + error.message);
    } else {
      loadFacilityCodes(selectedFacility.id);
      onRefresh();
    }
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
              className={`w-full text-left p-4 mb-2 rounded-lg border-2 transition-colors ${
                selectedFacility?.id === facility.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-800">{facility.name}</p>
              <p className="text-sm text-gray-600">{facility.permit_number}</p>
              <p className="text-xs text-gray-500 mt-1">
                {facility.facility_waste_codes?.length || 0} waste codes
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Waste Codes</h2>
              {selectedFacility && (
                <p className="text-sm text-gray-600 mt-1">{selectedFacility.name}</p>
              )}
            </div>
            {selectedFacility && (
              <button
                onClick={() => setShowAddCodeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Code
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
                      {code.notes && (
                        <p className="text-sm text-gray-600 mt-1">{code.notes}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        {code.max_volume && (
                          <span>Max: {code.max_volume} {code.volume_unit}</span>
                        )}
                        {code.price_per_unit && (
                          <span>Â£{code.price_per_unit}/tonne</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCode(code.id)}
                      className="text-red-600 hover:text-red-800"
                    >
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
          onSuccess={() => {
            setShowAddCodeModal(false);
            loadFacilityCodes(selectedFacility.id);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function ApplicationsManagement({ applications, onRefresh }) {
  const [processingId, setProcessingId] = useState(null);

const handleApplication = async (applicationId, facilityId, userId, status) => {
  const action = status === 'approved' ? 'approve' : 'reject';
  if (!confirm(`Are you sure you want to ${action} this application?`)) return;

  setProcessingId(applicationId);
  
  try {
    // If approved, update facility and user profile FIRST
    if (status === 'approved') {
      console.log('Approving application for user:', userId, 'facility:', facilityId);
      
        const check = await supabase
          .from('facilities')
          .select('id')
          .eq('id', facilityId);

        console.log("CHECK MATCH:", check);


      // Link facility to user
      const { data: facilityData, error: facilityError } = await supabase
        .from('facilities')
        .update({ owner_id: userId })
        .eq('id', facilityId)
        .select();

      console.log('Facility update result:', facilityData, facilityError);
      
      if (facilityError) {
        console.error('Facility update error:', facilityError);
        throw facilityError;
      }

      // Update user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ owns_facility: true })
        .eq('id', userId)
        .select();

      console.log('Profile update result:', profileData, profileError);
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
    }

    // Update application status
    const { data: appData, error: appError } = await supabase
      .from('facility_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user.id
      })
      .eq('id', applicationId)
      .select();

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

  const pendingApplications = applications.filter(a => a.status === 'pending');
  const reviewedApplications = applications.filter(a => a.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Pending Applications ({pendingApplications.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve facility management applications
          </p>
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
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {app.facilities.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {app.facilities.permit_number} • {app.facilities.city}, {app.facilities.postcode}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {app.profiles.name || 'Name not provided'}
                        </p>
                        <p className="text-sm text-gray-600">{app.profiles.email}</p>
                        {app.profiles.company && (
                          <p className="text-xs text-gray-500">{app.profiles.company}</p>
                        )}
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
                      Applied: {new Date(app.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApplication(app.id, app.facility_id, app.user_id, 'approved')}
                      disabled={processingId === app.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                    >
                      {processingId === app.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApplication(app.id, app.facility_id, app.user_id, 'rejected')}
                      disabled={processingId === app.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                    >
                      {processingId === app.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviewed Applications */}
      {reviewedApplications.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Reviewed Applications ({reviewedApplications.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Facility</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewedApplications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {app.profiles.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600">{app.profiles.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{app.facilities.name}</p>
                      <p className="text-xs text-gray-600">{app.facilities.permit_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : 'N/A'}
                    </td>
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

function AddWasteCodeModal({ facility, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ewc_code: '',
    notes: '',
    max_volume: '',
    volume_unit: 'tonnes',
    price_per_unit: '',
    currency: 'GBP'
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
              onChange={(e) => setFormData({...formData, ewc_code: e.target.value})}
              placeholder="e.g., 17 01 01"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Volume</label>
              <input
                type="number"
                value={formData.max_volume}
                onChange={(e) => setFormData({...formData, max_volume: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
              <select
                value={formData.volume_unit}
                onChange={(e) => setFormData({...formData, volume_unit: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="tonnes">Tonnes</option>
                <option value="cubic meters">Cubic Meters</option>
                <option value="loads">Loads</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Tonne (Â£)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price_per_unit}
              onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
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
              {loading ? 'Adding...' : 'Add Code'}
            </button>
          </div>
        </div>
      </div>
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


// Add this new component after the EditFacilityModal function (around line 1400)
// and before the end of the file

function ProfileView({ user, userProfile, onBack, onRefreshProfile, onNavigateToApply }) {
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
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
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
          <div className={`rounded-lg shadow-xl p-6 ${
            userProfile?.subscription_status === 'pro' 
              ? 'bg-gradient-to-br from-green-50 to-green-100' 
              : 'bg-white'
          }`}>
            <div className="flex items-start gap-3">
              <CreditCard className={`w-5 h-5 mt-0.5 ${
                userProfile?.subscription_status === 'pro' ? 'text-green-600' : 'text-gray-500'
              }`} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-3">Subscription Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      userProfile?.subscription_status === 'pro'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
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
                        ></div>
                      </div>
                    </div>
                  )}
                  {userProfile?.subscription_status === 'pro' && (
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-sm text-gray-700">
                        ✓ Unlimited searches
                      </div>
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
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {formData.name || <span className="text-gray-400">Not provided</span>}
                  </div>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company / Organization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Enter company name"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {formData.company || <span className="text-gray-400">Not provided</span>}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {formData.phone || <span className="text-gray-400">Not provided</span>}
                  </div>
                )}
              </div>

              {/* Postcode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Postcode
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({...formData, postcode: e.target.value.toUpperCase()})}
                    placeholder="e.g., M1 1AE"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {formData.postcode || <span className="text-gray-400">Not provided</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
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
            setTimeout(() => {
              window.location.hash = 'facility-dashboard';
            }, 100);
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
{!userProfile?.owns_facility && (
  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-xl p-6">
    <div className="flex items-start gap-3">
      <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-2">Facility Owner?</h3>
        <p className="text-sm text-gray-700 mb-3">
          If you own or operate a waste facility, apply to manage your facility listing and keep it up to date.
        </p>
<button
  onClick={onNavigateToApply}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  <Building2 className="w-4 h-4" />
  Apply to Manage Facility
</button>
      </div>
    </div>
  </div>
)}

          {/* Search History */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800 text-lg">Recent Searches</h3>
              </div>
              <span className="text-sm text-gray-500">
                Last {searchHistory.length} searches
              </span>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {search.ewc_code}
                        </span>
                        {search.postcode && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            <MapPin className="w-3 h-3" />
                            {search.postcode}
                          </span>
                        )}
                        {search.description && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                            {search.description.length > 50 
                              ? search.description.substring(0, 50) + '...' 
                              : search.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(search.searched_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div> 
                    <button
                      onClick={() => {
                        // Pass the search data back to parent to rerun
                        if (window.confirm('Rerun this search? This could count against your search limit.')) {
                          onBack();
                          // Signal to rerun search with this data
                          window.rerunSearch = {
                            ewcCode: search.ewc_code,
                            postcode: search.postcode || ''
                          };
                        }
                      }}
                      className="w-full md:w-auto md:ml-4 px-3 py-2 text-sm md:text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"                      title="Rerun this search (free)"
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

function FacilityApplicationView({ user, onBack, facilities }) {
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
        .select(`
          *,
          facilities (
            name,
            permit_number,
            postcode
          )
        `)
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
        .insert([{
          user_id: user.id,
          facility_id: selectedFacility,
          message: message.trim()
        }]);

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
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
          >
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search for Facility
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, permit number, or postcode..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Facility *
              </label>
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
              <p className="text-xs text-gray-500 mt-1">
                {filteredFacilities.length} facilities available
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Why should you manage this facility? *
              </label>
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
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </div>

        {/* My Applications */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">My Applications</h3>
          
          {applicationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

function FacilityOwnerDashboard({ user, userProfile, onBack }) {
  const [myFacility, setMyFacility] = useState(null);
  const [wasteCodes, setWasteCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFacility, setEditingFacility] = useState(false);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [facilityForm, setFacilityForm] = useState({});

  useEffect(() => {
    loadMyFacility();
  }, [user]);

  const loadMyFacility = async () => {
    setLoading(true);
    try {
      // Load facility owned by this user
      const { data: facilityData, error: facilityError } = await supabase
  .from('facilities')
  .select('*')
  .eq('owner_id', user.id)
  .single();

      if (facilityError) {
        if (facilityError.code === 'PGRST116') {
          // No facility found
          setMyFacility(null);
        } else {
          throw facilityError;
        }
      } else {
        setMyFacility(facilityData);
        setFacilityForm(facilityData);
        loadWasteCodes(facilityData.id);
      }
    } catch (error) {
      console.error('Error loading facility:', error);
      alert('Error loading your facility: ' + error.message);
    } finally {
      setLoading(false);
    }
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
        .eq('id', myFacility.id);

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
      loadWasteCodes(myFacility.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your facility...</p>
        </div>
      </div>
    );
  }

  if (!myFacility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors mb-6"
          >
            <Home className="w-5 h-5" />
            Back
          </button>
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Facility Assigned</h2>
            <p className="text-gray-600">
              You don't have a facility assigned to your account yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Facility Dashboard</h1>
              <p className="text-gray-600">Manage your facility information and waste codes</p>
            </div>
          </div>
        </div>

        {/* Facility Information */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Facility Information</h2>
            {!editingFacility ? (
              <button
                onClick={() => setEditingFacility(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={updateFacility}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingFacility(false);
                    setFacilityForm(myFacility);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Facility Name</label>
              {editingFacility ? (
                <input
                  type="text"
                  value={facilityForm.name || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Operator Name</label>
              {editingFacility ? (
                <input
                  type="text"
                  value={facilityForm.operator_name || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, operator_name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.operator_name || '-'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Permit Number</label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 font-mono">{myFacility.permit_number}</p>
              <p className="text-xs text-gray-500 mt-1">Contact admin to change permit number</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
              {editingFacility ? (
                <input
                  type="text"
                  value={facilityForm.address_line1 || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, address_line1: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.address_line1 || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
              {editingFacility ? (
                <input
                  type="text"
                  value={facilityForm.address_line2 || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, address_line2: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.address_line2 || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              {editingFacility ? (
                <input
                  type="text"
                  value={facilityForm.city || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, city: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.city || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode</label>
              {editingFacility ? (
                <input
                  type="text"
                  value={facilityForm.postcode || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, postcode: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.postcode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              {editingFacility ? (
                <input
                  type="tel"
                  value={facilityForm.phone || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.phone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              {editingFacility ? (
                <input
                  type="email"
                  value={facilityForm.email || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, email: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.email || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
              {editingFacility ? (
                <input
                  type="url"
                  value={facilityForm.website || ''}
                  onChange={(e) => setFacilityForm({...facilityForm, website: e.target.value})}
                  placeholder="https://"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{myFacility.website || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Waste Codes */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Accepted Waste Codes</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage the EWC codes your facility can accept
              </p>
            </div>
            <button
              onClick={() => setShowAddCodeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Waste Code
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
                      {code.notes && (
                        <p className="text-sm text-gray-600 mt-1">{code.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCode(code)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWasteCode(code.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    {code.max_volume && (
                      <div className="bg-blue-50 px-3 py-2 rounded">
                        <p className="text-xs text-gray-600">Max Volume</p>
                        <p className="font-semibold text-gray-800">
                          {code.max_volume} {code.volume_unit}
                        </p>
                      </div>
                    )}
                    {code.price_per_unit && (
                      <div className="bg-green-50 px-3 py-2 rounded">
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="font-semibold text-gray-800">
                          £{code.price_per_unit}/tonne
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Waste Code Modal */}
      {showAddCodeModal && (
        <OwnerAddWasteCodeModal
          facilityId={myFacility.id}
          onClose={() => setShowAddCodeModal(false)}
          onSuccess={() => {
            setShowAddCodeModal(false);
            loadWasteCodes(myFacility.id);
          }}
        />
      )}

      {/* Edit Waste Code Modal */}
      {editingCode && (
        <OwnerEditWasteCodeModal
          code={editingCode}
          onClose={() => setEditingCode(null)}
          onSuccess={() => {
            setEditingCode(null);
            loadWasteCodes(myFacility.id);
          }}
        />
      )}
    </div>
  );
}

function OwnerAddWasteCodeModal({ facilityId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ewc_code: '',
    notes: '',
    max_volume: '',
    volume_unit: 'tonnes',
    price_per_unit: '',
    currency: 'GBP'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.ewc_code.trim()) {
      alert('Please enter an EWC code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('facility_waste_codes')
        .insert([{
          facility_id: facilityId,
          ewc_code: formData.ewc_code.trim(),
          notes: formData.notes.trim() || null,
          max_volume: formData.max_volume ? parseFloat(formData.max_volume) : null,
          volume_unit: formData.volume_unit,
          price_per_unit: formData.price_per_unit ? parseFloat(formData.price_per_unit) : null,
          currency: formData.currency
        }]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error adding waste code:', error);
      alert('Error adding waste code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add Waste Code</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              EWC Code *
            </label>
            <input
              type="text"
              value={formData.ewc_code}
              onChange={(e) => setFormData({...formData, ewc_code: e.target.value})}
              placeholder="e.g., 17 01 01"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                onChange={(e) => setFormData({...formData, max_volume: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
              <select
                value={formData.volume_unit}
                onChange={(e) => setFormData({...formData, volume_unit: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tonnes">Tonnes</option>
                <option value="cubic meters">Cubic Meters</option>
                <option value="loads">Loads</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price per Tonne (£)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price_per_unit}
              onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerEditWasteCodeModal({ code, onClose, onSuccess }) {
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
            <p className="px-4 py-2 bg-gray-100 rounded-lg font-mono font-bold text-gray-800">
              {code.ewc_code}
            </p>
            <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                onChange={(e) => setFormData({...formData, max_volume: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
              <select
                value={formData.volume_unit}
                onChange={(e) => setFormData({...formData, volume_unit: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tonnes">Tonnes</option>
                <option value="cubic meters">Cubic Meters</option>
                <option value="loads">Loads</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price per Tonne (£)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price_per_unit}
              onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





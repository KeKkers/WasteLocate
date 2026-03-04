import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function useFacilities({ user, session, userProfile, setUserProfile, setCurrentView, isRerunningSearch, setIsRerunningSearch, finalSelection }) {
  const [facilities, setFacilities] = useState([]);
  const [adminFacilities, setAdminFacilities] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandedFacilityId, setExpandedFacilityId] = useState(null);
  const [userPostcode, setUserPostcode] = useState('');
  const [sortByDistance, setSortByDistance] = useState(false);

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

      if (!data1.result || !data2.result) return null;

      const lat1 = data1.result.latitude;
      const lon1 = data1.result.longitude;
      const lat2 = data2.result.latitude;
      const lon2 = data2.result.longitude;

      const R = 3959;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return Math.round(distance * 10) / 10;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  };

  const loadAdminFacilities = async () => {
    const { data, error } = await supabase
      .from('facilities')
      .select(`*, facility_waste_codes (ewc_code)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading facilities:', error);
      alert('Error loading facilities: ' + error.message);
    } else {
      setAdminFacilities(data || []);
      console.log('Loaded facilities:', data?.length);
    }
  };

  const searchFacilities = async (handleLogout) => {
    if (!finalSelection) {
      console.log('No final selection');
      setSearchLoading(false);
      setIsRerunningSearch(false);
      return;
    }

    console.log('Search check:', { isRerunningSearch, user: !!user, session: !!session, searchCount: userProfile?.search_count, searchLimit: userProfile?.search_limit });

    setSearchLoading(true);
    console.log('Starting database query...');

    try {
      const { data, error } = await supabase
        .from('facility_waste_codes')
        .select(`
          notes, max_volume, volume_unit, price_per_unit, currency,
          facilities (
            id, name, operator_name, permit_number,
            address_line1, address_line2, city, postcode,
            phone, email, website, latitude, longitude, status
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
    setIsRerunningSearch(false);
  };

  return {
    facilities, setFacilities,
    adminFacilities,
    searchLoading,
    expandedFacilityId, setExpandedFacilityId,
    userPostcode, setUserPostcode,
    sortByDistance, setSortByDistance,
    loadAdminFacilities,
    searchFacilities,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth(setCurrentView) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  const handleSignup = async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

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

    setUser(null);
    setUserProfile(null);
    setCurrentView('public');

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        if (error.message !== 'Auth session missing!' && !error.message.includes('session')) {
          alert('Logout error: ' + error.message);
        }
      } else {
        console.log('Logout successful');
      }
    } catch (err) {
      console.error('Logout exception:', err);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('reset-password');
        return;
      }

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

  return {
    session,
    user,
    userProfile,
    setUserProfile,
    profileLoading,
    handleSignup,
    handleLogin,
    handleLogout,
    loadUserProfile,
  };
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (userProfile) {
        const user: User = {
          id: userProfile.id,
          username: userProfile.username,
          password: '', // We don't store passwords in our custom table
          role: userProfile.role,
          createdAt: userProfile.created_at,
          firstName: userProfile.first_name,
          middleName: userProfile.middle_name,
          lastName: userProfile.last_name,
          birthday: userProfile.birthday,
          address: userProfile.address,
          contactNumber: userProfile.contact_number,
          email: userProfile.email,
          profileImage: userProfile.profile_image,
          profileUpdatedAt: userProfile.profile_updated_at,
          isActive: userProfile.is_active,
          lastTimeIn: userProfile.last_time_in,
          lastTimeOut: userProfile.last_time_out,
        };
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      // First, get the user's email from our users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('email, auth_user_id')
        .eq('username', username)
        .single();

      if (userError || !userRecord?.email) {
        throw new Error('Invalid username or password');
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password: password,
      });

      if (error) {
        throw new Error('Invalid username or password');
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Fetch and set user profile
      await fetchUserProfile(data.user);
      
      if (!currentUser) {
        throw new Error('Failed to load user profile');
      }

      return currentUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already taken');
      }

      // Check if this is the first user (will be admin)
      const { data: userCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' });

      const role = (userCount?.length || 0) === 0 ? 'admin' : 'staff';
      
      // Create a temporary email for Supabase auth
      const tempEmail = `${username}@winehouse.local`;

      // Sign up with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password: password,
        options: {
          data: {
            username: username,
            role: role,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed');
      }

      // The user profile will be created automatically by the trigger
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch the created user profile
      await fetchUserProfile(data.user);
      
      if (!currentUser) {
        throw new Error('Failed to create user profile');
      }

      return currentUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileData.firstName,
          middle_name: profileData.middleName,
          last_name: profileData.lastName,
          birthday: profileData.birthday,
          address: profileData.address,
          contact_number: profileData.contactNumber,
          email: profileData.email,
          profile_image: profileData.profileImage,
          profile_updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update current user state
      const updatedUser: User = {
        ...currentUser,
        ...profileData,
        profileUpdatedAt: new Date().toISOString(),
      };

      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setCurrentUser(null);
    } catch (error) {
      console.error('Error in logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
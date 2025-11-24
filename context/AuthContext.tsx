import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
    createUserProfile,
    createStudentProfile,
    createTeacherProfile,
    getUserRole,
} from '../lib/database';

type UserRole = 'admin' | 'teacher' | 'student' | null;

export type SignUpPayload = {
    role: 'student' | 'teacher';
    fullName: string;
    email: string;
    password: string;
    enrollmentNumber?: string;
    classId?: string;
    classLevel?: string;
    branch?: string;
    department?: string;
};

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: UserRole;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (payload: SignUpPayload) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    error: null,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserRole = async (userId: string) => {
        try {
            console.log('🔍 fetchUserRole called for userId:', userId);
            let attempts = 0;
            const maxAttempts = 3;
            let roleData = null;

            while (attempts < maxAttempts) {
                console.log(`🔍 Attempt ${attempts + 1}/${maxAttempts} to fetch role for user ${userId}`);
                const { data, error } = await getUserRole(userId);

                if (error) {
                    console.error(`❌ Error fetching user role (Attempt ${attempts + 1}):`, error);
                    // PGRST116 means "No rows found" - profile might not be created yet by trigger
                    if (error.code === 'PGRST116' || error.message?.includes('User profile not found')) {
                        console.log(`🟡 User profile not found (Attempt ${attempts + 1}/${maxAttempts}). Retrying in 1s...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        attempts++;
                        continue;
                    }

                    console.error('❌ Fatal error fetching user role:', error);
                    setRole(null);
                    return;
                }

                console.log('✅ Role data received:', data);
                roleData = data;
                break;
            }

            if (roleData) {
                console.log(`✅ Setting role to: "${roleData}" for user ${userId}`);
                setRole(roleData as UserRole);
            } else {
                console.error('❌ Failed to fetch user role after multiple attempts.');
                console.error('❌ User will have role = null');
                setRole(null);
            }
        } catch (error) {
            console.error('❌ CRASH in fetchUserRole:', error);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        async function initAuth() {
            try {
                // Check active session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth check error:', error);
                    if (mounted) setLoading(false);
                    return;
                }

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchUserRole(session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (e) {
                console.error('Unexpected auth init error:', e);
                if (mounted) setLoading(false);
            }
        }

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                const errorMsg = error.message || 'Invalid credentials';
                setError(errorMsg);
                setLoading(false);
                return { error: errorMsg };
            }

            if (data.user) {
                await fetchUserRole(data.user.id);
            }

            return { error: null };
        } catch (err: any) {
            const errorMsg = err.message || 'An unexpected error occurred';
            setError(errorMsg);
            setLoading(false);
            return { error: errorMsg };
        }
    };

    const signUp = async (payload: SignUpPayload): Promise<{ error: string | null }> => {
        console.log('🟢 AuthContext.signUp called with payload:', { ...payload, password: '***' });
        try {
            setLoading(true);
            setError(null);

            // Step 1: Create auth user with metadata
            // The database trigger will handle creating the public.users profile
            console.log('🟢 Step 1: Creating auth user with metadata...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: payload.email,
                password: payload.password,
                options: {
                    data: {
                        full_name: payload.fullName,
                        role: payload.role, // Pass role in metadata for the trigger
                    }
                }
            });

            if (authError) {
                console.error('❌ Auth signup error:', authError);
                const errorMsg = authError.message || 'Signup failed';
                setError(errorMsg);
                setLoading(false);
                return { error: errorMsg };
            }

            if (!authData.user) {
                console.error('❌ No user data returned from auth signup');
                const errorMsg = 'User creation failed';
                setError(errorMsg);
                setLoading(false);
                return { error: errorMsg };
            }

            const userId = authData.user.id;
            console.log('✅ Auth user created with ID:', userId);

            // Check if session exists (email confirmation might be required)
            if (!authData.session) {
                console.log('⚠️ No session returned. Email verification likely required.');
                setLoading(false);
                return { error: null }; // Return success, UI should show "Check your email" message
            }

            // Step 2: Create role-specific profile
            // We can only do this if we have a session (user is logged in)
            // If email verification is on, this part will happen after they click the link and log in
            // For now, we'll assume if we have a session, we can proceed.

            // Wait a bit for the trigger to create the user profile
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (payload.role === 'student') {
                console.log('🟢 Step 2: Creating student profile...');
                if (!payload.enrollmentNumber) {
                    console.error('❌ Missing enrollment number for student');
                    const errorMsg = 'Enrollment number is required for students';
                    setError(errorMsg);
                    setLoading(false);
                    return { error: errorMsg };
                }

                const { error: studentError } = await createStudentProfile(
                    userId,
                    payload.enrollmentNumber,
                    payload.classId || null,
                    payload.classLevel || null,
                    payload.branch || null
                );

                if (studentError) {
                    console.error('❌ Failed to create student profile:', studentError);
                    // Don't fail the whole signup, just warn
                    // setError('Profile creation failed. Please contact support.');
                } else {
                    console.log('✅ Student profile created');
                }
            } else if (payload.role === 'teacher') {
                console.log('🟢 Step 2: Creating teacher profile...');
                const { error: teacherError } = await createTeacherProfile(
                    userId,
                    payload.department || ''
                );

                if (teacherError) {
                    console.error('❌ Failed to create teacher profile:', teacherError);
                } else {
                    console.log('✅ Teacher profile created');
                }
            }

            // Step 3: Set user and role in context
            console.log('🟢 Step 3: Setting user and role in context...');
            setUser(authData.user);
            setRole(payload.role);
            setLoading(false);

            console.log('✅ Signup completed successfully!');
            return { error: null };
        } catch (err: any) {
            console.error('❌ CRASH in AuthContext.signUp:', err);
            console.error('❌ Error message:', err.message);
            console.error('❌ Error stack:', err.stack);
            const errorMsg = err.message || 'An unexpected error occurred';
            setError(errorMsg);
            setLoading(false);
            return { error: errorMsg };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setSession(null);
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, error, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
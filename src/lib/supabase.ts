import { createClient } from '@supabase/supabase-js';
import type { InterviewSession } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      interview_sessions: {
        Row: InterviewSession;
        Insert: Omit<InterviewSession, 'id'>;
        Update: Partial<Omit<InterviewSession, 'id'>>;
      };
    };
  };
};

// Helper functions for database operations
export const saveSession = async (session: Omit<InterviewSession, 'id'>) => {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert([session])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSession = async (
  sessionId: string,
  updates: Partial<InterviewSession>
) => {
  const { data, error } = await supabase
    .from('interview_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
};

export const getAllSessions = async () => {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .order('startTime', { ascending: false });

  if (error) throw error;
  return data;
};

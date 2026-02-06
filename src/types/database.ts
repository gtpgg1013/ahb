export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inspirations: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          context: string | null;
          tags: string[];
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          context?: string | null;
          tags?: string[];
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          context?: string | null;
          tags?: string[];
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      resonates: {
        Row: {
          id: string;
          user_id: string;
          inspiration_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          inspiration_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          inspiration_id?: string;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          inspiration_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          inspiration_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          inspiration_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          category: string;
          image_url: string;
          price: number;
          in_stock: boolean;
          quantity: number;
          size: string | null;
          color_en: string | null;
          color_de: string | null;
          title_en: string;
          title_de: string;
          description_en: string;
          description_de: string;
          material_en: string | null;
          material_de: string | null;
          notes_en: string | null;
          notes_de: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          image_url: string;
          price?: number;
          in_stock?: boolean;
          quantity?: number;
          size?: string | null;
          color_en?: string | null;
          color_de?: string | null;
          title_en: string;
          title_de: string;
          description_en: string;
          description_de: string;
          material_en?: string | null;
          material_de?: string | null;
          notes_en?: string | null;
          notes_de?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          interested_in: string | null;
          notes: string | null;
          consent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          interested_in?: string | null;
          notes?: string | null;
          consent?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "user";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: "admin" | "user";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role: "admin" | "user";
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {};
  };
};
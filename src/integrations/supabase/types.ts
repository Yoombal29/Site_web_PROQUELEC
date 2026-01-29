export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      download_buttons: {
        Row: {
          id: string;
          title: string;
          bucket: string;
          path: string;
          icon: string | null;
          color: string | null;
          visible: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          bucket: string;
          path: string;
          icon?: string | null;
          color?: string | null;
          visible?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          bucket?: string;
          path?: string;
          icon?: string | null;
          color?: string | null;
          visible?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          os: string | null
          page_url: string
          referrer: string
          session_id: string
          user_agent: string
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          os?: string | null
          page_url: string
          referrer?: string
          session_id: string
          user_agent: string
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          os?: string | null
          page_url?: string
          referrer?: string
          session_id?: string
          user_agent?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category_id: number | null
          content: string | null
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string | null
          title: string
        }
        Insert: {
          author_id: string
          category_id?: number | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string | null
          title: string
        }
        Update: {
          author_id?: string
          category_id?: number | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_mode: {
        Row: {
          id: number
          is_enabled: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: number
          is_enabled?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: number
          is_enabled?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          email: string | null
          id: string
          message: string | null
          name: string | null
          submitted_at: string | null
        }
        Insert: {
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          submitted_at?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          description: string | null
          file_url: string
          id: string
          title: string
          uploaded_at: string | null
          uploader_id: string | null
        }
        Insert: {
          description?: string | null
          file_url: string
          id?: string
          title: string
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Update: {
          description?: string | null
          file_url?: string
          id?: string
          title?: string
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Relationships: []
      }
      electrical_certifications: {
        Row: {
          certification_body: string | null
          code: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          required_training_hours: number | null
          requirements: string[] | null
          updated_at: string | null
          validity_period: number | null
        }
        Insert: {
          certification_body?: string | null
          code: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          required_training_hours?: number | null
          requirements?: string[] | null
          updated_at?: string | null
          validity_period?: number | null
        }
        Update: {
          certification_body?: string | null
          code?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          required_training_hours?: number | null
          requirements?: string[] | null
          updated_at?: string | null
          validity_period?: number | null
        }
        Relationships: []
      }
      electrical_equipment: {
        Row: {
          availability_status: string | null
          brand: string | null
          category: string
          certification_standards: string[] | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_rental: boolean | null
          manual_url: string | null
          model: string | null
          name: string
          price: number | null
          rental_price_daily: number | null
          safety_instructions: string[] | null
          specifications: Json | null
          stock_quantity: number | null
        }
        Insert: {
          availability_status?: string | null
          brand?: string | null
          category: string
          certification_standards?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_rental?: boolean | null
          manual_url?: string | null
          model?: string | null
          name: string
          price?: number | null
          rental_price_daily?: number | null
          safety_instructions?: string[] | null
          specifications?: Json | null
          stock_quantity?: number | null
        }
        Update: {
          availability_status?: string | null
          brand?: string | null
          category?: string
          certification_standards?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_rental?: boolean | null
          manual_url?: string | null
          model?: string | null
          name?: string
          price?: number | null
          rental_price_daily?: number | null
          safety_instructions?: string[] | null
          specifications?: Json | null
          stock_quantity?: number | null
        }
        Relationships: []
      }
      electrical_standards: {
        Row: {
          applicable_sectors: string[] | null
          category: string
          code: string
          created_at: string | null
          description: string | null
          document_url: string | null
          effective_date: string | null
          id: string
          key_changes: string[] | null
          publication_date: string | null
          status: string | null
          summary: string | null
          superseded_by: string | null
          title: string
          version: string | null
        }
        Insert: {
          applicable_sectors?: string[] | null
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          key_changes?: string[] | null
          publication_date?: string | null
          status?: string | null
          summary?: string | null
          superseded_by?: string | null
          title: string
          version?: string | null
        }
        Update: {
          applicable_sectors?: string[] | null
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          key_changes?: string[] | null
          publication_date?: string | null
          status?: string | null
          summary?: string | null
          superseded_by?: string | null
          title?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "electrical_standards_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "electrical_standards"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          date: string
          details: string | null
          id: string
          location: string | null
          organizer_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          details?: string | null
          id?: string
          location?: string | null
          organizer_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          details?: string | null
          id?: string
          location?: string | null
          organizer_id?: string | null
          title?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          alt_text: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_active: boolean | null
          last_modified_at: string | null
          last_modified_by: string | null
          metadata: Json | null
          mime_type: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          metadata?: Json | null
          mime_type: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_active?: boolean | null
          last_modified_at?: string | null
          last_modified_by?: string | null
          metadata?: Json | null
          mime_type?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          menu_order: number | null
          parent_id: string | null
          target: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          menu_order?: number | null
          parent_id?: string | null
          target?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          menu_order?: number | null
          parent_id?: string | null
          target?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          page_id: string | null
          section_order: number | null
          section_type: string
          settings: Json | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          page_id?: string | null
          section_order?: number | null
          section_type: string
          settings?: Json | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          page_id?: string | null
          section_order?: number | null
          section_type?: string
          settings?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          menu_order: number | null
          meta_description: string | null
          parent_id: string | null
          slug: string
          title: string
          updated_at: string | null
          meta_keywords: string | null
          meta_robots: string | null
          featured_image: string | null
          template: string | null
          show_hero: boolean | null
          show_footer: boolean | null
          custom_css: string | null
          custom_js: string | null
          header_html: string | null
          footer_html: string | null
          hero_title: string | null
          hero_subtitle: string | null
          hero_background_image: string | null
          hero_cta_text: string | null
          hero_cta_link: string | null
          publish_date: string | null
          unpublish_date: string | null
          categories: string[] | null
          tags: string[] | null
          author: string | null
          reading_time: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          menu_order?: number | null
          meta_description?: string | null
          parent_id?: string | null
          slug: string
          title: string
          updated_at?: string | null
          meta_keywords?: string | null
          meta_robots?: string | null
          featured_image?: string | null
          template?: string | null
          show_hero?: boolean | null
          show_footer?: boolean | null
          custom_css?: string | null
          custom_js?: string | null
          header_html?: string | null
          footer_html?: string | null
          hero_title?: string | null
          hero_subtitle?: string | null
          hero_background_image?: string | null
          hero_cta_text?: string | null
          hero_cta_link?: string | null
          publish_date?: string | null
          unpublish_date?: string | null
          categories?: string[] | null
          tags?: string[] | null
          author?: string | null
          reading_time?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          menu_order?: number | null
          meta_description?: string | null
          parent_id?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          meta_keywords?: string | null
          meta_robots?: string | null
          featured_image?: string | null
          template?: string | null
          show_hero?: boolean | null
          show_footer?: boolean | null
          custom_css?: string | null
          custom_js?: string | null
          header_html?: string | null
          footer_html?: string | null
          hero_title?: string | null
          hero_subtitle?: string | null
          hero_background_image?: string | null
          hero_cta_text?: string | null
          hero_cta_link?: string | null
          publish_date?: string | null
          unpublish_date?: string | null
          categories?: string[] | null
          tags?: string[] | null
          author?: string | null
          reading_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          menu_order: number | null
          parent_id: string | null
          target: string | null
          title: string
          url: string
          menu_type: string | null
          icon: string | null
          label: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          menu_order?: number | null
          parent_id?: string | null
          target?: string | null
          title: string
          url: string
          menu_type?: string | null
          icon?: string | null
          label?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          menu_order?: number | null
          parent_id?: string | null
          target?: string | null
          title?: string
          url?: string
          menu_type?: string | null
          icon?: string | null
          label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_components: {
        Row: {
          id: string
          name: string
          component_type: string
          title: string | null
          subtitle: string | null
          content: Json | null
          settings: Json | null
          is_active: boolean | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          component_type: string
          title?: string | null
          subtitle?: string | null
          content?: Json | null
          settings?: Json | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          component_type?: string
          title?: string | null
          subtitle?: string | null
          content?: Json | null
          settings?: Json | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      theme_configurations: {
        Row: {
          id: string
          name: string
          colors: Json | null
          fonts: Json | null
          spacing: Json | null
          breakpoints: Json | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          colors?: Json | null
          fonts?: Json | null
          spacing?: Json | null
          breakpoints?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          colors?: Json | null
          fonts?: Json | null
          spacing?: Json | null
          breakpoints?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_forms: {
        Row: {
          id: string
          name: string
          title: string | null
          description: string | null
          fields: Json | null
          settings: Json | null
          submit_action: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          description?: string | null
          fields?: Json | null
          settings?: Json | null
          submit_action?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          title?: string | null
          description?: string | null
          fields?: Json | null
          settings?: Json | null
          submit_action?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      external_integrations: {
        Row: {
          id: string
          name: string
          type: string
          provider: string | null
          config: Json | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          provider?: string | null
          config?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          provider?: string | null
          config?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          id: string
          name: string
          description: string | null
          steps: Json | null
          triggers: Json | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          steps?: Json | null
          triggers?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          steps?: Json | null
          triggers?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          id: string
          form_id: string | null
          form_name: string | null
          data: Json | null
          submitted_at: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          form_id?: string | null
          form_name?: string | null
          data?: Json | null
          submitted_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          form_id?: string | null
          form_name?: string | null
          data?: Json | null
          submitted_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          type: string
          title: string
          message: string | null
          recipient_id: string | null
          is_read: boolean | null
          created_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          type: string
          title: string
          message?: string | null
          recipient_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string | null
          recipient_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          connection_type: string | null
          created_at: string | null
          dom_content_loaded: number
          first_contentful_paint: number
          id: string
          load_time: number
          page_url: string
          time_to_interactive: number
        }
        Insert: {
          connection_type?: string | null
          created_at?: string | null
          dom_content_loaded: number
          first_contentful_paint: number
          id?: string
          load_time: number
          page_url: string
          time_to_interactive: number
        }
        Update: {
          connection_type?: string | null
          created_at?: string | null
          dom_content_loaded?: number
          first_contentful_paint?: number
          id?: string
          load_time?: number
          page_url?: string
          time_to_interactive?: number
        }
        Relationships: []
      }
      professional_training: {
        Row: {
          certification_id: string | null
          created_at: string | null
          description: string | null
          duration_hours: number
          equipment_provided: boolean | null
          id: string
          instructor_name: string | null
          is_active: boolean | null
          learning_objectives: string[] | null
          level: string | null
          location: string | null
          max_participants: number | null
          prerequisites: string[] | null
          price: number | null
          title: string
        }
        Insert: {
          certification_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours: number
          equipment_provided?: boolean | null
          id?: string
          instructor_name?: string | null
          is_active?: boolean | null
          learning_objectives?: string[] | null
          level?: string | null
          location?: string | null
          max_participants?: number | null
          prerequisites?: string[] | null
          price?: number | null
          title: string
        }
        Update: {
          certification_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number
          equipment_provided?: boolean | null
          id?: string
          instructor_name?: string | null
          is_active?: boolean | null
          learning_objectives?: string[] | null
          level?: string | null
          location?: string | null
          max_participants?: number | null
          prerequisites?: string[] | null
          price?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_training_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "electrical_certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          username?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          contact_email: string | null
          copyright_text: string | null
          facebook_url: string | null
          favicon_url: string | null
          id: number
          linkedin_url: string | null
          logo_url: string | null
          phone_number: string | null
          site_name: string
          slogan: string
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          copyright_text?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          id?: number
          linkedin_url?: string | null
          logo_url?: string | null
          phone_number?: string | null
          site_name?: string
          slogan?: string
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          copyright_text?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          id?: number
          linkedin_url?: string | null
          logo_url?: string | null
          phone_number?: string | null
          site_name?: string
          slogan?: string
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          accent_color: string | null
          background_color: string | null
          button_style: Json | null
          font_family: string | null
          footer_style: Json | null
          header_style: Json | null
          id: number
          primary_color: string | null
          secondary_color: string | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          button_style?: Json | null
          font_family?: string | null
          footer_style?: Json | null
          header_style?: Json | null
          id?: number
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          button_style?: Json | null
          font_family?: string | null
          footer_style?: Json | null
          header_style?: Json | null
          id?: number
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_registrations: {
        Row: {
          company_name: string | null
          id: string
          participant_email: string
          participant_name: string
          participant_phone: string | null
          payment_status: string | null
          registration_date: string | null
          special_requirements: string | null
          status: string | null
          training_id: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          id?: string
          participant_email: string
          participant_name: string
          participant_phone?: string | null
          payment_status?: string | null
          registration_date?: string | null
          special_requirements?: string | null
          status?: string | null
          training_id: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          id?: string
          participant_email?: string
          participant_name?: string
          participant_phone?: string | null
          payment_status?: string | null
          registration_date?: string | null
          special_requirements?: string | null
          status?: string | null
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_registrations_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "professional_training"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      delete_media_file: {
        Args: { p_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

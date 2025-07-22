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
      activities: {
        Row: {
          action: string
          created_at: string
          created_by: string
          description: string
          id: string
          parent_id: string
          parent_type: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          parent_id: string
          parent_type: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          parent_id?: string
          parent_type?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task_id: string
          text: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id: string
          text: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          parent_id: string
          parent_type: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          parent_id: string
          parent_type: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      completed_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          goal_id: string
          id: string
          reward_claimed: boolean | null
          reward_claimed_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          goal_id: string
          id?: string
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          goal_id?: string
          id?: string
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_notifications: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          id: string
          is_active: boolean
          message: string
          specific_date: string | null
          task_id: string | null
          time: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean
          message: string
          specific_date?: string | null
          task_id?: string | null
          time?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean
          message?: string
          specific_date?: string | null
          task_id?: string | null
          time?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          assigned_projects: string[] | null
          assigned_tasks: string[] | null
          category: Database["public"]["Enums"]["category_type"]
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          is_shared: boolean
          name: string
          notes: string | null
          notifications_enabled: boolean
          priority: Database["public"]["Enums"]["priority"]
          progress: number
          reward_description: string | null
          reward_enabled: boolean
          start_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_projects?: string[] | null
          assigned_tasks?: string[] | null
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_shared?: boolean
          name: string
          notes?: string | null
          notifications_enabled?: boolean
          priority?: Database["public"]["Enums"]["priority"]
          progress?: number
          reward_description?: string | null
          reward_enabled?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_projects?: string[] | null
          assigned_tasks?: string[] | null
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_shared?: boolean
          name?: string
          notes?: string | null
          notifications_enabled?: boolean
          priority?: Database["public"]["Enums"]["priority"]
          progress?: number
          reward_description?: string | null
          reward_enabled?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kanban_columns: {
        Row: {
          color: string
          created_at: string
          id: string
          notification_days: number | null
          notifications_enabled: boolean
          position: number
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          notification_days?: number | null
          notifications_enabled?: boolean
          position?: number
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          notification_days?: number | null
          notifications_enabled?: boolean
          position?: number
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          app_notifications: boolean
          email_notifications: boolean
          goals_enabled: boolean
          id: string
          projects_enabled: boolean
          quiet_days: string[] | null
          quiet_end_time: string | null
          quiet_hours_enabled: boolean
          quiet_start_time: string | null
          tasks_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          app_notifications?: boolean
          email_notifications?: boolean
          goals_enabled?: boolean
          id?: string
          projects_enabled?: boolean
          quiet_days?: string[] | null
          quiet_end_time?: string | null
          quiet_hours_enabled?: boolean
          quiet_start_time?: string | null
          tasks_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          app_notifications?: boolean
          email_notifications?: boolean
          goals_enabled?: boolean
          id?: string
          projects_enabled?: boolean
          quiet_days?: string[] | null
          quiet_end_time?: string | null
          quiet_hours_enabled?: boolean
          quiet_start_time?: string | null
          tasks_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          goal_id: string | null
          id: string
          is_active: boolean
          message: string
          project_id: string | null
          scheduled_for: string
          sent: boolean
          specific_date: string | null
          task_id: string | null
          time: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          goal_id?: string | null
          id?: string
          is_active?: boolean
          message: string
          project_id?: string | null
          scheduled_for: string
          sent?: boolean
          specific_date?: string | null
          task_id?: string | null
          time?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          goal_id?: string | null
          id?: string
          is_active?: boolean
          message?: string
          project_id?: string | null
          scheduled_for?: string
          sent?: boolean
          specific_date?: string | null
          task_id?: string | null
          time?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          parent_id: string
          parent_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          parent_id: string
          parent_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          parent_id?: string
          parent_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_invites: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          expires_at: string
          id: string
          invite_link: string | null
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          token: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_link?: string | null
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          token: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_link?: string | null
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          token?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: Database["public"]["Enums"]["category_type"]
          color: string
          created_at: string
          description: string | null
          due_date: string | null
          end_time: string | null
          id: string
          invite_link: string | null
          is_indefinite: boolean
          is_shared: boolean
          name: string
          notifications_enabled: boolean
          owner_id: string
          priority: Database["public"]["Enums"]["priority"]
          repeat_days: string[] | null
          repeat_enabled: boolean
          repeat_type: Database["public"]["Enums"]["frequency_type"] | null
          start_date: string | null
          start_time: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["category_type"]
          color?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          id?: string
          invite_link?: string | null
          is_indefinite?: boolean
          is_shared?: boolean
          name: string
          notifications_enabled?: boolean
          owner_id: string
          priority?: Database["public"]["Enums"]["priority"]
          repeat_days?: string[] | null
          repeat_enabled?: boolean
          repeat_type?: Database["public"]["Enums"]["frequency_type"] | null
          start_date?: string | null
          start_time?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["category_type"]
          color?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          id?: string
          invite_link?: string | null
          is_indefinite?: boolean
          is_shared?: boolean
          name?: string
          notifications_enabled?: boolean
          owner_id?: string
          priority?: Database["public"]["Enums"]["priority"]
          repeat_days?: string[] | null
          repeat_enabled?: boolean
          repeat_type?: Database["public"]["Enums"]["frequency_type"] | null
          start_date?: string | null
          start_time?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reward_claims: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          reward_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reward_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          attributed_item_name: string | null
          attributed_to_id: string
          attributed_to_type: string
          celebration_level: string
          claimed_at: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          investment_value: number | null
          is_claimed: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attributed_item_name?: string | null
          attributed_to_id: string
          attributed_to_type: string
          celebration_level: string
          claimed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          investment_value?: number | null
          is_claimed?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attributed_item_name?: string | null
          attributed_to_id?: string
          attributed_to_type?: string
          celebration_level?: string
          claimed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          investment_value?: number | null
          is_claimed?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["category_type"]
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          end_time: string | null
          goal_id: string | null
          id: string
          is_indefinite: boolean
          monthly_day: number | null
          notifications_enabled: boolean
          owner_id: string | null
          priority: Database["public"]["Enums"]["priority"]
          project_id: string | null
          repeat_days: string[] | null
          repeat_enabled: boolean
          repeat_type: Database["public"]["Enums"]["frequency_type"] | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          goal_id?: string | null
          id?: string
          is_indefinite?: boolean
          monthly_day?: number | null
          notifications_enabled?: boolean
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          project_id?: string | null
          repeat_days?: string[] | null
          repeat_enabled?: boolean
          repeat_type?: Database["public"]["Enums"]["frequency_type"] | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["category_type"]
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          goal_id?: string | null
          id?: string
          is_indefinite?: boolean
          monthly_day?: number | null
          notifications_enabled?: boolean
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          project_id?: string | null
          repeat_days?: string[] | null
          repeat_enabled?: boolean
          repeat_type?: Database["public"]["Enums"]["frequency_type"] | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          date_format: string | null
          id: string
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_format?: string | null
          id?: string
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_format?: string | null
          id?: string
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      reward_stats: {
        Row: {
          avg_reward_value: number | null
          claimed_rewards: number | null
          pending_rewards: number | null
          total_claimed_value: number | null
          total_pending_value: number | null
          total_rewards: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_project_safe: {
        Args: { p_name: string; p_owner_id: string }
        Returns: string
      }
      drop_all_policies_on_table: {
        Args: { p_schema_name: string; p_table_name: string }
        Returns: undefined
      }
      get_user_rewards: {
        Args: { p_user_id?: string }
        Returns: {
          id: string
          title: string
          description: string
          celebration_level: string
          investment_value: number
          currency: string
          attributed_to_type: string
          attributed_to_id: string
          attributed_item_name: string
          is_claimed: boolean
          claimed_at: string
          created_at: string
        }[]
      }
      is_project_member: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      is_project_owner: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      user_has_project_access: {
        Args: { project_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      category_type:
        | "professional"
        | "intellectual"
        | "finance"
        | "social"
        | "relationship"
        | "family"
        | "leisure"
        | "health"
        | "spiritual"
        | "emotional"
        | "other"
      frequency_type: "daily" | "weekly" | "monthly" | "weekdays" | "custom"
      notification_type: "time" | "day" | "date"
      priority: "low" | "medium" | "high"
      project_role: "owner" | "admin" | "member" | "viewer"
      task_status: "todo" | "in-progress" | "review" | "done"
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
      category_type: [
        "professional",
        "intellectual",
        "finance",
        "social",
        "relationship",
        "family",
        "leisure",
        "health",
        "spiritual",
        "emotional",
        "other",
      ],
      frequency_type: ["daily", "weekly", "monthly", "weekdays", "custom"],
      notification_type: ["time", "day", "date"],
      priority: ["low", "medium", "high"],
      project_role: ["owner", "admin", "member", "viewer"],
      task_status: ["todo", "in-progress", "review", "done"],
    },
  },
} as const

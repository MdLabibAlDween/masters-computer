import { createClient } from '@supabase/supabase-js'

// Loose database shape — this client is for server-side admin operations
// (user management). Business rows are typed by src/types/db.ts.
type LooseTable = {
  Row: Record<string, unknown>
  Insert: Record<string, unknown>
  Update: Record<string, unknown>
  Relationships: never[]
}
type LooseDatabase = {
  public: {
    Tables: Record<string, LooseTable>
    Views: Record<string, { Row: Record<string, unknown>; Relationships: never[] }>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// SERVER-ONLY client using the service_role key.
// Never import this from a Client Component or a module it imports.
let cached: ReturnType<typeof createClient<LooseDatabase>> | null = null

export function createServiceClient() {
  if (!cached) {
    cached = createClient<LooseDatabase>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return cached
}
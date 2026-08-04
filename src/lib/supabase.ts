import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock Supabase Client for local testing when keys are missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockClient = (): SupabaseClient & Record<string, any> => {
  console.warn("⚠️ Supabase keys missing. Using Mock Client for testing.");
  
  return {
    auth: {
      getUser: async () => ({ data: { user: { id: 'mock-user-id', email: 'test@example.com' } }, error: null }),
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (email === 'admin@example.com' && password === 'password123') {
          return { data: { user: { id: 'admin-id', email: 'admin@example.com' } }, error: null };
        }
        return { data: { user: { id: 'mock-user-id', email: 'test@example.com' } }, error: null };
      },
      signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (_col: string, val: unknown) => ({
          single: async () => {
            if (table === 'profiles') {
              if (val === 'admin-id' || (typeof val === 'string' && val.includes('admin'))) {
                return { data: { role: 'ADMIN', full_name: 'مدير النظام' }, error: null };
              }
              return { data: { role: 'PROVIDER', full_name: 'مزود عينة', rating_avg: 4.5, is_verified: true, created_at: new Date().toISOString() }, error: null };
            }
            return { data: {}, error: null };
          },
          order: () => ({ data: [], error: null }),
          async then(cb: (r: unknown) => unknown) { return cb({ data: [], error: null }); }
        }),
        order: () => ({ data: [], error: null }),
        async then(cb: (r: unknown) => unknown) { return cb({ data: [], error: null }); }
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'mock-id' }, error: null })
        }),
        async then(cb: (r: unknown) => unknown) { return cb({ data: [{ id: 'mock-id' }], error: null }); }
      }),
      update: () => ({
        eq: async () => ({ data: {}, error: null }),
        async then(cb: (r: unknown) => unknown) { return cb({ data: {}, error: null }); }
      }),
      delete: () => ({
        eq: async () => ({ data: {}, error: null }),
        async then(cb: (r: unknown) => unknown) { return cb({ data: {}, error: null }); }
      }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://placehold.co/600x400?text=Mock+Image' } }),
      })
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as unknown as SupabaseClient & Record<string, any>;
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

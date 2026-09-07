/** Cloudflare Worker env bindings for gestortrafego */
export interface Env {
  DB: D1Database;
  FLAGS: KVNamespace;
  JOBS: Queue;
  /** Optional gate for mutating admin routes */
  ADMIN_TOKEN?: string;
}

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

// FILE PATH: src/lib/supabase.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  _supabase = createClient(url, key)
  return _supabase
}

export async function getCachedAnalysis(key: string) {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from("analyses_cache")
      .select("*")
      .eq("cache_key", key)
      .single()

    if (error || !data) return null

    const cacheAge = Date.now() - new Date(data.created_at).getTime()
    if (cacheAge > 12 * 60 * 60 * 1000) return null

    return data.analysis_data
  } catch {
    return null
  }
}

export async function setCachedAnalysis(key: string, data: unknown) {
  try {
    const supabase = getSupabase()
    if (!supabase) return

    await supabase.from("analyses_cache").upsert({
      cache_key: key,
      analysis_data: data,
      created_at: new Date().toISOString(),
    }, { onConflict: "cache_key" })
  } catch (error) {
    console.error("Cache write error:", error)
  }
}

export async function saveToWatchlist(address: string, label?: string) {
  const supabase = getSupabase()
  if (!supabase) return { data: null, error: new Error("Supabase not configured") }
  return supabase.from("watchlist").upsert({ address, label, created_at: new Date().toISOString() }, { onConflict: "address" })
}

export async function getWatchlist() {
  const supabase = getSupabase()
  if (!supabase) return { data: [], error: null }
  return supabase.from("watchlist").select("*").order("created_at", { ascending: false })
}

export async function saveSearchHistory(input: string, type: string) {
  try {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.from("search_history").insert({ query: input, type, searched_at: new Date().toISOString() })
  } catch {}
}

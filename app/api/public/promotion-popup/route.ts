import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.from('promotion_popup').select('*').eq('section_key', 'global_promotion_popup').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ item: null }, { headers: { 'Cache-Control': 'no-store' } })

  const { data: questions, error: questionsError } = await supabase
    .from('promotion_popup_questions')
    .select('id, field_key, question, input_type, validation_pattern, validation_message, is_required, options, sort_order')
    .eq('promotion_id', data.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const fallbackQuestions = [{ id: 0, field_key: 'email', question: 'What is your email address?', input_type: 'email', validation_pattern: null, validation_message: 'Enter a valid email address.', is_required: true, sort_order: 0 }]
  return NextResponse.json({ item: { ...data, questions: questionsError ? fallbackQuestions : (questions?.length ? questions : fallbackQuestions) } }, { headers: { 'Cache-Control': 'no-store' } })
}
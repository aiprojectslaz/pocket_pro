// src/services/api.js
// Wraps Supabase queries in a Strapi-compatible response shape so existing
// components that access response.data.data / item.attributes.* keep working.

import { supabase } from '@/lib/supabase'

// Convert a flat Supabase row into Strapi's { id, attributes: {...} } shape.
// Nested arrays (joined relations) are wrapped in { data: [...] }.
function toStrapi(item) {
  if (!item) return null
  const { id, ...rest } = item
  const attributes = {}
  for (const [key, val] of Object.entries(rest)) {
    if (Array.isArray(val) && (val.length === 0 || typeof val[0]?.id === 'number')) {
      attributes[key] = { data: val.map(toStrapi) }
    } else {
      attributes[key] = val
    }
  }
  return { id, attributes }
}

// Wrap an array result: { data: [strapiItem, ...] }
function wrapList(rows) {
  return { data: (rows || []).map(toStrapi) }
}

// Wrap a single result: { data: strapiItem }
function wrapSingle(row) {
  return { data: row ? toStrapi(row) : null }
}

export default {
  // ── Procedures ────────────────────────────────────────────
  async getProcedures() {
    const { data, error } = await supabase
      .from('procedures')
      .select('*, chapters(title)')
      .order('procedure_number')
    if (error) throw error
    return wrapList(data)
  },

  async getProcedure(id) {
    const { data, error } = await supabase
      .from('procedures')
      .select(`
        *,
        chapters(title),
        definitions:procedure_definitions ( definition:definitions(*) ),
        sub_procedures (*),
        appendices (*),
        main_roles (*)
      `)
      .eq('id', id)
      .single()
    if (error) throw error

    // Flatten the junction-table join: [{definition: {...}}] → [{...}]
    if (data.definitions) {
      data.definitions = data.definitions.map(row => row.definition)
    }

    return wrapSingle(data)
  },

  // ── Definitions ───────────────────────────────────────────
  async getDefinitions() {
    const { data, error } = await supabase
      .from('definitions')
      .select('*')
      .order('term')
    if (error) throw error
    return wrapList(data)
  },

  async getDefinition(id) {
    const { data, error } = await supabase
      .from('definitions')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  // ── Sub-procedures ────────────────────────────────────────
  async getSubProcedures() {
    const { data, error } = await supabase
      .from('sub_procedures')
      .select('*, procedure_roles(*)')
    if (error) throw error
    return wrapList(data)
  },

  async getSubProcedure(id) {
    const { data, error } = await supabase
      .from('sub_procedures')
      .select('*, procedure_roles(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  // ── Roles ─────────────────────────────────────────────────
  async getSubRoles() {
    const { data, error } = await supabase
      .from('procedure_roles')
      .select('*')
    if (error) throw error
    return wrapList(data)
  },

  async getSubRole(id) {
    const { data, error } = await supabase
      .from('procedure_roles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async getMainRoles() {
    const { data, error } = await supabase
      .from('main_roles')
      .select('*')
    if (error) throw error
    return wrapList(data)
  },

  // ── Appendices ────────────────────────────────────────────
  async getAppendices() {
    const { data, error } = await supabase
      .from('appendices')
      .select('*')
    if (error) throw error
    return wrapList(data)
  },

  async getAppendix(id) {
    const { data, error } = await supabase
      .from('appendices')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  // ── Chapters ──────────────────────────────────────────────
  async getChapters() {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('title')
    if (error) throw error
    return wrapList(data)
  },

  async createChapter(payload) {
    const { data, error } = await supabase
      .from('chapters')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  // ── Procedure CRUD ────────────────────────────────────────
  async createProcedure(payload) {
    const { data, error } = await supabase
      .from('procedures')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async updateProcedure(id, payload) {
    const { data, error } = await supabase
      .from('procedures')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async deleteProcedure(id) {
    const { error } = await supabase
      .from('procedures')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ── Sub-procedure CRUD ────────────────────────────────────
  async createSubProcedure(payload) {
    const { data, error } = await supabase
      .from('sub_procedures')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async updateSubProcedure(id, payload) {
    const { data, error } = await supabase
      .from('sub_procedures')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async deleteSubProcedure(id) {
    const { error } = await supabase
      .from('sub_procedures')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ── Definition CRUD ───────────────────────────────────────
  async createDefinition(payload) {
    const { data, error } = await supabase
      .from('definitions')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async updateDefinition(id, payload) {
    const { data, error } = await supabase
      .from('definitions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async deleteDefinition(id) {
    const { error } = await supabase
      .from('definitions')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async linkDefinitionToProcedure(procedureId, definitionId) {
    const { error } = await supabase
      .from('procedure_definitions')
      .insert({ procedure_id: procedureId, definition_id: definitionId })
    if (error) throw error
  },

  async unlinkDefinitionFromProcedure(procedureId, definitionId) {
    const { error } = await supabase
      .from('procedure_definitions')
      .delete()
      .eq('procedure_id', procedureId)
      .eq('definition_id', definitionId)
    if (error) throw error
  },

  // ── Appendix CRUD ─────────────────────────────────────────
  async createAppendix(payload) {
    const { data, error } = await supabase
      .from('appendices')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async updateAppendix(id, payload) {
    const { data, error } = await supabase
      .from('appendices')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async deleteAppendix(id) {
    const { error } = await supabase
      .from('appendices')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ── Main Role CRUD ────────────────────────────────────────
  async createMainRole(payload) {
    const { data, error } = await supabase
      .from('main_roles')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async updateMainRole(id, payload) {
    const { data, error } = await supabase
      .from('main_roles')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async deleteMainRole(id) {
    const { error } = await supabase
      .from('main_roles')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // ── Quiz / Questions ──────────────────────────────────────
  async getQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
    if (error) throw error
    return wrapList(data)
  },

  async getQuiz(id) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`*, procedures:quiz_questions(question:questions(*))`)
      .eq('id', id)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async getQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*, answer_options(*)')
    if (error) throw error
    return wrapList(data)
  },

  // ── Static content pages ──────────────────────────────────
  async getAbout() {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .limit(1)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async getPrivacy() {
    const { data, error } = await supabase
      .from('privacy')
      .select('*')
      .limit(1)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async getTerms() {
    const { data, error } = await supabase
      .from('terms_conditions')
      .select('*')
      .limit(1)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  async getContact() {
    const { data, error } = await supabase
      .from('contact_us')
      .select('*')
      .limit(1)
      .single()
    if (error) throw error
    return wrapSingle(data)
  },

  // ── Bookmarks ─────────────────────────────────────────────
  // Returns an array of Strapi-shaped procedure objects for the given user.
  async getUserBookmarkedProcedures(userId) {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('procedure:procedures(*)')
      .eq('user_id', userId)
    if (error) throw error
    return (data || []).map(row => toStrapi(row.procedure))
  },

  async isBookmarked(userId, procedureId) {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('procedure_id')
      .eq('user_id', userId)
      .eq('procedure_id', procedureId)
      .maybeSingle()
    if (error) throw error
    return !!data
  },

  async addBookmark(userId, procedureId) {
    const { error } = await supabase
      .from('user_bookmarks')
      .insert({ user_id: userId, procedure_id: Number(procedureId) })
    if (error) throw error
  },

  async removeBookmark(userId, procedureId) {
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('procedure_id', Number(procedureId))
    if (error) throw error
  },
}

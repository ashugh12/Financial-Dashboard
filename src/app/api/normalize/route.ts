import { NextResponse } from 'next/server'

// Simple in-memory cache (per server instance)
const memo = new Map<string, any>()

function hash(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return `${h}`
}

export async function POST(req: Request) {
  try {
    const { sample } = await req.json()
    if (sample === undefined) {
      return NextResponse.json({ error: 'Missing sample' }, { status: 400 })
    }

    const key = hash(JSON.stringify(sample).slice(0, 50000))
    if (memo.has(key)) {
      return NextResponse.json(memo.get(key))
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY
    if (!apiKey) {
      // If no API key, just return a heuristic fallback: infer fields from first object
      const result = heuristicNormalize(sample)
      memo.set(key, result)
      return NextResponse.json(result)
    }

    const prompt = [
      {
        role: 'user',
        parts: [
          {
            text: `
    Given an input JSON, normalize it into a clean table-like structure with consistent fields across all rows.
    
    ### OBJECTIVE
    Analyze the structure and intelligently extract a flat, tabular dataset using reasoning:
    - Identify the most relevant array of objects (e.g., products, records, rows, entities).
    - Pick consistent, meaningful field names (<= 16 characters).
    - Ensure all items share the same fields.
    - Omit nulls, metadata, internal IDs, timestamps, or redundant nested paths.
    - Rename fields to short, readable names using camelCase or snake_case where appropriate.
    - Resolve inconsistencies (e.g. missing keys or variations) by normalizing the structure.
    - Flatten nested objects if relevant (e.g., "price.amount" -> "price" if useful).
    - If the input is a single object, attempt to normalize it as a single-row table.
    - If the input is a primitive value, wrap it as a single-row, single-column table.
    
    ### FORMAT
    Return ONLY strict JSON in the following format:
    {
      "fields": [ "field1", "field2", ... ],
      "items": [
        { "field1": value1, "field2": value2, ... },
        ...
      ]
    }
    
    ### IMPORTANT
    - Do NOT include any explanation, notes, markdown, or code fences.
    - Output only valid JSON, nothing else.
    - Truncate fields/items if too large, but keep the structure consistent.
    
    ### INPUT JSON
    ${JSON.stringify(sample).slice(0, 150000)}
    `
          }
        ]
      }
    ];


    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: prompt, generationConfig: { temperature: 0, maxOutputTokens: 1024 } })
      }
    )

    if (!r.ok) {
      const result = heuristicNormalize(sample)
      memo.set(key, result)
      return NextResponse.json(result)
    }

    const json = await r.json()
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      const result = heuristicNormalize(sample)
      memo.set(key, result)
      return NextResponse.json(result)
    }

    // Try to extract JSON from the model output
    const parsed = safeParseJSON(text)
    const result = validateNormalized(parsed) ? trimNormalized(parsed) : heuristicNormalize(sample)
    memo.set(key, result)
    return NextResponse.json(result)
  } catch (e) {
    const result = heuristicNormalize(null)
    return NextResponse.json(result)
  }
}

function heuristicNormalize(input: any): { fields: string[]; items: any[] } {
  if (Array.isArray(input) && input.length > 0 && typeof input[0] === 'object') {
    const fields = Object.keys(input[0]).slice(0, 24)
    return { fields, items: input.map(row => pick(row, fields)) }
  }
  if (input && typeof input === 'object') {
    // Find first array of objects
    const arr = findArrayOfObjects(input)
    if (arr) {
      const fields = Object.keys(arr[0]).slice(0, 24)
      return { fields, items: arr.map((row: any) => pick(row, fields)) }
    }
    const fields = Object.keys(input).slice(0, 24)
    return { fields, items: [pick(input, fields)] }
  }
  return { fields: ['value'], items: [{ value: input }] }
}

function findArrayOfObjects(obj: any): any[] | null {
  if (!obj || typeof obj !== 'object') return null
  for (const v of Object.values(obj)) {
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && !Array.isArray(v[0])) return v
    if (v && typeof v === 'object') {
      const found = findArrayOfObjects(v)
      if (found) return found
    }
  }
  return null
}

function pick(obj: any, fields: string[]) {
  const out: any = {}
  for (const f of fields) out[f] = obj?.[f]
  return out
}

function safeParseJSON(text: string): any | null {
  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1))
    return JSON.parse(text)
  } catch {
    return null
  }
}

function validateNormalized(x: any): x is { fields: string[]; items: any[] } {
  return (
    x &&
    Array.isArray(x.fields) &&
    Array.isArray(x.items) &&
    x.fields.every((f: any) => typeof f === 'string')
  )
}

function trimNormalized(x: { fields: string[]; items: any[] }) {
  const fields = x.fields.slice(0, 32)
  const items = x.items.slice(0, 500).map(it => pick(it, fields))
  return { fields, items }
}



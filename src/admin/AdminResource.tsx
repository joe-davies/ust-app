import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { slugify } from '../lib/data'
import type { Field, Resource } from './resources'
import { RESOURCES } from './resources'

type Row = Record<string, unknown>
type Form = Record<string, string | boolean>

const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'

function toLocalInput(iso: unknown): string {
  if (!iso) return ''
  const d = new Date(String(iso))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function rowToForm(res: Resource, row: Row | null): Form {
  const f: Form = {}
  res.fields.forEach((fld) => {
    const v = row?.[fld.name]
    if (fld.type === 'bool') f[fld.name] = row ? Boolean(v) : fld.name === 'published'
    else if (fld.type === 'tags') f[fld.name] = Array.isArray(v) ? v.join(', ') : ''
    else if (fld.type === 'datetime') f[fld.name] = row ? toLocalInput(v) : fld.name === 'published_at' ? toLocalInput(new Date().toISOString()) : ''
    else if (fld.type === 'number') f[fld.name] = v === undefined || v === null ? (fld.name === 'read_minutes' ? '3' : '0') : String(v)
    else f[fld.name] = v === undefined || v === null ? (fld.type === 'select' ? (fld.options?.[0].value ?? '') : '') : String(v)
  })
  return f
}

function formToPayload(res: Resource, form: Form): Row {
  const out: Row = {}
  res.fields.forEach((fld) => {
    const v = form[fld.name]
    switch (fld.type) {
      case 'bool':
        out[fld.name] = Boolean(v)
        break
      case 'number':
        out[fld.name] = Number(v) || 0
        break
      case 'tags':
        out[fld.name] = String(v).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        break
      case 'datetime':
        out[fld.name] = v ? new Date(String(v)).toISOString() : null
        break
      case 'ref':
        out[fld.name] = v ? String(v) : null
        break
      default:
        out[fld.name] = String(v ?? '')
    }
  })
  if (res.autoSlugFrom && !String(out.slug ?? '').trim()) {
    out.slug = slugify(String(out[res.autoSlugFrom] ?? ''))
  }
  return out
}

function FieldInput({
  fld,
  value,
  onChange,
  refOptions,
}: {
  fld: Field
  value: string | boolean
  onChange: (v: string | boolean) => void
  refOptions: { value: string; label: string }[]
}) {
  const id = `f-${fld.name}`
  if (fld.type === 'bool') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {fld.label}
      </label>
    )
  }
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {fld.label}
        {fld.required && <span className="text-red-700"> *</span>}
      </label>
      {fld.type === 'textarea' ? (
        <textarea id={id} rows={5} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputCls} required={fld.required} />
      ) : fld.type === 'select' ? (
        <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          {fld.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : fld.type === 'ref' ? (
        <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">None</option>
          {refOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={fld.type === 'number' ? 'number' : fld.type === 'datetime' ? 'datetime-local' : 'text'}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
          required={fld.required}
        />
      )}
      {fld.help && <p className="mt-1 text-xs text-slate-500">{fld.help}</p>}
    </div>
  )
}

export default function AdminResource() {
  const { resource: key } = useParams()
  const res = RESOURCES.find((r) => r.key === key)
  const [rows, setRows] = useState<Row[]>([])
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [form, setForm] = useState<Form>({})
  const [refs, setRefs] = useState<Record<string, { value: string; label: string }[]>>({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!res) return
    setLoading(true)
    const { data, error } = await supabase.from(res.table).select('*').order(res.orderBy, { ascending: res.ascending ?? true })
    if (error) setError(error.message)
    else setRows((data ?? []) as Row[])
    const refFields = res.fields.filter((f) => f.type === 'ref' && f.ref)
    const next: Record<string, { value: string; label: string }[]> = {}
    for (const f of refFields) {
      const { data: opts } = await supabase.from(f.ref!.table).select(`id, ${f.ref!.labelField}`)
      next[f.name] = ((opts ?? []) as unknown as Row[]).map((o) => ({ value: String(o.id), label: String(o[f.ref!.labelField]) }))
    }
    setRefs(next)
    setLoading(false)
  }, [res])

  useEffect(() => {
    setEditing(null)
    setError('')
    setNotice('')
    void load()
  }, [load])

  if (!res) return <p className="text-red-700">Unknown section.</p>

  function startEdit(row: Row | 'new') {
    setError('')
    setNotice('')
    setForm(rowToForm(res!, row === 'new' ? null : row))
    setEditing(row)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setError('')
    const payload = formToPayload(res!, form)
    const q =
      editing === 'new'
        ? supabase.from(res!.table).insert(payload)
        : supabase.from(res!.table).update(payload).eq('id', (editing as Row).id as string)
    const { error } = await q
    if (error) {
      setError(error.message)
      return
    }
    setNotice('Saved.')
    setEditing(null)
    await load()
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete "${String(row[res!.titleField]).slice(0, 60)}"? This cannot be undone.`)) return
    const { error } = await supabase.from(res!.table).delete().eq('id', row.id as string)
    if (error) setError(error.message)
    else {
      setNotice('Deleted.')
      await load()
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className="space-y-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-xl font-bold">{editing === 'new' ? `New: ${res.label}` : `Edit: ${res.label}`}</h2>
        {res.fields.map((fld) => (
          <FieldInput
            key={fld.name}
            fld={fld}
            value={form[fld.name]}
            onChange={(v) => setForm((f) => ({ ...f, [fld.name]: v }))}
            refOptions={refs[fld.name] ?? []}
          />
        ))}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-3">
          <button className="rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark">Save</button>
          <button type="button" onClick={() => setEditing(null)} className="rounded border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{res.label}</h2>
        <button onClick={() => startEdit('new')} className="rounded bg-union-blue px-4 py-2 text-sm font-semibold text-union-offwhite hover:bg-union-blue-dark">
          Add new
        </button>
      </div>
      {notice && <p role="status" className="mb-3 text-sm text-green-800">{notice}</p>}
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-600 ring-1 ring-black/5">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
          {rows.map((row) => (
            <li key={String(row.id)} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {String(row[res.titleField]).slice(0, 90)}
                  {row.published === false && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">Draft</span>}
                </p>
                {res.subtitleField && <p className="text-sm text-slate-600">{String(row[res.subtitleField] ?? '')}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(row)} className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50">Edit</button>
                <button onClick={() => void remove(row)} className="rounded border border-red-300 px-3 py-1 text-sm text-red-800 hover:bg-red-50">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

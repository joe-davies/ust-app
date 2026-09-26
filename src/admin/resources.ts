// Config-driven admin: each entry here gets a full list/create/edit/delete screen at /admin/<key>.
// To add an editable field, add it here AND to the table in a SQL migration.
export type FieldType = 'text' | 'textarea' | 'number' | 'bool' | 'select' | 'datetime' | 'tags' | 'ref'

export interface Field {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
  ref?: { table: string; labelField: string }
  help?: string
}

export interface Resource {
  key: string
  table: string
  label: string
  titleField: string
  subtitleField?: string
  orderBy: string
  ascending?: boolean
  fields: Field[]
  autoSlugFrom?: string
}

const publishedField: Field = { name: 'published', label: 'Published (visible to everyone)', type: 'bool' }

export const RESOURCES: Resource[] = [
  {
    key: 'content',
    table: 'content_items',
    label: 'Teaching & news',
    titleField: 'title',
    subtitleField: 'kind',
    orderBy: 'published_at',
    ascending: false,
    autoSlugFrom: 'title',
    fields: [
      {
        name: 'kind',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'article', label: 'Article' },
          { value: 'devotional', label: 'Devotional' },
          { value: 'video', label: 'Video' },
          { value: 'podcast', label: 'Podcast' },
          { value: 'qa', label: 'Q&A' },
          { value: 'news', label: 'News' },
        ],
      },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave blank to generate from the title.' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'body', label: 'Body', type: 'textarea', help: 'Separate paragraphs with a blank line.' },
      { name: 'media_url', label: 'Media URL', type: 'text', help: 'YouTube/Vimeo link for video, or an .mp3 link for podcasts.' },
      { name: 'image_url', label: 'Image URL', type: 'text' },
      { name: 'read_minutes', label: 'Minutes', type: 'number' },
      { name: 'topics', label: 'Topics', type: 'tags', help: 'Comma-separated.' },
      { name: 'scripture', label: 'Scripture reference', type: 'text', help: 'e.g. John 3:16' },
      { name: 'series_id', label: 'Series', type: 'ref', ref: { table: 'series', labelField: 'title' } },
      { name: 'featured', label: 'Featured on home page', type: 'bool' },
      { name: 'published_at', label: 'Publish date', type: 'datetime' },
      publishedField,
    ],
  },
  {
    key: 'series',
    table: 'series',
    label: 'Series',
    titleField: 'title',
    orderBy: 'title',
    autoSlugFrom: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      publishedField,
    ],
  },
  {
    key: 'courses',
    table: 'courses',
    label: 'Courses',
    titleField: 'title',
    subtitleField: 'level',
    orderBy: 'title',
    autoSlugFrom: 'title',
    fields: [
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        required: true,
        options: [
          { value: 'foundation', label: 'Foundation' },
          { value: 'ba', label: 'BA' },
          { value: 'ma', label: 'MA' },
          { value: 'gdip', label: 'Graduate Diploma' },
          { value: 'mth', label: 'MTh' },
          { value: 'phd', label: 'PhD' },
          { value: 'short', label: 'Short course' },
          { value: 'language', label: 'Biblical language' },
        ],
      },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'mode', label: 'Mode of study', type: 'text' },
      { name: 'next_start', label: 'Next start', type: 'text' },
      { name: 'apply_url', label: 'Apply URL (optional)', type: 'text' },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      publishedField,
    ],
  },
  {
    key: 'events',
    table: 'events',
    label: 'Events',
    titleField: 'title',
    subtitleField: 'kind',
    orderBy: 'starts_at',
    ascending: false,
    autoSlugFrom: 'title',
    fields: [
      {
        name: 'kind',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'open-day', label: 'Open day' },
          { value: 'conference', label: 'Conference' },
          { value: 'lecture', label: 'Lecture' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text' },
      { name: 'starts_at', label: 'Starts', type: 'datetime', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'url', label: 'Booking / details URL', type: 'text' },
      { name: 'featured', label: 'Featured', type: 'bool' },
      publishedField,
    ],
  },
  {
    key: 'people',
    table: 'people',
    label: 'Faculty & staff',
    titleField: 'name',
    subtitleField: 'role',
    orderBy: 'sort_order',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'bio', label: 'Biography', type: 'textarea' },
      { name: 'photo_url', label: 'Photo URL', type: 'text' },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      publishedField,
    ],
  },
  {
    key: 'communities',
    table: 'communities',
    label: 'Learning Communities',
    titleField: 'name',
    subtitleField: 'location',
    orderBy: 'sort_order',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'contact_email', label: 'Contact email', type: 'text' },
      { name: 'sort_order', label: 'Sort order', type: 'number' },
      publishedField,
    ],
  },
  {
    key: 'testimonials',
    table: 'testimonials',
    label: 'Student stories',
    titleField: 'quote',
    subtitleField: 'name',
    orderBy: 'name',
    fields: [
      { name: 'quote', label: 'Quote', type: 'textarea', required: true },
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'programme', label: 'Programme', type: 'text' },
      publishedField,
    ],
  },
  {
    key: 'pages',
    table: 'pages',
    label: 'Text pages',
    titleField: 'title',
    subtitleField: 'slug',
    orderBy: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug (do not change for built-in pages)', type: 'text', required: true },
      { name: 'body', label: 'Body', type: 'textarea', help: 'Separate paragraphs with a blank line.' },
      publishedField,
    ],
  },
]

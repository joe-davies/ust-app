export type ContentKind = 'article' | 'devotional' | 'video' | 'podcast' | 'qa' | 'news'
export type CourseLevel = 'foundation' | 'ba' | 'ma' | 'gdip' | 'mth' | 'phd' | 'short' | 'language'

export interface Series {
  id: string
  title: string
  slug: string
  description: string
  author: string
}

export interface ContentItem {
  id: string
  kind: ContentKind
  title: string
  slug: string
  author: string
  summary: string
  body: string
  media_url: string
  image_url: string
  read_minutes: number
  topics: string[]
  scripture: string
  series_id: string | null
  featured: boolean
  published_at: string
}

export interface Course {
  id: string
  level: CourseLevel
  title: string
  slug: string
  summary: string
  description: string
  duration: string
  mode: string
  next_start: string
  apply_url: string
}

export interface EventItem {
  id: string
  title: string
  slug: string
  kind: 'open-day' | 'conference' | 'lecture' | 'other'
  description: string
  starts_at: string
  location: string
  url: string
  featured: boolean
}

export interface Person {
  id: string
  name: string
  role: string
  bio: string
  photo_url: string
}

export interface Community {
  id: string
  name: string
  location: string
  description: string
  contact_email: string
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  programme: string
}

export interface PageRow {
  id: string
  slug: string
  title: string
  body: string
}

export const KIND_LABEL: Record<ContentKind, string> = {
  article: 'Article',
  devotional: 'Devotional',
  video: 'Video',
  podcast: 'Podcast',
  qa: 'Q&A',
  news: 'News',
}

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  foundation: 'Foundation',
  ba: 'BA',
  ma: 'MA',
  gdip: 'Graduate Diploma',
  mth: 'MTh',
  phd: 'PhD',
  short: 'Short course',
  language: 'Biblical language',
}

// ---- My Study (private per-user data) ----
export type CourseStatus = 'planned' | 'in-progress' | 'completed'
export type DeadlineKind = 'assignment' | 'exam' | 'reading' | 'other'
export type ReadingStatus = 'to-read' | 'reading' | 'done'
export type SavedType = 'content' | 'course' | 'event'

export interface MyCourse {
  id: string
  course_id: string | null
  title: string
  status: CourseStatus
  created_at: string
}

export interface Deadline {
  id: string
  my_course_id: string | null
  title: string
  kind: DeadlineKind
  due_at: string
  done: boolean
  notes: string
}

export interface Note {
  id: string
  my_course_id: string | null
  title: string
  body: string
  updated_at: string
}

export interface ReadingItem {
  id: string
  my_course_id: string | null
  title: string
  author: string
  status: ReadingStatus
}

export interface SavedItem {
  id: string
  item_type: SavedType
  item_id: string
  created_at: string
}

export const STATUS_LABEL: Record<CourseStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In progress',
  completed: 'Completed',
}
export const KIND_DEADLINE_LABEL: Record<DeadlineKind, string> = {
  assignment: 'Assignment',
  exam: 'Exam',
  reading: 'Reading',
  other: 'Other',
}
export const READING_LABEL: Record<ReadingStatus, string> = {
  'to-read': 'To read',
  reading: 'Reading now',
  done: 'Finished',
}

// Single source of truth for navigation AND placeholder routes.
// Every item here gets a route automatically (see App.tsx); replace a placeholder
// with a real page by adding an explicit <Route> above the generated ones.
export interface NavLeaf {
  label: string
  path: string
  blurb: string
  phase: 2 | 3 | 4
}
export interface NavGroup {
  label: string
  items: NavLeaf[]
}

export const NAV: NavGroup[] = [
  {
    label: 'Study with us',
    items: [
      { label: 'Course Picker', path: '/study/course-picker', blurb: 'Answer a few questions and find the programme that fits you.', phase: 2 },
      { label: 'Foundation Courses', path: '/study/foundation', blurb: 'Entry-level theological study.', phase: 2 },
      { label: 'BA', path: '/study/ba', blurb: 'Undergraduate degree programmes.', phase: 2 },
      { label: 'MA', path: '/study/ma', blurb: 'Master of Arts in Theology.', phase: 2 },
      { label: 'GDip', path: '/study/gdip', blurb: 'Graduate Diploma in Theology.', phase: 2 },
      { label: 'MTh', path: '/study/mth', blurb: 'Master of Theology.', phase: 2 },
      { label: 'PhD', path: '/study/phd', blurb: 'Doctoral research.', phase: 2 },
      { label: 'Shorter Courses', path: '/study/shorter-courses', blurb: 'Short courses and biblical languages.', phase: 2 },
    ],
  },
  {
    label: 'Teaching',
    items: [
      { label: 'Library', path: '/teaching', blurb: 'Series, articles, videos, podcasts and Q&As.', phase: 2 },
      { label: 'Devotionals', path: '/teaching/devotionals', blurb: 'A daily devotional to start your day.', phase: 2 },
      { label: 'Topics & Scripture Index', path: '/teaching/topics', blurb: 'Browse by topic or Bible passage.', phase: 2 },
      { label: 'Collections & Guides', path: '/teaching/collections', blurb: 'Curated collections and study guides.', phase: 2 },
    ],
  },
  {
    label: 'My Study',
    items: [
      { label: 'Overview', path: '/my-study', blurb: 'Your study space.', phase: 3 },
      { label: 'My Courses', path: '/my-study/courses', blurb: 'Your enrolled and saved courses.', phase: 3 },
      { label: 'Deadlines & Calendar', path: '/my-study/deadlines', blurb: 'Assignments and key dates in one place.', phase: 3 },
      { label: 'Notes', path: '/my-study/notes', blurb: 'Your study notes.', phase: 3 },
      { label: 'Reading Lists', path: '/my-study/reading', blurb: 'Track what you have read and what is next.', phase: 3 },
      { label: 'Saved', path: '/my-study/saved', blurb: 'Everything you have saved.', phase: 3 },
    ],
  },
  {
    label: 'Events',
    items: [
      { label: 'All Events', path: '/events', blurb: 'Open days, conferences and lectures.', phase: 2 },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Learning Communities', path: '/community/learning-communities', blurb: 'Find a Learning Community near you.', phase: 2 },
      { label: 'Ministry Centre', path: '/community/ministry-centre', blurb: 'Our Ministry Centre in Wales.', phase: 2 },
      { label: 'Union and Your Church', path: '/community/church', blurb: 'Partner with Union to grow leaders.', phase: 2 },
    ],
  },
  {
    label: 'Admissions',
    items: [
      { label: 'Fees and Funding', path: '/admissions/fees', blurb: 'What it costs and how to fund it.', phase: 2 },
      { label: 'Accommodation', path: '/admissions/accommodation', blurb: 'Where to stay.', phase: 2 },
      { label: 'Enquire / Apply', path: '/admissions/apply', blurb: 'Start your application.', phase: 2 },
    ],
  },
  {
    label: 'Student Life',
    items: [
      { label: 'Student Stories', path: '/life/stories', blurb: 'Hear from students and alumni.', phase: 2 },
      { label: 'Library & Support', path: '/life/support', blurb: 'Library, wellbeing and student support.', phase: 2 },
      { label: 'Alumni', path: '/life/alumni', blurb: 'Staying connected after you graduate.', phase: 2 },
    ],
  },
  {
    label: 'About',
    items: [
      { label: 'Faculty & Staff', path: '/about/faculty', blurb: 'Meet the team.', phase: 2 },
      { label: 'What We Believe', path: '/about/beliefs', blurb: 'Our doctrinal basis.', phase: 2 },
      { label: 'News', path: '/about/news', blurb: 'Latest news from Union.', phase: 2 },
      { label: 'Give', path: '/give', blurb: 'Become a Friend of Union and support our ministry.', phase: 2 },
    ],
  },
]

export const ALL_LEAVES: NavLeaf[] = NAV.flatMap((g) => g.items)

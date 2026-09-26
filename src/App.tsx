import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { ALL_LEAVES } from './nav'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import Account from './pages/Account'
import Admin from './pages/Admin'
import AdminLayout from './admin/AdminLayout'
import AdminResource from './admin/AdminResource'
import { Login, SignUp } from './pages/AuthPages'
import { Collections, Devotionals, NewsList, SeriesDetail, TeachingItem, TeachingLibrary, TopicsIndex } from './pages/Teaching'
import { CourseDetail, CoursePicker, CoursesByLevel } from './pages/Study'
import { CommunitiesList, EventsList, PeopleList, Stories, TextPage } from './pages/Community'

const LEVEL_PATHS = ['foundation', 'ba', 'ma', 'gdip', 'mth', 'phd', 'shorter-courses']

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Admin />} />
              <Route path=":resource" element={<AdminResource />} />
            </Route>

            {/* Study */}
            <Route path="/study/course-picker" element={<CoursePicker />} />
            {LEVEL_PATHS.map((p) => (
              <Route key={p} path={`/study/${p}`} element={<CoursesByLevel />} />
            ))}
            <Route path="/courses/:slug" element={<CourseDetail />} />

            {/* Teaching */}
            <Route path="/teaching" element={<TeachingLibrary />} />
            <Route path="/teaching/devotionals" element={<Devotionals />} />
            <Route path="/teaching/topics" element={<TopicsIndex />} />
            <Route path="/teaching/collections" element={<Collections />} />
            <Route path="/teaching/series/:slug" element={<SeriesDetail />} />
            <Route path="/teaching/item/:slug" element={<TeachingItem />} />

            {/* Events, community, admissions, life, about */}
            <Route path="/events" element={<EventsList />} />
            <Route path="/community/learning-communities" element={<CommunitiesList />} />
            <Route path="/community/ministry-centre" element={<TextPage slug="ministry-centre" />} />
            <Route path="/community/church" element={<TextPage slug="church" />} />
            <Route path="/admissions/fees" element={<TextPage slug="fees" />} />
            <Route path="/admissions/accommodation" element={<TextPage slug="accommodation" />} />
            <Route path="/admissions/apply" element={<TextPage slug="apply" cta="apply" />} />
            <Route path="/life/stories" element={<Stories />} />
            <Route path="/life/support" element={<TextPage slug="support" />} />
            <Route path="/life/alumni" element={<TextPage slug="alumni" />} />
            <Route path="/about/faculty" element={<PeopleList />} />
            <Route path="/about/beliefs" element={<TextPage slug="beliefs" />} />
            <Route path="/about/news" element={<NewsList />} />
            <Route path="/give" element={<TextPage slug="give" />} />

            {/* Phase 3 (My Study) placeholders + not-found */}
            {ALL_LEAVES.filter((leaf) => leaf.phase === 3).map((leaf) => (
              <Route key={leaf.path} path={leaf.path} element={<Placeholder />} />
            ))}
            <Route path="*" element={<Placeholder />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

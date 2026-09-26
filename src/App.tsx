import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
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
import { SavedProvider } from './mystudy/SavedContext'
import MyStudyHome from './mystudy/MyStudyHome'
import MyCourses from './mystudy/MyCourses'
import Deadlines from './mystudy/Deadlines'
import Notes from './mystudy/Notes'
import Reading from './mystudy/Reading'
import Saved from './mystudy/Saved'

const LEVEL_PATHS = ['foundation', 'ba', 'ma', 'gdip', 'mth', 'phd', 'shorter-courses']

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedProvider>
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

            {/* My Study (private, login required) */}
            <Route path="/my-study" element={<ProtectedRoute><MyStudyHome /></ProtectedRoute>} />
            <Route path="/my-study/courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/my-study/deadlines" element={<ProtectedRoute><Deadlines /></ProtectedRoute>} />
            <Route path="/my-study/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/my-study/reading" element={<ProtectedRoute><Reading /></ProtectedRoute>} />
            <Route path="/my-study/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />

            {/* Not found */}
            <Route path="*" element={<Placeholder />} />
          </Route>
        </Routes>
        </SavedProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

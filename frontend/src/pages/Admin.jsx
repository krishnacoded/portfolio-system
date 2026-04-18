import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import api from '../utils/api'
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'access_token'

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}



// ─────────────────────────────────────────────────────────────────────────────
// Fade-up animation variant
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})


// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Thin top-bar with logo + logout */
function AdminTopBar({ onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-16 flex items-center px-6 md:px-10 justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-navy rounded-sm flex items-center justify-center">
          <span className="text-white font-mono text-xs select-none">{'</>'}</span>
        </div>
        <span className="font-display font-600 text-navy text-base hidden sm:block">
          Dev<span className="text-accent-green">.</span>
        </span>
        <span className="hidden sm:flex items-center gap-1.5 ml-3 font-mono text-xs text-gray-400 uppercase tracking-widest">
          <span className="text-gray-200">/</span>
          Admin
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:flex items-center gap-2 font-mono text-xs text-gray-400">
          <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          Authenticated
        </span>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 font-body text-xs font-500 text-gray-500 hover:text-red-500 transition-colors uppercase tracking-wider border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  )
}

/** Stat card */
function StatCard({ label, value, icon, sub, delay }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="bg-white border border-gray-100 rounded-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gray-50 rounded-sm flex items-center justify-center text-xl border border-gray-100">
          {icon}
        </div>
        {sub && (
          <span className="font-mono text-xs text-accent-green bg-green-50 border border-green-100 px-2 py-0.5 rounded-sm">
            {sub}
          </span>
        )}
      </div>
      <div className="font-display text-4xl font-700 text-navy mb-1">{value}</div>
      <div className="font-body text-xs text-gray-400 uppercase tracking-widest">{label}</div>
    </motion.div>
  )
}

/** Empty state for the table */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-300">
      <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <p className="font-mono text-sm uppercase tracking-widest">No submissions yet</p>
    </div>
  )
}

/** Table row — expanded message in a slide-down panel */
function SubmissionRow({ row, index, isExpanded, onToggle }) {
  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
        onClick={onToggle}
        className={`group cursor-pointer border-b border-gray-50 transition-colors duration-150
          ${isExpanded ? 'bg-gray-50/80' : 'hover:bg-gray-50/50'}`}
      >
        {/* # */}
        <td className="px-6 py-4 font-mono text-xs text-gray-300 w-12">
          {String(index + 1).padStart(2, '0')}
        </td>

        {/* Name */}
        <td className="px-4 py-4">
          <div className="font-body font-500 text-navy text-sm">{row.name}</div>
        </td>

        {/* Email */}
        <td className="px-4 py-4 hidden md:table-cell">
          <a
            href={`mailto:${row.email}`}
            onClick={(e) => e.stopPropagation()}
            className="font-mono text-xs text-gray-500 hover:text-navy transition-colors underline-offset-2 hover:underline"
          >
            {row.email}
          </a>
        </td>

        {/* Phone */}
        <td className="px-4 py-4 hidden lg:table-cell">
          <span className="font-mono text-xs text-gray-400">
            {row.phone || <span className="text-gray-200">—</span>}
          </span>
        </td>

        {/* Message preview */}
        <td className="px-4 py-4 hidden sm:table-cell max-w-xs">
          <span className="font-body text-xs text-gray-400 line-clamp-1">
            {row.message}
          </span>
        </td>

        {/* Date */}
        <td className="px-4 py-4 hidden md:table-cell">
          <span className="font-mono text-xs text-gray-400">{formatDate(row.created_at)}</span>
        </td>

        {/* Expand chevron */}
        <td className="px-4 py-4 text-right">
          <span className={`inline-block text-gray-300 group-hover:text-navy transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </td>
      </motion.tr>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={7} className="p-0 border-b border-gray-100">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50/60 px-8 py-6 grid md:grid-cols-3 gap-6">
                  {/* Full message */}
                  <div className="md:col-span-2">
                    <div className="font-mono text-xs text-gray-400 uppercase tracking-wider mb-2">Full Message</div>
                    <p className="font-body text-sm text-navy leading-relaxed bg-white border border-gray-100 rounded-sm p-4">
                      {row.message}
                    </p>
                  </div>

                  {/* Contact details */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="font-mono text-xs text-gray-400 uppercase tracking-wider mb-1">Email</div>
                      <a href={`mailto:${row.email}`} className="font-body text-sm text-navy hover:text-accent-green transition-colors">
                        {row.email}
                      </a>
                    </div>
                    {row.phone && (
                      <div>
                        <div className="font-mono text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</div>
                        <a href={`tel:${row.phone}`} className="font-body text-sm text-navy hover:text-accent-green transition-colors">
                          {row.phone}
                        </a>
                      </div>
                    )}
                    <div>
                      <div className="font-mono text-xs text-gray-400 uppercase tracking-wider mb-1">Received</div>
                      <span className="font-mono text-xs text-gray-500">{formatDate(row.created_at)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <a
                        href={`mailto:${row.email}?subject=Re: Your message`}
                        className="btn-primary text-xs py-2 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Reply
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Login Screen
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      let res

      if (isSignup) {
        // 🔥 SIGNUP
        res = await api.post('/auth/signup', {
          email,
          password,
        })
        res = res.data
      } else {
        // 🔥 LOGIN
        res = await api.post('/auth/login', {
          email,
          password,
        })
        res = res.data
      }

      // ✅ Save token
      saveToken(res.access_token)

      // ✅ Enter dashboard
      onLogin()

      toast.success(
        isSignup ? 'Account created successfully 🎉' : 'Welcome back, Admin.'
      )
    } catch (err) {
      const status = err.response?.status

      if (status === 401) {
        setError('Invalid email or password.')
      } else if (status === 400) {
        setError('Email already registered.')
      } else {
        setError('Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white grid-lines flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white border border-gray-100 rounded-sm shadow-xl p-10">

          {/* 🔥 Title */}
          <h1 className="font-display text-3xl font-700 text-navy mb-2">
            {isSignup ? 'Create Account' : 'Welcome back.'}
          </h1>

          <p className="font-body text-gray-400 text-sm mb-8">
            {isSignup
              ? 'Sign up to access admin panel.'
              : 'Login with your credentials.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="admin@example.com"
                className="w-full border border-gray-200 px-4 py-3 rounded-sm focus:outline-none focus:border-navy"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                className="w-full border border-gray-200 px-4 py-3 rounded-sm focus:outline-none focus:border-navy"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center"
            >
              {loading
                ? 'Please wait...'
                : isSignup
                ? 'Sign Up'
                : 'Login'}
            </button>

          </form>

          {/* 🔁 TOGGLE */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            {isSignup
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
              }}
              className="text-blue-600 hover:underline"
            >
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </p>

        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Screen
// ─────────────────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }) {
  const [submissions, setSubmissions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [subRes, countRes] = await Promise.all([
        api.get(`/admin/contact?skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`),
        api.get('/admin/contact/count'),
      ])
      setSubmissions(subRes.data)
      setTotal(countRes.data.total)
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        clearToken()
        onLogout()
      } else {
        toast.error('Failed to load data.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, onLogout])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filtered submissions
  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.message.toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    )
  })

  const today = submissions.filter(
    (s) => new Date(s.created_at).toDateString() === new Date().toDateString()
  ).length

  const thisWeek = submissions.filter((s) => {
    const diff = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length

  return (
    <div className="min-h-screen bg-gray-50/40">
      <AdminTopBar onLogout={() => { clearToken(); onLogout() }} />

      <main className="pt-24 pb-16 px-6 md:px-10 max-w-7xl mx-auto">

        {/* Page header */}
        <motion.div {...fadeUp(0.05)} className="mb-10">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-accent-green uppercase tracking-widest mb-3">
            <span className="w-6 h-px bg-accent-green" />
            Dashboard
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="font-display text-4xl md:text-5xl font-700 text-navy">
              Inbox Overview
            </h1>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="btn-outline text-xs py-2.5 self-start sm:self-auto"
            >
              {refreshing ? (
                <span className="w-3.5 h-3.5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Messages" value={loading ? '—' : total} icon="✉️" delay={0.1} />
          <StatCard label="Today" value={loading ? '—' : today} icon="📅" sub={today > 0 ? 'New' : null} delay={0.15} />
          <StatCard label="This Week" value={loading ? '—' : thisWeek} icon="📊" delay={0.2} />
          <StatCard label="Showing" value={loading ? '—' : filtered.length} icon="🔍" delay={0.25} />
        </div>

        {/* Table card */}
        <motion.div {...fadeUp(0.3)} className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">

          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-body font-600 text-navy text-sm uppercase tracking-wider">
                Contact Submissions
              </h2>
              <span className="font-mono text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-sm">
                {total}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, message…"
                className="pl-9 pr-4 py-2 text-xs font-body border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:border-navy focus:bg-white transition-all duration-200 w-64 placeholder-gray-300"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-8 h-4 bg-gray-100 rounded-sm" />
                  <div className="w-32 h-4 bg-gray-100 rounded-sm" />
                  <div className="w-48 h-4 bg-gray-100 rounded-sm hidden md:block" />
                  <div className="flex-1 h-4 bg-gray-100 rounded-sm hidden sm:block" />
                  <div className="w-28 h-4 bg-gray-100 rounded-sm hidden md:block" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-3 text-left font-mono text-xs text-gray-300 uppercase tracking-wider w-12">#</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gray-300 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gray-300 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gray-300 uppercase tracking-wider hidden sm:table-cell">Message</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gray-300 uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <SubmissionRow
                      key={row.id}
                      row={row}
                      index={i}
                      isExpanded={expandedId === row.id}
                      onToggle={() => setExpandedId(expandedId === row.id ? null : row.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!loading && total > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">
                Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.p
          {...fadeUp(0.4)}
          className="mt-8 text-center font-mono text-xs text-gray-300"
        >
          Admin Panel · Portfolio API · Data stored in PostgreSQL
        </motion.p>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Admin component — handles auth state
// ─────────────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 🔥 CENTRALIZED LOGOUT
  const handleLogout = () => {
    clearToken()
    setAuthed(false)
    toast.success("Logged out successfully")
  }

  useEffect(() => {
    const verify = async () => {
      const token = getToken()

      if (!token) {
        setCheckingAuth(false)
        return
      }

      try {
        // verify token by hitting protected route
        await api.get('/admin/contact/count')
        setAuthed(true)
      } catch {
        clearToken()
        setAuthed(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    verify()
  }, [])

  // 🔄 SESSION RESTORE SCREEN
  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Restoring session...</p>
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            borderRadius: '2px',
          },
          success: { iconTheme: { primary: '#006400', secondary: '#fff' } },
        }}
      />

      <AnimatePresence mode="wait">
        {authed ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ✅ FIXED LOGOUT FLOW */}
            <Dashboard onLogout={handleLogout} />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoginScreen onLogin={() => setAuthed(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

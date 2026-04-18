import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { submitContact } from '../utils/api'

const INITIAL = { name: '', phone: '', email: '', message: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email'
  if (!form.message.trim()) errors.message = 'Message is required'
  else if (form.message.trim().length < 10) errors.message = 'Message must be at least 10 characters'
  if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) {
    errors.phone = 'Enter a valid phone number'
  }
  return errors
}

export default function Contact() {
  const { ref, inView } = useScrollReveal()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleaned = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
    }

    const errs = validate(cleaned)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)

    try {
      await submitContact(cleaned)

      toast.success("Message sent! I'll get back to you soon.", {
        duration: 4000,
      })

      setForm(INITIAL)
      setErrors({})
    } catch (err) {
      // 🔥 improved error handling
      const msg =
        err?.message ||
        err?.response?.data?.detail ||
        'Something went wrong. Please try again.'

      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-28 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left — Info */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 font-mono text-xs text-accent-green uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-accent-green" />
              Get In Touch
            </span>

            <h2 className="font-display text-5xl md:text-6xl font-700 text-white leading-tight mb-6">
              Let's build<br />
              <em className="not-italic text-accent-green">something</em><br />
              great.
            </h2>

            <p className="font-body text-gray-400 text-lg leading-relaxed mb-10">
              I'm currently open to backend or full-stack roles, freelance projects, and interesting collaborations. Drop me a message.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: '✉️', label: 'Email', value: 'kishankantt2007@gmail.com', href: 'mailto:kishankantt2007@gmail.com' },
                { icon: '📱', label: 'Phone', value: '+91 99059 70105', href: 'tel:+919905970105' },
                { icon: '📍', label: 'Location', value: 'India', href: null },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-lg w-8">{item.icon}</span>
                  <div>
                    <div className="font-mono text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="font-body text-sm text-gray-300 hover:text-white transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <span className="font-body text-sm text-gray-300">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
           <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 rounded-sm p-8 flex flex-col gap-5">

  <div className="grid sm:grid-cols-2 gap-5">
    {/* Name */}
    <div>
      <label className="block font-mono text-xs text-gray-400 uppercase tracking-wider mb-2">
        Name <span className="text-accent-green">*</span>
      </label>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="John Doe"
        className={`w-full bg-white/5 border ${errors.name ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-500 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent-green`}
      />
      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
    </div>

    {/* Phone */}
    <div>
      <label className="block font-mono text-xs text-gray-400 uppercase tracking-wider mb-2">
        Phone <span className="text-gray-500">(optional)</span>
      </label>
      <input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="+91 xxxx xxxx xx"
        className={`w-full bg-white/5 border ${errors.phone ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-500 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent-green`}
      />
      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
    </div>
  </div>

  {/* Email */}
  <div>
    <label className="block font-mono text-xs text-gray-400 uppercase tracking-wider mb-2">
      Email <span className="text-accent-green">*</span>
    </label>
    <input
      type="email"
      name="email"
      value={form.email}
      onChange={handleChange}
      placeholder="john@example.com"
      className={`w-full bg-white/5 border ${errors.email ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-500 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent-green`}
    />
    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
  </div>

  {/* Message */}
  <div>
    <label className="block font-mono text-xs text-gray-400 uppercase tracking-wider mb-2">
      Message <span className="text-accent-green">*</span>
    </label>
    <textarea
      name="message"
      value={form.message}
      onChange={handleChange}
      rows={5}
      placeholder="Tell me about your project or opportunity..."
      className={`w-full bg-white/5 border ${errors.message ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-500 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent-green resize-none`}
    />
    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full flex items-center justify-center gap-2 bg-accent-green text-white py-4 font-body font-500 text-sm uppercase tracking-widest rounded-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
  >
    {loading ? (
      <>
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Sending...
      </>
    ) : (
      <>
        Send Message
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </>
    )}
  </button>

</form>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
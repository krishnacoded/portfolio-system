import { motion } from 'framer-motion'
import profileImg from "../assets/images/profile_picture.jpeg"; // ✅ added

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center bg-white grid-lines overflow-hidden"
    >
      {/* Background accent shape */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-gray-50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-navy/3 blur-3xl pointer-events-none" />

      <div className="section-container w-full pt-28 pb-20 md:pt-32 md:pb-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">

          {/* Left — Text Content */}
          <div className="order-2 md:order-1">
            <motion.div {...fadeUp(0.1)}>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-accent-green uppercase tracking-widest mb-6">
                <span className="w-8 h-px bg-accent-green" />
                Available for opportunities
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-700 text-navy leading-[1.05] text-balance mb-6"
            >
              Building the{' '}
              <span className="relative inline-block">
                <em className="not-italic text-accent-green">backend</em>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent-green/30" />
              </span>{' '}
              that powers ideas.
            </motion.h1>

            <motion.p
              {...fadeUp(0.3)}
              className="font-body text-gray-500 font-500 text-base mb-2 uppercase tracking-widest"
            >
              Backend Developer &nbsp;|&nbsp; Aspiring Full Stack Developer
            </motion.p>

            <motion.p
              {...fadeUp(0.4)}
              className="font-body text-gray-600 text-lg leading-relaxed mt-4 mb-10 max-w-md"
            >
              I craft robust APIs and database architectures that scale. Currently expanding into full-stack development — turning ideas into end-to-end digital products.
            </motion.p>

            <motion.div {...fadeUp(0.5)} className="flex flex-wrap gap-4">
              <button
                onClick={() => document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary"
              >
                View Projects
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                onClick={() => document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline"
              >
                Contact Me
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              {...fadeUp(0.6)}
              className="flex gap-10 mt-14 pt-10 border-t border-gray-100"
            >
              {[
                { value: '5+', label: 'Projects Built' },
                { value: '∞', label: 'Curiosity' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-700 text-navy">{stat.value}</div>
                  <div className="font-body text-xs text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 md:order-2 flex justify-center md:justify-end"
          >
            <div className="relative">
              {/* Main image frame */}
              <div className="relative w-72 h-80 md:w-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-sm overflow-hidden border border-gray-200">
                
                {/* ✅ Replaced placeholder with image */}
                <img
                  src={profileImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />

              </div>

              {/* Decorative offset border */}
              <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-navy/15 rounded-sm -z-10" />

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-navy text-white px-4 py-3 rounded-sm shadow-xl"
              >
                <div className="font-mono text-xs text-gray-400">Currently building</div>
                <div className="font-body font-600 text-sm mt-0.5">ReShare</div>
              </motion.div>

              {/* Tech dot */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-accent-green rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-300"
      >
        <span className="font-mono text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-0.5 h-8 bg-gradient-to-b from-gray-200 to-transparent"
        />
      </motion.div>
    </section>
  )
}
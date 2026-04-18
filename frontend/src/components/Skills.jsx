import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'

const KNOWN_SKILLS = [
  { name: 'HTML5', icon: '🌐', category: 'Languages' },
  { name: 'CSS3', icon: '🎨', category: 'Languages' },
  { name: 'JavaScript', icon: '⚡', category: 'Languages' },
  { name: 'Python', icon: '🐍', category: 'Languages' },
  { name: 'FastAPI', icon: '🚀', category: 'Backend' },
  { name: 'REST APIs', icon: '🔗', category: 'Backend' },
  { name: 'JWT Auth', icon: '🔐', category: 'Backend' },
  { name: 'PostgreSQL', icon: '🐘', category: 'Databases' },
  { name: 'MySQL', icon: '🗄️', category: 'Databases' },
  { name: 'Redis', icon: '🔴', category: 'Databases' },
  { name: 'Git', icon: '📦', category: 'Tools' },
  { name: 'GitHub', icon: '🐙', category: 'Tools' },
  
]

const LEARNING_SKILLS = [
  { name: 'React', icon: '⚛️', category: 'Frontend' },
  { name: 'Tailwind CSS', icon: '💨', category: 'Frontend' },
  { name: 'Docker', icon: '🐳', category: 'DevOps' },
  { name: 'Vite', icon: '⚡', category: 'Tools' },
  { name: 'SQLAlchemy', icon: '🔧', category: 'Backend' },
]

function SkillPill({ skill, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="skill-pill flex-shrink-0 flex items-center gap-3 bg-white border border-gray-100 px-5 py-3 rounded-sm shadow-sm cursor-default"
    >
      <span className="text-xl leading-none">{skill.icon}</span>
      <div>
        <div className="font-body font-500 text-navy text-sm">{skill.name}</div>
        <div className="font-mono text-xs text-gray-400">{skill.category}</div>
      </div>
    </motion.div>
  )
}

function SkillCarousel({ skills, direction = 1 }) {
  const doubled = [...skills, ...skills]
  return (
    <div className="overflow-hidden relative">
      <div
        className="flex gap-4"
        style={{
          animation: `marquee${direction > 0 ? 'Right' : 'Left'} ${skills.length * 3.5}s linear infinite`,
        }}
      >
        {doubled.map((skill, i) => (
          <SkillPill key={`${skill.name}-${i}`} skill={skill} index={0} />
        ))}
      </div>
      <style>{`
        @keyframes marqueeRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeLeft {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default function Skills() {
  const { ref, inView } = useScrollReveal()

  return (
    <section id="skills" className="py-28 bg-gray-50/60">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 font-mono text-xs text-accent-green uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-accent-green" />
            Expertise
          </span>
          <h2 className="section-title mb-4">Skills & Tools</h2>
          <p className="font-body text-gray-500 text-lg max-w-xl">
            Technologies I work with daily, and the ones I'm actively mastering.
          </p>
        </motion.div>

        {/* Known Skills */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-body font-600 text-navy text-sm uppercase tracking-widest">I'm comfortable with</span>
            <span className="flex-1 h-px bg-gray-200" />
            <span className="font-mono text-xs text-gray-400">{KNOWN_SKILLS.length} skills</span>
          </div>
          <SkillCarousel skills={KNOWN_SKILLS} direction={1} />
        </div>

        {/* Learning Skills */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-body font-600 text-navy text-sm uppercase tracking-widest">Currently Learning</span>
            <span className="flex-1 h-px bg-gray-200" />
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-accent-green">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              Active
            </span>
          </div>
          <SkillCarousel skills={LEARNING_SKILLS} direction={-1} />
        </div>

        {/* Category Grid (static) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { category: 'Languages', skills: ['HTML', 'CSS', 'JavaScript', 'Python'], icon: '💻' },
            { category: 'Backend', skills: ['FastAPI', 'REST APIs', 'JWT', 'SQLAlchemy'], icon: '⚙️' },
            { category: 'Databases', skills: ['PostgreSQL', 'MySQL', 'Redis'], icon: '🗄️' },
            { category: 'Tools', skills: ['Git', 'GitHub', 'VS Code'], icon: '🔧' },
          ].map((group) => (
            <div
              key={group.category}
              className="bg-white border border-gray-100 rounded-sm p-5 hover:border-navy/20 hover:shadow-md transition-all duration-300"
            >
              <div className="text-2xl mb-3">{group.icon}</div>
              <div className="font-body font-600 text-navy text-sm uppercase tracking-wider mb-3">{group.category}</div>
              <div className="flex flex-col gap-1.5">
                {group.skills.map((s) => (
                  <span key={s} className="font-mono text-xs text-gray-500">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

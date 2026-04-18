import { motion } from 'framer-motion'
import ProjectCard from './ProjectCard'
import { useScrollReveal } from '../hooks/useScrollReveal'

const PROJECTS = [
  {
    title: 'PlasticProfit',
    description:
      'A B2B marketplace for plastic resale and distribution. Connects suppliers and buyers in the recycled plastics industry with real-time listings, quote management, and order tracking.',
    techStack: ['HTML', 'Tailwind CSS', 'React', 'FastAPI', 'MySQL'],
    github: 'https://github.com/yourusername/plasticprofit',
    live: null,
    image: null,
  },
  {
    title: 'ReShare',
    description:
      'A community-driven platform for resource redistribution. Enables individuals and organisations to share surplus goods with people in need — reducing waste while strengthening local communities.',
    techStack: ['React', 'Tailwind CSS', 'FastAPI', 'PostgreSQL', 'Redis'],
    github: 'https://github.com/yourusername/reshare',
    live: null,
    image: null,
  },
]

export default function Projects() {
  const { ref, inView } = useScrollReveal()

  return (
    <section id="projects" className="py-28 bg-white">
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
            Selected Work
          </span>
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-0 justify-between">
            <h2 className="section-title">Projects</h2>
            <p className="font-body text-gray-500 text-sm max-w-xs leading-relaxed">
              Real-world applications built with production-grade architecture.
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        {/* More coming soon */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 border border-dashed border-gray-200 px-8 py-4 rounded-sm">
            <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">More projects in progress</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

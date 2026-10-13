import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  ['Report a lost item', 'Tell us what you lost, where and when. Staff and the community help match it.'],
  ['Browse found items', 'Search items handed in across Sri Lanka by keyword, category, location and date.'],
  ['Claim your item', 'Spot your belongings? Submit proof of ownership and track the claim until it is returned.'],
];
const steps = [
  'Create a free account',
  'Report a lost item, or search the found items list',
  'Submit a claim with proof of ownership',
  'Staff verify it and arrange the return',
];

const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const rise = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
  return (
    <>
      <section className="hero">
        <span className="chip glass">Sri Lanka Lost &amp; Found</span>
        <h1>
          Lost something? <br />
          Find your <em>item</em> in seconds.
        </h1>
        <p className="lead">
          One portal for students, households and tourists to report, find and claim lost belongings across the island.
        </p>
        <div className="row center-row">
          <Link to="/signup" className="btn">Get started</Link>
          <Link to="/login" className="btn ghost">Sign in</Link>
        </div>
      </section>

      <motion.div className="grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        {features.map(([t, d]) => (
          <motion.div className="card glass" variants={rise} key={t}>
            <h3>{t}</h3>
            <p className="muted">{d}</p>
          </motion.div>
        ))}
      </motion.div>

      <section className="section">
        <h2 className="center">How it <em>works</em></h2>
        <ol className="how glass">
          {steps.map((s, i) => (
            <li key={s}>
              <span className="num">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../AuthContext.jsx';
import Cursor from './Cursor.jsx';
import { RouteProgress } from './UI.jsx';

const customerLinks = [
  ['/app/browse', 'Find Item'],
  ['/app/lost', 'Report Lost'],
  ['/app/found', 'Report Found'],
  ['/app/reports', 'My Reports'],
];
const adminLinks = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/items', 'Manage Items'],
  ['/admin/claims', 'Claims'],
];

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const inAdmin = pathname.startsWith('/admin');

  const links = !user ? [] : inAdmin ? adminLinks : customerLinks;
  const home = !user ? '/' : user.role === 'admin' ? '/admin' : '/app';
  const doLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };
  const close = () => setOpen(false);

  const items = (
    <>
      {links.map(([to, label]) => (
        <NavLink key={to} to={to} onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
          {label}
        </NavLink>
      ))}
      {user?.role === 'admin' && (
        <Link to={inAdmin ? '/app' : '/admin'} onClick={close}>{inAdmin ? 'Customer view' : 'Staff portal'}</Link>
      )}
      {user ? (
        <button className="nav-btn" onClick={doLogout}>Logout</button>
      ) : (
        <>
          <Link to="/login" onClick={close}>Staff Login</Link>
          <Link to="/login" className="btn small" onClick={close}>Sign in</Link>
          <Link to="/signup" className="btn small ghost" onClick={close}>Sign up</Link>
        </>
      )}
    </>
  );

  return (
    <header className="nav-wrap">
      <div className="nav glass">
        <Link to={home} className="brand" onClick={close}>Lost <em>&amp;</em> Found</Link>
        <nav className="nav-links" aria-label="Main">{items}</nav>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu glass"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {items}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

// Nav, background, cursor and footer stay mounted; only `children` (the page) animates.
export default function Layout({ children }) {
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/admin');

  return (
    <div className={`shell ${admin ? 'admin' : ''}`}>
      <div className="bg" aria-hidden="true" />
      <RouteProgress routeKey={pathname} />
      <Nav />
      <main className="container">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Lost &amp; Found Portal · Sri Lanka</span>
      </footer>
      <Cursor />
    </div>
  );
}

import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/employer/dashboard' },
  { label: 'Company', to: '/employer/company' },
  { label: 'Jobs', to: '/employer/jobs' },
  { label: 'Applications', to: '/employer/jobs' }
];

export default function EmployerNav({ isDark }) {
  const { pathname } = useLocation();

  const isItemActive = (item) => {
    if (item.to === '/employer/jobs') {
      return pathname === '/employer/jobs' || pathname.startsWith('/employer/jobs/') || pathname.startsWith('/employer/candidates/');
    }

    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  };

  const baseLink = isDark
    ? 'flex items-center rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-slate-600 hover:bg-slate-800/80'
    : 'flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50';

  const activeLink = isDark
    ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
    : 'border-sky-200 bg-sky-50 text-sky-700';

  return (
    <>
      <nav aria-label="Employer navigation" className={`hidden rounded-2xl border p-2 md:flex ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
        <div className="flex w-full flex-col gap-2">
          {navItems.map((item) => {
            const active = isItemActive(item);

            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/employer/dashboard' || item.to === '/employer/company' || item.to === '/employer/jobs'}
                aria-current={active ? 'page' : undefined}
                className={`${baseLink} ${active ? activeLink : isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-700'}`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <nav aria-label="Employer mobile navigation" className={`rounded-2xl border p-2 md:hidden ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = isItemActive(item);

            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/employer/dashboard' || item.to === '/employer/company' || item.to === '/employer/jobs'}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${active ? (isDark ? 'border-sky-500/40 bg-sky-500/10 text-sky-300' : 'border-sky-200 bg-sky-50 text-sky-700') : (isDark ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700')}`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Users, MapPin, Calendar, CreditCard, Ticket } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Owners', path: '/owners', icon: Users },
  { name: 'Venues', path: '/venues', icon: MapPin },
  { name: 'Bookings', path: '/bookings', icon: Calendar },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Memberships', path: '/memberships', icon: Ticket },
  { name: 'Payments', path: '/payments', icon: CreditCard },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-full shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-lg shadow-blue-600/30 font-bold">
            🏸
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight leading-tight text-white">Venue OS</div>
            <div className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Admin Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

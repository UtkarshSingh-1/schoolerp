import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    UserPlus,
    Users,
    CalendarCheck,
    BookOpen,
    CreditCard,
    Wallet,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Award,
    ShieldCheck,
    Bell,
    Search,
    Bus,
    Home,
    Send,
    ClipboardList,
    LayoutGrid,
    History,
    User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const ROLE_MAP = {
        1: 'SUPER_ADMIN',
        2: 'SCHOOL_ADMIN',
        3: 'PRINCIPAL',
        4: 'TEACHER',
        5: 'STUDENT',
        6: 'PARENT',
        7: 'ACCOUNTANT',
        8: 'STAFF'
    };

    const normalizedRole = typeof user?.role === 'number' ? ROLE_MAP[user.role] : user?.role;

    React.useEffect(() => {
        const isSetupRole = ['STUDENT', 'TEACHER', 'STAFF'].includes(normalizedRole);
        const requiresSetup = isSetupRole && (user?.mustChangePassword || user?.mustUploadPhoto || user?.onboardingRequired);

        if (requiresSetup && location.pathname !== '/first-login-setup') {
            navigate('/first-login-setup');
        } else if (!requiresSetup && user?.mustChangePassword && location.pathname !== '/change-password') {
            navigate('/change-password');
        }
    }, [user, location, navigate, normalizedRole]);

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STAFF', 'STUDENT', 'PARENT'] },
        { name: 'My Profile', icon: <UserIcon size={20} />, path: `/students/${user?.id || 1}`, roles: ['STUDENT', 'TEACHER', 'STAFF'] },
        { name: 'Timetable', icon: <CalendarCheck size={20} />, path: '/timetable', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'] },
        { name: 'Admission', icon: <UserPlus size={20} />, path: '/admission', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'] },
        { name: 'Students', icon: <Users size={20} />, path: '/students', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STAFF', 'PARENT', 'STUDENT'] },
        { name: 'Class Management', icon: <LayoutGrid size={20} />, path: '/classes', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Staff Management', icon: <Users size={20} />, path: '/staff', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'] },
        { name: 'Subject Management', icon: <BookOpen size={20} />, path: '/subjects', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Attendance', icon: <CalendarCheck size={20} />, path: '/attendance', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'] },
        { name: 'Exams', icon: <BookOpen size={20} />, path: '/exams', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'] },
        { name: 'Gradebook', icon: <Award size={20} />, path: '/gradebook', roles: ['STUDENT', 'PARENT'] },
        { name: 'Child Progress', icon: <Users size={20} />, path: '/parent-portal', roles: ['PARENT'] },
        { name: 'Marks Entry', icon: <Award size={20} />, path: '/marks-entry', roles: ['TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'PARENT', 'STUDENT'] },
        { name: 'Fees Management', icon: <CreditCard size={20} />, path: '/fees', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'PRINCIPAL'] },
        { name: 'Question Bank', icon: <BookOpen size={20} />, path: '/questions', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Payroll & HR', icon: <Users size={20} />, path: '/payroll', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'STAFF'] },
        { name: 'Transport', icon: <Bus size={20} />, path: '/transport', roles: ['SCHOOL_ADMIN', 'STAFF', 'PARENT', 'STUDENT', 'PRINCIPAL', 'SUPER_ADMIN'] },
        { name: 'Hostel', icon: <Home size={20} />, path: '/hostel', roles: ['SCHOOL_ADMIN', 'STAFF', 'PARENT', 'STUDENT', 'PRINCIPAL', 'SUPER_ADMIN'] },
        { name: 'Apply Services', icon: <Send size={20} />, path: '/apply-services', roles: ['STUDENT'] },
        { name: 'Service Requests', icon: <ClipboardList size={20} />, path: '/service-requests', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF'] },
        { name: 'Audit Logs', icon: <History size={20} />, path: '/audit-logs', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(normalizedRole));

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-inter font-medium text-slate-600">
            {/* Sidebar */}
            <aside
                className={`${!isSidebarCollapsed ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-30 shadow-2xl`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    {!isSidebarCollapsed && (
                        <span className="font-extrabold text-white tracking-tight text-lg">
                            St. Xavier's
                        </span>
                    )}
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto">
                    {filteredMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <div className={`${isActive ? 'text-white' : 'group-hover:text-blue-400'}`}>
                                    {item.icon}
                                </div>
                                {!isSidebarCollapsed && <span className="font-bold text-sm tracking-wide whitespace-nowrap">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all group"
                    >
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="font-bold text-sm">Logout</span>}
                    </button>

                    <button
                        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                        className="w-full mt-2 flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-white rounded-xl transition-all"
                    >
                        {!isSidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        {!isSidebarCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Navbar */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-all group">
                            <Bell size={22} className="group-hover:shake" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-100"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{normalizedRole?.toString()?.replace('_', ' ')}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm border border-blue-100">
                                <UserIcon size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

import { LogOut, X } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/auth/authSlice';
import { removeToken } from '@/utils/auth';
import { toggleSidebar, collapseSidebar } from '@/redux/theme/theme_slice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SidebarItem from './SidebarItem';
import { adminSidebarItems, userSidebarItems } from './sidebarData';
import { AppDispatch, RootState } from '@/redux/store';
import { useLoader } from '@/context/LoaderContext';

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { collapsed } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { showLoader, hideLoader } = useLoader();
  const role = user?.role;

  const sidebarItems = role === 'ADMIN' ? adminSidebarItems : userSidebarItems;

  const handleLogout = async () => {
    showLoader("Logging out...");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Logout failed", error);
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      removeToken();
      dispatch(logout());
      hideLoader();
      setTimeout(() => {
        router.replace("/login");
      }, 50);
    }
  };

  return (
    <>
      {collapsed && (
        <div
          className="lg:hidden fixed inset-0 z-[105] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => dispatch(collapseSidebar(false))}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-[110]
          flex flex-col h-full bg-black text-white border-r border-[#FFFFFF10] shadow-xl
          transition-[width,transform] duration-300 ease-in-out
          ${collapsed ? "w-[280px] translate-x-0 lg:w-[110px]" : "-translate-x-full lg:translate-x-0 lg:w-[260px]"}
        `}
      >
        <div className="lg:hidden absolute right-4 top-5 z-20">
          <button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
            onClick={() => dispatch(collapseSidebar(false))}
          >
            <X size={20} />
          </button>
        </div>


        <div className={`h-[88px] flex-shrink-0 flex items-center justify-center border-b border-[#FFFFFF10] transition-all duration-300 ${collapsed ? "px-0 lg:px-2" : "px-6"}`}>
          <div className="relative flex items-center justify-center">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              width={collapsed ? 130 : 130}
              height={50}
              className={`transition-all duration-300 object-contain ${collapsed ? "w-32 lg:w-[70px]" : "w-32"}`}
            />
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-2 overflow-y-auto px-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500">
            {sidebarItems.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </div>
        </nav>

        <div className="p-4 flex-shrink-0 border-t border-[#FFFFFF10]">
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center gap-3 relative overflow-hidden rounded-xl transition-all duration-200 
              ${collapsed ? "justify-center p-3" : "justify-center lg:justify-start px-4 py-3"}
              text-red-400 hover:bg-red-500/10 hover:text-red-300
            `}
          >
            <LogOut size={20} className="transition-transform duration-200 group-hover:-translate-x-0.5" />

            <span className={`font-medium tracking-wide text-sm transition-all duration-300 ${collapsed ? "lg:hidden inline-block" : "inline-block"}`}>
              Log Out
            </span>

            {collapsed && (
              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-gray-700">
                Log Out
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

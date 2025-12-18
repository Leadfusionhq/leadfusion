'use client';

import { ReactNode, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import MainPanel from '@/components/Layout/Dashboard/MainPanel/MainPanel';
import Sidebar from '@/components/Layout/Sidebar/Sidebar';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import { useLoader } from '@/context/LoaderContext';
import Breadcrumbs from '@/components/Breadcrumb/Breadcrumb';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { setUserId, connected } = useSocket();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [isLoggedIn, user, router, showLoader]);


  useEffect(() => {
    if (user && user._id) {
      console.log('Initializing socket for ADMIN:', user._id);
      setUserId(user._id);
    }
  }, [user, setUserId]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative transition-all duration-300">

        <div className="flex-shrink-0 z-20">
          <MainPanel />
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 scroll-smooth">
          <Breadcrumbs />
          <div className="min-h-[calc(100vh-140px)]">
            {children}
          </div>
          <div className="h-6"></div>
        </main>

        <FloatingChatWidget />

      </div>
    </div>
  );
}
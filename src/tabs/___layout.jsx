import React from 'react';
import { Outlet } from 'react-router-dom';
import CareConnect from '../component/img/CareConnectLogo.png';

function TabLayout() {
    return (
        <div className="relative h-screen">
            {/* Fixed logo top-left */}
            <img 
                src={CareConnect} 
                className="w-[280px] h-[200px] fixed top-0 left-0"
            />

            {/* Centered content */}
            <div className="flex h-screen items-center justify-center px-6 md:px-3">
                <div className="px-10 py-4 scrollbar-hidden rounded-xl bg-gradient-to-r from-[#143F81] to-[#2471E7] max-h-[80vh] max-w-[70vh] overflow-y-auto">
                    {/* Outlet will render Login or other nested routes */}
                    <Outlet />
                </div>

            </div>
        </div>
    );
}

export default TabLayout;

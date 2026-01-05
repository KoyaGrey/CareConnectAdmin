import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CareConnect from '../component/img/CareConnectLogo.png';

function AdminDashboard() {
  const [selectedNav, setSelectedNav] = useState('Dashboard');
  
  // Sample data - replace with actual data from your backend
  const caregivers = [
    { name: 'Sarah Johnson', email: 'sarah.j@careconnect', status: 'Active', lastActive: 'Just now' },
    { name: 'Michael Zaldivar', email: 'michael.z@careconnect.com', status: 'Active', lastActive: 'Just now' },
    { name: 'Ronald Mingoy', email: 'ronald.m@careconnect.com', status: 'Active', lastActive: 'Just now' },
    { name: 'Jacob Manuel', email: 'jacob.m@careconnect.com', status: 'Inactive', lastActive: '2 days ago' },
    { name: 'Robert Altares', email: 'robert.a@careconnect.com', status: 'Active', lastActive: 'Just now' },
    { name: 'Raymund Padon', email: 'raymund.p@careconnect.com', status: 'Active', lastActive: 'Just now' },
    { name: 'James Largo', email: 'james.l@careconnect.com', status: 'Active', lastActive: 'Just now' },
  ];

  const patients = [
    { name: 'Zaldy Largo', status: 'Active', lastActive: 'Just now' },
    { name: 'Clint Fundano', status: 'Active', lastActive: 'Just now' },
    { name: 'Regan Pria', status: 'Active', lastActive: 'Just now' },
    { name: 'Rennel Bontilao', status: 'Inactive', lastActive: '2 days ago' },
    { name: 'Renz Lapera', status: 'Active', lastActive: 'Just now' },
    { name: 'Eduard Dula', status: 'Active', lastActive: 'Just now' },
    { name: 'Daniel Gutierrez', status: 'Active', lastActive: 'Just now' },
  ];

  const navItems = [
    'Dashboard',
    'Caregivers',
    'Patients',
    'Settings',
    'Reports'
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Dark Blue */}
      <div className="w-64 bg-[#143F81] flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-800">
          <div className="mb-2">
            <span className="text-white font-semibold text-lg">CareConnect</span>
          </div>
          <p className="text-blue-200 text-xs">Welcome, Admin</p>
        </div>
        
{/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setSelectedNav('Dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
              selectedNav === 'Dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800'
            }`}
          >
            <span className="font-medium">Dashboard</span>
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <Link
            to="/caregivers"
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors text-blue-200 hover:bg-blue-800"
          >
            <span className="font-medium">Caregivers</span>
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Link>
          <button
            onClick={() => setSelectedNav('Patients')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
              selectedNav === 'Patients'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800'
            }`}
          >
            <span className="font-medium">Patients</span>
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <button
            onClick={() => setSelectedNav('Settings')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
              selectedNav === 'Settings'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800'
            }`}
          >
            <span className="font-medium">Settings</span>
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <button
            onClick={() => setSelectedNav('Reports')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
              selectedNav === 'Reports'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800'
            }`}
          >
            <span className="font-medium">Reports</span>
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </nav>

        {/* Newsletter/Subscribe Section */}
        <div className="p-4 border-t border-blue-800">
          <h3 className="text-white font-semibold text-sm mb-2">Subscribe to our newsletter</h3>
          <p className="text-blue-200 text-xs mb-4">Opt-in to receive updates and news about the system.</p>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 text-sm bg-blue-900 border border-blue-700 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
            Subscribe
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Overview</span>
          </div>

          {/* Right Side: Search and Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts"
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#143F81] focus:border-transparent w-64"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="w-10 h-10 bg-[#143F81] rounded-full flex items-center justify-center text-white font-bold">
              AD
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Caregivers Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium text-sm">Total Caregivers</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-900 text-2xl font-bold">10</p>
            </div>

            {/* Total Patients Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium text-sm">Total Patients</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-900 text-2xl font-bold">20</p>
            </div>

            {/* Active Today Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium text-sm">Active Today</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-900 text-2xl font-bold">20</p>
            </div>

            {/* System Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium text-sm">System Status</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-900 text-xl font-bold">Online</p>
            </div>
          </div>

          {/* Tables Section - Full Tables with All Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Caregiver Accounts Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#143F81] px-6 py-4">
                <h2 className="text-white font-bold text-lg">Caregiver Accounts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {caregivers.map((caregiver, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{caregiver.name}</div>
                          <div className="text-sm text-gray-500">{caregiver.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            caregiver.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {caregiver.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {caregiver.lastActive}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-red-600 hover:text-red-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Patient Accounts Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#143F81] px-6 py-4">
                <h2 className="text-white font-bold text-lg">Patient Accounts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            patient.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.lastActive}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-red-600 hover:text-red-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';

export default function StaffLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <StaffNavbar />
      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
}

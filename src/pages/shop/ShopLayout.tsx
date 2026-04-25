import React from 'react';
import { Outlet } from 'react-router-dom';
import ShopNavbar from '../../components/ShopNavbar';

export default function ShopLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar />
      <Outlet />
    </div>
  );
}

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { LoginPage } from '@/pages/LoginPage'
import { PinLoginPage } from '@/pages/PinLoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const Dashboard = lazy(() => import('@/modules/m01-dashboard'))
const Stock = lazy(() => import('@/modules/m02-stock'))
const Sales = lazy(() => import('@/modules/m03-sales'))
const Finance = lazy(() => import('@/modules/m04-finance'))
const Costs = lazy(() => import('@/modules/m05-cost-calculator'))
const Wastage = lazy(() => import('@/modules/m06-wastage'))
const Rota = lazy(() => import('@/modules/m07-rota'))
const FoodSafety = lazy(() => import('@/modules/m08-food-safety'))
const Menu = lazy(() => import('@/modules/m09-menu'))
const SOPs = lazy(() => import('@/modules/m10-sop'))
const Cash = lazy(() => import('@/modules/m11-cash'))
const Delivery = lazy(() => import('@/modules/m12-delivery'))
const Overhead = lazy(() => import('@/modules/m13-overhead'))
const Reporting = lazy(() => import('@/modules/m14-reporting'))
const SystemHub = lazy(() => import('@/modules/m15-system-hub'))
const Settings = lazy(() => import('@/modules/m16-settings'))
const Customers = lazy(() => import('@/modules/m17-customers'))
const Market = lazy(() => import('@/modules/m18-market'))
const Suppliers = lazy(() => import('@/modules/m19-suppliers'))
const Equipment = lazy(() => import('@/modules/m20-equipment'))
const Campaigns = lazy(() => import('@/modules/m21-campaigns'))
const Training = lazy(() => import('@/modules/m22-training'))
const Franchise = lazy(() => import('@/modules/m23-franchise'))
const Comms = lazy(() => import('@/modules/m24-comms'))
const Reports = lazy(() => import('@/modules/m25-reports'))

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ModuleLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pin" element={<PinLoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Wrap><Dashboard /></Wrap>} />

            <Route path="/stock" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Stock /></Wrap></RoleGuard>
            } />
            <Route path="/sales" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Sales /></Wrap></RoleGuard>
            } />
            <Route path="/finance" element={
              <RoleGuard allowedRoles={['owner']}><Wrap><Finance /></Wrap></RoleGuard>
            } />
            <Route path="/costs" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Costs /></Wrap></RoleGuard>
            } />
            <Route path="/waste" element={
              <RoleGuard allowedRoles={['owner', 'manager', 'staff']}><Wrap><Wastage /></Wrap></RoleGuard>
            } />
            <Route path="/rota" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Rota /></Wrap></RoleGuard>
            } />
            <Route path="/food-safety" element={
              <RoleGuard allowedRoles={['owner', 'manager', 'staff']}><Wrap><FoodSafety /></Wrap></RoleGuard>
            } />
            <Route path="/menu" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Menu /></Wrap></RoleGuard>
            } />
            <Route path="/sops" element={
              <RoleGuard allowedRoles={['owner', 'manager', 'staff']}><Wrap><SOPs /></Wrap></RoleGuard>
            } />
            <Route path="/cash" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Cash /></Wrap></RoleGuard>
            } />
            <Route path="/delivery" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Delivery /></Wrap></RoleGuard>
            } />
            <Route path="/overhead" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Overhead /></Wrap></RoleGuard>
            } />
            <Route path="/reporting" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Reporting /></Wrap></RoleGuard>
            } />
            <Route path="/hub" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><SystemHub /></Wrap></RoleGuard>
            } />
            <Route path="/settings" element={
              <RoleGuard allowedRoles={['owner']}><Wrap><Settings /></Wrap></RoleGuard>
            } />
            <Route path="/customers" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Customers /></Wrap></RoleGuard>
            } />
            <Route path="/market" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Market /></Wrap></RoleGuard>
            } />
            <Route path="/suppliers" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Suppliers /></Wrap></RoleGuard>
            } />
            <Route path="/equipment" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Equipment /></Wrap></RoleGuard>
            } />
            <Route path="/campaigns" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Campaigns /></Wrap></RoleGuard>
            } />
            <Route path="/training" element={
              <RoleGuard allowedRoles={['owner', 'manager', 'staff']}><Wrap><Training /></Wrap></RoleGuard>
            } />
            <Route path="/franchise" element={
              <RoleGuard allowedRoles={['owner']}><Wrap><Franchise /></Wrap></RoleGuard>
            } />
            <Route path="/comms" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Comms /></Wrap></RoleGuard>
            } />
            <Route path="/reports" element={
              <RoleGuard allowedRoles={['owner', 'manager']}><Wrap><Reports /></Wrap></RoleGuard>
            } />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

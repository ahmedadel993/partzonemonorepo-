import { createRouter, createRoute, createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/stores/useAuthStore";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated())
      throw redirect({ to: "/login" });
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const DashboardPage  = lazy(() => import("@/features/dashboard/components/DashboardStub"));
const LoginPage      = lazy(() => import("@/features/auth/components/LoginStub"));
const CatalogPage    = lazy(() => import("@/features/catalog/components/CatalogPage"));
const MarketingPage  = lazy(() => import("@/features/marketing/components/MarketingPage"));
const OrdersPage     = lazy(() => import("@/features/orders/components/OrdersStub"));
const UsersPage      = lazy(() => import("@/features/users/components/UsersStub"));
const SettingsPage   = lazy(() => import("@/features/settings/components/SettingsStub"));
const VendorsPage    = lazy(() => import("@/features/vendors/components/VendorsStub"));
const ErpPage        = lazy(() => import("@/features/erp/components/ErpStub"));

const wrap = (Component: React.LazyExoticComponent<() => JSX.Element>) => () => (
  <Suspense fallback={<div className="p-8 text-text-muted">Loading...</div>}>
    <Component />
  </Suspense>
);

const loginRoute    = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated())
      throw redirect({ to: "/" });
  },
  component: wrap(LoginPage),
});
const indexRoute    = createRoute({ getParentRoute: () => layoutRoute, path: "/",         component: wrap(DashboardPage) });
const catalogRoute  = createRoute({ getParentRoute: () => layoutRoute, path: "/catalog",  component: wrap(CatalogPage) });
const marketingRoute= createRoute({ getParentRoute: () => layoutRoute, path: "/marketing",component: wrap(MarketingPage) });
const ordersRoute   = createRoute({ getParentRoute: () => layoutRoute, path: "/orders",   component: wrap(OrdersPage) });
const usersRoute    = createRoute({ getParentRoute: () => layoutRoute, path: "/users",    component: wrap(UsersPage) });
const settingsRoute = createRoute({ getParentRoute: () => layoutRoute, path: "/settings", component: wrap(SettingsPage) });
const vendorsRoute  = createRoute({ getParentRoute: () => layoutRoute, path: "/vendors",  component: wrap(VendorsPage) });
const erpRoute      = createRoute({ getParentRoute: () => layoutRoute, path: "/erp",      component: wrap(ErpPage) });

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute, catalogRoute, marketingRoute, ordersRoute,
    usersRoute, settingsRoute, vendorsRoute, erpRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router; }
}

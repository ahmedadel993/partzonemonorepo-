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

const DashboardPage       = lazy(() => import("@/features/dashboard/components/DashboardStub"));
const LoginPage           = lazy(() => import("@/features/auth/components/LoginStub"));
const CatalogPage         = lazy(() => import("@/features/catalog/components/CatalogPage"));
const MarketingPage       = lazy(() => import("@/features/marketing/components/MarketingPage"));
const OrdersPage          = lazy(() => import("@/features/orders/components/OrdersStub"));
const UsersPage           = lazy(() => import("@/features/users/components/UsersPanel"));
const CustomersPage       = lazy(() => import("@/features/customers/components/CustomersPanel"));
const SettingsPage        = lazy(() => import("@/features/settings/components/SettingsStub"));
const VendorsPage         = lazy(() => import("@/features/vendors/components/VendorsPanel"));
const ErpPage             = lazy(() => import("@/features/erp/components/ErpStub"));
// Phase 4 – catalog detail pages
const ProductDetailPage        = lazy(() => import("@/features/catalog/components/ProductDetailPage"));
const CategoryDetailPage       = lazy(() => import("@/features/catalog/components/CategoryDetailPage"));
const BrandDetailPage          = lazy(() => import("@/features/catalog/components/BrandDetailPage"));
const VehicleMakeDetailPage    = lazy(() => import("@/features/catalog/components/VehicleMakeDetailPage"));
const VehicleModelDetailPage   = lazy(() => import("@/features/catalog/components/VehicleModelDetailPage"));

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
const indexRoute          = createRoute({ getParentRoute: () => layoutRoute, path: "/",         component: wrap(DashboardPage) });
const catalogRoute        = createRoute({ getParentRoute: () => layoutRoute, path: "/catalog",  component: wrap(CatalogPage) });
const marketingRoute      = createRoute({ getParentRoute: () => layoutRoute, path: "/marketing",component: wrap(MarketingPage) });
const ordersRoute         = createRoute({ getParentRoute: () => layoutRoute, path: "/orders",   component: wrap(OrdersPage) });
const usersRoute          = createRoute({ getParentRoute: () => layoutRoute, path: "/users",     component: wrap(UsersPage) });
const customersRoute      = createRoute({ getParentRoute: () => layoutRoute, path: "/customers", component: wrap(CustomersPage as React.LazyExoticComponent<() => JSX.Element>) });
const settingsRoute       = createRoute({ getParentRoute: () => layoutRoute, path: "/settings",  component: wrap(SettingsPage) });
const vendorsRoute        = createRoute({ getParentRoute: () => layoutRoute, path: "/vendors",   component: wrap(VendorsPage as React.LazyExoticComponent<() => JSX.Element>) });
const erpRoute            = createRoute({ getParentRoute: () => layoutRoute, path: "/erp",      component: wrap(ErpPage) });
// Phase 4 – catalog detail routes
const productDetailRoute       = createRoute({ getParentRoute: () => layoutRoute, path: "/catalog/products/$productId",   component: wrap(ProductDetailPage as React.LazyExoticComponent<() => JSX.Element>) });
const categoryDetailRoute      = createRoute({ getParentRoute: () => layoutRoute, path: "/catalog/categories/$categoryId", component: wrap(CategoryDetailPage as React.LazyExoticComponent<() => JSX.Element>) });
const brandDetailRoute         = createRoute({ getParentRoute: () => layoutRoute, path: "/catalog/brands/$brandId",       component: wrap(BrandDetailPage as React.LazyExoticComponent<() => JSX.Element>) });
const vehicleMakeDetailRoute   = createRoute({ getParentRoute: () => layoutRoute, path: "/catalog/makes/$makeId",         component: wrap(VehicleMakeDetailPage as React.LazyExoticComponent<() => JSX.Element>) });
const vehicleModelDetailRoute  = createRoute({ getParentRoute: () => layoutRoute, path: "/catalog/models/$modelId",       component: wrap(VehicleModelDetailPage as React.LazyExoticComponent<() => JSX.Element>) });

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute, catalogRoute, marketingRoute, ordersRoute,
    usersRoute, customersRoute, settingsRoute, vendorsRoute, erpRoute,
    productDetailRoute, categoryDetailRoute, brandDetailRoute,
    vehicleMakeDetailRoute, vehicleModelDetailRoute,
  ]),
]);

// The app is served under Vite's `base` ("/admin/"), so routes must be
// resolved relative to it — otherwise every page renders "Not Found".
export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
});

declare module "@tanstack/react-router" {
  interface Register { router: typeof router; }
}

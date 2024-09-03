import { Authenticated, Refine } from "@refinedev/core";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import authProvider from "./authProvider";
import supabaseClient from "./utility/supabaseClient";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import TaskList from "./components/TaskList";
import {
  AuthPage,
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";

import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppIcon } from "./components/app-icon";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";

import ClienteList from './components/ClienteList';
import ProductoForm from './components/ProductoForm';
import { ShoppingOutlined } from "@ant-design/icons";
import ProductoList from './components/ProductoList';
import { CalendarOutlined } from "@ant-design/icons";
import EventCalendar from './components/EventCalendar';

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider(supabaseClient)}
                liveProvider={liveProvider(supabaseClient)}
                authProvider={authProvider}
                routerProvider={routerBindings}
                notificationProvider={useNotificationProvider}
                resources={[
                  {
                    name: "clientes",
                    list: "/clientes",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "productos",
                    list: "/productos",
                    create: "/productos/crear",
                    meta: {
                      canDelete: true,
                      icon: <ShoppingOutlined />,
                    },
                  },
                  {
                    name: "calendario",
                    list: "/calendario",
                    meta: {
                      icon: <CalendarOutlined />,
                    },
                  },
                  {
                    name: "tareas",
                    list: "/tareas",
                    meta: {
                      icon: <CalendarOutlined />,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "jxCdv3-2C7w1m-e35SQK",
                  title: { text: "Refine Project", icon: <AppIcon /> },
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          Header={Header}
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="clientes" />}
                    />
                    <Route path="/clientes">
                      <Route index element={<ClienteList />} />
                    </Route>
                    <Route path="/productos/crear" element={<ProductoForm />} />
                    <Route path="/productos" element={<ProductoList />} />
                    <Route path="/calendario" element={<EventCalendar />} />
                    <Route path="/tareas" element={<TaskList />} />
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated fallback={<Outlet />} key="authenticated-outer">
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route
                      path="/login"
                      element={
                        <AuthPage
                          type="login"
                        />
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={<AuthPage type="forgotPassword" />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import { connectWS } from "./services/ws";
import { getAccessToken, clearAuth, fetchMe, type BrokerAccount } from "./services/auth";
import AccountSwitcher from "./components/auth/AccountSwitcher";
import type { Route } from "./+types/root";
import "./app.css";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ShieldAlert,
  Terminal,
  PieChart,
  User,
  Keyboard,
  BrainCircuit,
  Workflow,
  CalendarDays,
  Gem,
  LogOut,
} from "lucide-react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href:
      "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-950 text-gray-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const PUBLIC_PATHS = ["/login", "/register"];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [activeAccount, setActiveAccount] = useState<BrokerAccount | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchMe()
        .then((state) => {
          setDisplayName(state.user?.display_name || "");
          setActiveAccount(state.active_account);
          setAuthenticated(true);
        })
        .catch(() => {
          clearAuth();
          setAuthenticated(false);
        });
    } else {
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated === false && !PUBLIC_PATHS.includes(location.pathname)) {
      navigate("/login");
    }
  }, [authenticated, location.pathname, navigate]);

  useEffect(() => {
    if (authenticated) {
      connectWS();
    }
  }, [authenticated]);

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authenticated) {
    return <Outlet />;
  }

  return (
    <AuthenticatedApp
      displayName={displayName}
      activeAccount={activeAccount}
      onAccountSwitch={setActiveAccount}
    />
  );
}

function AuthenticatedApp({ displayName, activeAccount, onAccountSwitch }: {
  displayName: string;
  activeAccount: BrokerAccount | null;
  onAccountSwitch: (acc: BrokerAccount) => void;
}) {
  const location = useLocation();

  const nav = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Calendar", path: "/calendar", icon: CalendarDays },
    { name: "Trading Panel", path: "/trade-panel", icon: Keyboard },
    { name: "Journal", path: "/journal", icon: BookOpen },
    { name: "Risk", path: "/risk", icon: ShieldAlert },
    { name: "Review", path: "/review", icon: PieChart },
    { name: "AI Management", path: "/ai-management", icon: BrainCircuit },
    { name: "Strategy Management", path: "/strategy-management", icon: Workflow },
    { name: "Logs", path: "/logs", icon: Terminal },
    { name: "Account", path: "/account", icon: User },
  ];

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Gem className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
            The Wealth
          </h1>
        </div>

        <nav className="space-y-1 flex-1">
          {nav.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-blue-400" : "text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 pt-4 px-2 space-y-3">
          <AccountSwitcher
            activeAccount={activeAccount}
            onSwitch={onAccountSwitch}
          />
          <div className="text-sm text-gray-400 truncate">
            {displayName || "User"}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

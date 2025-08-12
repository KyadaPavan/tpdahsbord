import {
  Home as HomeIcon,
  Search,
  User as UserIcon,
  FileText,
  Menu,
  LogOutIcon,
  Banknote,
  History,
} from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  // Sidebar links - dynamically build based on user role
  const links = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Query", path: "/query", icon: Search },
    { name: "User", path: "/user", icon: UserIcon },
    { name: "Contract", path: "/contract", icon: FileText },
  ];

  // Add admin-only links
  if (user?.role === "admin") {
    links.push(
      {
        name: "Payout",
        path: "/admin-payout",
        icon: Banknote,
      },
      {
        name: "Activity Log",
        path: "/activity-log",
        icon: History,
      }
    );
  }

  // Debounce function to delay API calls
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (val) => {
      // Only search if query is at least 6 characters long
      if (val.length < 6) {
        setSuggestions([]);
        return;
      }

      if (location.pathname === "/user") {
        try {
          const res = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/users/search?query=${encodeURIComponent(val)}`,
            { credentials: "include" }
          );
          if (res.status === 401) return navigate("/login");

          if (res.status === 400) {
            setSuggestions([]);
            return;
          }

          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        } catch {
          setSuggestions([]);
        }
      } else if (location.pathname === "/contract" && val.length > 1) {
        setSuggestions([{ contract_id: val.toUpperCase() }]);
      } else {
        setSuggestions([]);
      }
    }, 500),
    [location.pathname, navigate]
  );

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleNavigation = (path) => navigate(path);

  const handleSearch = async (e, customTerm) => {
    if (e) e.preventDefault();
    const term = (customTerm ?? searchTerm) || "";
    if (!term.trim()) return;

    // For user search, enforce minimum 6 characters
    if (location.pathname === "/user" && term.length < 6) {
      navigate("/user", {
        state: {
          users: [],
          searchTerm: term,
          error: "Please enter at least 6 characters for user search",
        },
      });
      return;
    }

    setSearchLoading(true);
    setSuggestions([]);

    try {
      if (location.pathname === "/user") {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/users/search?query=${encodeURIComponent(term)}`,
          { credentials: "include" }
        );
        if (res.status === 401) return navigate("/login");

        if (res.status === 400) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Invalid search query");
        }

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response");
        navigate("/user", { state: { users: data, searchTerm: term } });
      } else if (location.pathname === "/admin-payout") {
        // For admin payout, just navigate and pass contractId in state
        const contractId = term.toUpperCase();
        navigate("/admin-payout", {
          state: { contractId },
        });
      } else {
        // Always handle contract search regardless of current pathname
        const contractId = term.toUpperCase();
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/contracts/${encodeURIComponent(
            contractId
          )}`,
          { credentials: "include" }
        );
        if (res.status === 401) return navigate("/login");
        if (!res.ok) throw new Error("Not found");
        const contract = await res.json();
        sessionStorage.setItem("contractSearch", contractId);
        navigate("/contract", {
          state: { contract, searchTerm: contractId },
        });
      }
    } catch (err) {
      if (location.pathname === "/user") {
        navigate("/user", {
          state: { users: [], searchTerm: term, error: err.message },
        });
      } else if (location.pathname === "/admin-payout") {
        navigate("/admin-payout", {
          state: { contractId: term.toUpperCase(), error: err.message },
        });
      } else {
        navigate("/contract", {
          state: { contract: null, searchTerm: term, error: err.message },
        });
      }
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ──────── HEADER ──────── */}
      <header className="z-50 flex items-center justify-between w-full px-6 py-4 bg-white/60 backdrop-blur-xl">
        <div className="flex items-center gap-16">
          <img src="./tp.svg" alt="Logo" width={150} />
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-[#3b158a] bg-[#ede7f6] text-[#3b158a] hover:text-[#ede7f6] rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* ───── SEARCH ───── */}
          {(location.pathname === "/user" ||
            location.pathname === "/contract" ||
            location.pathname === "/admin-payout") && (
            <div className="relative hidden sm:block w-96">
              <form
                onSubmit={(e) => {
                  if (highlightedIndex >= 0 && suggestions.length > 0) {
                    e.preventDefault();
                    const s = suggestions[highlightedIndex];
                    setSearchTerm(s.username || s.user_id);
                    setSuggestions([]);
                    handleSearch(null, s.user_id);
                  } else {
                    handleSearch(e);
                  }
                }}
                autoComplete="off"
              >
                <input
                  type="text"
                  placeholder={
                    location.pathname === "/user"
                      ? "Search by User ID or Phone Number (min 6 chars)..."
                      : "Search by Contract ID..."
                  }
                  className="py-4 pl-4 pr-10 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#ede7f6] shadow-sm"
                  value={searchTerm}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    setHighlightedIndex(-1);

                    // Use debounced search function
                    debouncedSearch(val);
                  }}
                  onKeyDown={(e) => {
                    if (suggestions.length > 0) {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev < suggestions.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev > 0 ? prev - 1 : suggestions.length - 1
                        );
                      } else if (e.key === "Escape") {
                        setSuggestions([]);
                        setHighlightedIndex(-1);
                      }
                    }
                  }}
                />

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3b158a] hover:text-[#3b158a] p-1"
                  disabled={searchLoading}
                  style={{ background: "none", border: "none" }}
                >
                  {searchLoading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-[#3b158a] border-t-transparent rounded-full"></span>
                  ) : (
                    <Search size={20} />
                  )}
                </button>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
                    {location.pathname === "/user"
                      ? suggestions.map((s, i) => (
                          <div
                            key={s.user_id || i}
                            className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                              i === highlightedIndex
                                ? "bg-[#ede7f6] text-[#3b158a]"
                                : "hover:bg-[#ede7f6]"
                            }`}
                            onMouseDown={() => {
                              setSearchTerm(s.username || s.user_id);
                              setSuggestions([]);
                              handleSearch(null, s.user_id);
                            }}
                            onMouseEnter={() => setHighlightedIndex(i)}
                          >
                            <span className="font-semibold text-[#3b158a]">
                              {s.username}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({s.user_id})
                            </span>
                          </div>
                        ))
                      : suggestions.map((s, i) => (
                          <div
                            key={s.contract_id || i}
                            className={`px-4 py-2 cursor-pointer ${
                              i === highlightedIndex
                                ? "bg-[#ede7f6] text-[#3b158a]"
                                : "hover:bg-[#ede7f6]"
                            }`}
                            onMouseDown={() => {
                              setSearchTerm(s.contract_id);
                              setSuggestions([]);
                              handleSearch(null, s.contract_id);
                            }}
                            onMouseEnter={() => setHighlightedIndex(i)}
                          >
                            <span className="font-semibold text-[#3b158a]">
                              {s.contract_id}
                            </span>
                          </div>
                        ))}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ───── USER ROLE ───── */}

          <div className="flex items-center w-48 gap-4 px-3 py-2 transition-shadow duration-300 bg-white shadow-md rounded-2xl hover:shadow-lg">
            {/* Avatar Circle */}
            <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-white rounded-full shadow-inner bg-gradient-to-br from-[#3b158a] to-[#7c3aed]">
              {user?.email ? user.email[0].toUpperCase() : "?"}
            </div>

            {/* Name and Role */}
            <div className="flex flex-col leading-tight">
              <span className="text-[16px] font-semibold text-gray-800 capitalize tracking-tight">
                {user?.email
                  ? user.email
                      .split("@")[0]
                      .toLowerCase()
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Unknown"}
              </span>
              <span className="text-sm font-medium text-[#3b158a]  py-0.5 rounded-full w-max capitalize">
                {user?.role || "User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ───── SIDEBAR + MAIN ───── */}
      <div className="flex flex-1 overflow-hidden rounded-t-2xl">
        <motion.aside
          initial={false}
          animate={{ width: isSidebarCollapsed ? 100 : 240 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full bg-white/80 backdrop-blur-xl"
        >
          <nav className="flex-1 px-2 py-4 space-y-2 ">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <motion.button
                  key={link.name}
                  onClick={() => handleNavigation(link.path)}
                  className={`group relative w-full flex items-center rounded-xl ${
                    isActive
                      ? "bg-[#EDE7F6] text-[#3b158a] font-medium"
                      : "text-gray-600"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`flex items-center w-full ${
                      isSidebarCollapsed ? "justify-center py-3" : "px-4 py-3"
                    }`}
                  >
                    <Icon size={20} />
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 "
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </div>
                  {isSidebarCollapsed && (
                    <span className="absolute left-full top-1/2 -translate-y-1/2 hidden lg:block px-6 py-2 text-base font-medium text-[#3b158a] bg-[#EDE7F6] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto whitespace-nowrap group-hover:z-50 z-50">
                      {link.name}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-start w-full pr-4 text-red-600 group hover:text-red-700 rounded-xl"
          >
            <div
              className={`flex items-center w-fit  justify-start ${
                isSidebarCollapsed ? "justify-center py-3" : "px-4 py-3"
              }`}
            >
              <LogOutIcon size={20} />
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3"
                >
                  Logout
                </motion.span>
              )}
            </div>

            {isSidebarCollapsed && (
              <span className="absolute hidden px-6 py-2 text-base font-medium text-red-600 -translate-y-1/2 bg-red-100 shadow-lg opacity-0 pointer-events-none left-full top-1/2 lg:block rounded-xl group-hover:opacity-100 group-hover:pointer-events-auto whitespace-nowrap">
                Logout
              </span>
            )}
          </motion.button>
        </motion.aside>

        {/* ───── MAIN CONTENT ───── */}
        <main className="flex-1 overflow-y-auto md:pr-8 rounded-t-2xl">
          <div className="w-full h-full bg-gray-100/80 rounded-t-2xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Outlet context={{ user }} />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, User, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 w-full border-b border-base-300 bg-base-100/95 backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-base-200"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:size-10">
              <MessageSquare className="size-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-base-content sm:text-xl">
              Murmur
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {authUser && (
            <div
              className="relative ml-2 border-l border-base-300 pl-3 sm:ml-4 sm:pl-4"
              ref={menuRef}
            >
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-base-200 sm:gap-3 sm:px-3 sm:py-2"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div className="size-8 overflow-hidden rounded-full border-2 border-primary/20">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt={authUser.fullName}
                    className="size-full object-cover"
                  />
                </div>
                <span className="hidden max-w-[120px] truncate font-medium sm:block">
                  {authUser.fullName}
                </span>
                <ChevronDown
                  className={`size-4 text-base-content/60 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-base-300 bg-base-100 py-1 shadow-lg">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors duration-200 hover:bg-base-200"
                  >
                    <User className="size-4 text-primary" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-error transition-colors duration-200 hover:bg-error/10"
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;

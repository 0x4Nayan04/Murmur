import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                Murmur
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {authUser && (
              <>
                <Link
                  to={"/profile"}
                  className="btn btn-sm btn-ghost hover:bg-base-200 rounded-full px-3 transition-all duration-300 flex items-center gap-2"
                  aria-label="Profile">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline font-medium">
                    My Profile
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-sm btn-ghost hover:bg-error/10 rounded-full px-3 transition-all duration-300 flex items-center gap-2"
                  aria-label="Logout">
                  <div className="size-8 rounded-full bg-error/10 flex items-center justify-center">
                    <LogOut className="size-4 text-error" />
                  </div>
                  <span className="hidden sm:inline font-medium text-error">
                    Sign Out
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;

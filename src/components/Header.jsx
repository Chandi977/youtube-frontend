import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Video,
  Bell,
  LogOut,
  History,
  ThumbsUp,
  ListVideo,
  LayoutDashboard,
  User,
  Youtube,
  Radio,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { secureUrl } from "../lib/utils";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, isLoggedIn, handleLogout: contextLogout } = useUser();

  const handleLogout = async () => {
    await contextLogout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/results?search_query=${searchQuery.trim()}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center px-4 h-14 bg-[#0f0f0f] border-b border-gray-800 sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-1 cursor-pointer">
          <Youtube color="#FF0000" size={24} />
          <span className="text-lg sm:text-xl font-semibold tracking-tighter">
            VideStream
          </span>
        </Link>
      </div>

      {/* Center Section */}
      <div className="hidden sm:flex flex-1 justify-center px-4 lg:px-16">
        <form onSubmit={handleSearch} className="w-full max-w-2xl flex">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#121212] border border-gray-700 rounded-l-full px-4 py-2 focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-gray-800 border border-gray-700 border-l-0 rounded-r-full px-6 hover:bg-gray-700"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search Icon for mobile */}
        <button
          aria-label="Search"
          className="sm:hidden p-2 rounded-full hover:bg-gray-800"
          onClick={() => navigate("/results")}
        >
          <Search size={22} />
        </button>
        <Link to="/upload">
          <button
            aria-label="Upload video"
            className="p-2 rounded-full hover:bg-gray-800"
          >
            <Video size={22} />
          </button>
        </Link>
        <button
          aria-label="Notifications"
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <Bell size={22} />
        </button>
        {isLoggedIn && user ? (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img
                src={secureUrl(user.avatar)}
                alt={user.username}
                className="w-8 h-8 rounded-full cursor-pointer"
              />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
                <Link
                  to={`/channel/${user.username}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} /> Your Channel
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link
                  to="/library"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ListVideo size={18} /> Library
                </Link>
                <Link
                  to="/liked-videos"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ThumbsUp size={18} /> Liked Videos
                </Link>
                <Link
                  to="/history"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <History size={18} /> History
                </Link>
                <Link
                  to="/go-live"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Radio size={18} /> Go Live
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button className="flex items-center gap-2 border border-gray-700 sm:px-3 px-2 py-1.5 rounded-full text-blue-400 hover:bg-blue-900/50">
              <User size={18} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

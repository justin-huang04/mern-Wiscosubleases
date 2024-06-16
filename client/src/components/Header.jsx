import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    <header className="bg-red-800 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <div className="header">
          <Link to="/" className="flex items-center">
            <img src="logo.jpg" alt="Logo" className="h-10 mr-2" />{" "}
            {/* Update the path to the image */}
            <h1 className="font-bold text-lg sm:text-xl flex flex-wrap">
              <span className="text-white">Wisco</span>
              <span className="text-red-200">Subleases</span>
            </h1>
          </Link>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-red-700 p-3 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-red-700 focus:outline-none w-24 sm:w-64 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-white" />
          </button>
        </form>
        <ul className="flex gap-4 items-center">
          <Link to="/" className="flex items-center text-white hover:underline">
            <FaHome className="text-lg" />
            <li
              className="hidden sm:inline ml-1"
              style={{ fontFamily: "Verdana" }}
            >
              Home
            </li>
          </Link>
          <Link
            to="/about"
            className="flex items-center text-white hover:underline"
          >
            <li
              className="hidden sm:inline ml-1"
              style={{ fontFamily: "Verdana" }}
            >
              About
            </li>
          </Link>
          <Link to="/profile" className="flex items-center">
            {currentUser ? (
              <img
                className="rounded-full h-7 w-7 object-cover"
                src={currentUser.avatar}
                alt="profile"
              />
            ) : (
              <li
                className="text-white hover:underline"
                style={{ fontFamily: "Verdana" }}
              >
                Sign in
              </li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}

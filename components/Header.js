import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

const Header = () => {
  const [name, setName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State to track menu open/closed

  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("user");
    if (storedName) {
      setName(storedName);
    } else {
      setName(false);
    }
  });

  const logout = () => {
    localStorage.clear();
    setName(false);
    router.push("/");
  };

  function handleLogout() {
    if (router.pathname == "/") {
      Swal.fire({
        title: "Are you sure?",
        text: "Please make sure you have saved your work before you logout!",
        icon: "warning",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Okay! Logout",

        cancelButtonText: "No! I want to save",
      }).then((result) => {
        if (result.isConfirmed) {
          // Custom function for Save button
          logout();
        } else {
          // Custom function for Cancel button
        }
      });
    } else {
      logout();
    }
  }

  function handleLogoRedirect() {
    if (router.pathname == "/") {
      Swal.fire({
        title: "Are you sure?",
        text: "Please make sure you have saved your work before go to homepage!",
        icon: "warning",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Okay! Go to Homepage",

        cancelButtonText: "No! I want to save",
      }).then((result) => {
        if (result.isConfirmed) {
          // Custom function for Save button
          router.push("/question-bank");
        } else {
          // Custom function for Cancel button
        }
      });
    } else {
      router.push("/question-bank");
    }
  }

  const handleLinkClick = () => {
    // Close the menu when a link is clicked
    setMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navigationbar ">
      <div className="container-fluid">
        <div className="navbarsec1">
          {/* <img className="homeimg" src="/bulb.gif" alt="" /> */}

          <img
            className="logotext"
            src="/Snapz-logo.jpg"
            alt="quiz print logo"
            onClick={handleLogoRedirect}
          />
        </div>

        <div className="navbarsec2">
          {name ? (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* <li className="nav-item custom-list">
                  <Link
                    className="nav-link actuallink"
                    href="/"
                    onClick={handleLinkClick} // Close the menu when link is clicked
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item custom-list">
                  <Link
                    className="nav-link actuallink"
                    href="/QuestionBank"
                    onClick={handleLinkClick} // Close the menu when link is clicked
                  >
                    QuesBank
                  </Link>
                </li>
                <li className="nav-item custom-list">
                  <Link
                    className="nav-link actuallink"
                    href="/MyQuiz"
                    onClick={handleLinkClick} // Close the menu when link is clicked
                  >
                    MyQuiz
                  </Link>
                </li> */}
              {name && (
                <li className="nambtn">
                  <span className="nav-item username">{name}</span>
                  <span className="nav-item">
                    <button className="logout" onClick={handleLogout}>
                      LogOut
                    </button>
                  </span>
                </li>
              )}
            </ul>
          ) : null}
          {/* <button
            id="navbar-toggler"
            className="navbar-toggler"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)} // Toggle menu state
            aria-expanded={menuOpen ? "true" : "false"} // Set aria-expanded based on state
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
            id="navbarSupportedContent"
          >
            
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Header;

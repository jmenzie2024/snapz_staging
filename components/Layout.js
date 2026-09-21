import { useRouter } from "next/router";
import { useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  const router = useRouter();

  const handleSkipToMain = () => {
    const mainContent = document.getElementById("main-content");

    if (mainContent) {
      mainContent.focus();
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Changed to sessionStorage
    if (!token) {
      sessionStorage.clear();
      router.push("/");
    }
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={handleSkipToMain}>
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="app-main" tabIndex="-1">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;

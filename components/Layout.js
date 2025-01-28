import { useRouter } from "next/router";
import { useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";


const Layout = ({ children }) => {

  const router = useRouter();
  var token;  

  useEffect(() => {   
    token = localStorage.getItem("token");    
    if (!token) {     
      localStorage.clear();
      router.push("/");
    } 
  }, []);

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default Layout;

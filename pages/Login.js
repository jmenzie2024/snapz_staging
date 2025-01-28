import styles from "../styles/login.module.css";
import LoadingOverlay from "react-loading-overlay";
import MoonLoader from "react-spinners/MoonLoader";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
const Login = () => {
  const [email, setemail] = useState("");
  const [pass, setpass] = useState("");
  const [isActive, setisActive] = useState(false);
  const router = useRouter();

  const notify = (data) => {
    toast.success(data, { bodyClassName: "custom-toast-body" });
  };
  const warn = (data) => {
    toast.warning(data, { bodyClassName: "custom-toast-body" });
  };
  const error = (data) => {
    toast.error(data, { bodyClassName: "custom-toast-body" });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/question-bank");
    }
  }, []);

  // const handleLogin = async (event) => {
  //   event.preventDefault();
  //   if (email != "" && pass != "") {
  //     setisActive(true);

  //     try {
  //       const data = await fetch(
  //         `https://backend-c3b8.onrender.com/api/login`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ Email: email, Pass: pass }),
  //         }
  //       );
  //       const res = await data.json();
  //       console.log(res);
  //       if (res.success == "success") {
  //         notify("Login successful");
  //         localStorage.setItem("user", res.username);
  //         localStorage.setItem("token", res.token);
  //         router.push("/question-bank");
  //       } else if (res.success == "false") {
  //         warn("wrong username or password");
  //       } else if (res.success == "error") {
  //         warn("something went wrong");
  //       } else if (res.status === 429) {
  //         warn("You have made too many requests.");
  //       } else {
  //         warn("cant login now.");
  //       }

  //       setisActive(false);
  //     } catch (err) {
  //       console.log(err);
  //       setisActive(false);
  //     }
  //   } else {
  //     warn("Please fill all fields");
  //   }
  // };
  // const handleLogin = async (event) => {
  //   event.preventDefault();
  //   if (email != "" && pass != "") {
  //     setisActive(true);

  //     try {
  //       const data = await fetch(
  //         `https://backend-c3b8.onrender.com/api/login`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ Email: email, Pass: pass }),
  //         }
  //       );
  //       const res = await data.json();
  //       console.log(res);
  //       if (res.success == "success") {
  //         notify("Login successful");
  //         localStorage.setItem("user", res.username);
  //         localStorage.setItem("token", res.token);
  //         router.push("/question-bank");
  //       } else if (res.success == "false") {
  //         warn("wrong username or password");
  //       } else if (res.success == "error") {
  //         warn("something went wrong");
  //       } else if (res.status === 429) {
  //         warn("You have made too many requests.");
  //       } else {
  //         warn("cant login now.");
  //       }

  //       setisActive(false);
  //     } catch (err) {
  //       console.log(err);
  //       setisActive(false);
  //     }
  //   } else {
  //     warn("Please fill all fields");
  //   }
  // }
  const handleLogin = async (event) => {
    event.preventDefault();
    if (email != "" && pass != "") {
      setisActive(true);

      try {
        const data = await fetch(
          `https://snapz.com/wp-json/snapz/check-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              password: pass,
              product_id: "13350",
            }),
          }
        );
        const res = await data.json();
       
        if (res.active == true) {
          generateAuthToken();
        } else {
          error("wrong username or password");
        }

        setisActive(false);
      } catch (err) {
        console.log(err);
        setisActive(false);
      }
    } else {
      warn("Please fill all fields");
    }
  };

  async function generateAuthToken() {
    try {
      setisActive(true);
      //const data1 = await fetch(`https://backend-c3b8.onrender.com/api/login`, {
      const data1 = await fetch( process.env.API_URL+`api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Pass: pass,
        }),
      });
      const res1 = await data1.json();
      setisActive(false);
      if (res1.success == "success") {
        // notify("Login successful");
        localStorage.setItem("user", res1.username);
        localStorage.setItem("token", res1.token);
        router.push("/question-bank");
      } else if (res1.success == "false") {
        error("wrong username or password");
      } else if (res1.success == "error") {
        error("something went wrong");
      } else if (res1.status === 429) {
        warn("You have made too many requests.");
      } else {
        error("cant login now.");
      }
    } catch (err) {
      console.log(err);
      setisActive(false);
    }
  }

  const overLayFun = () => {
   
    return <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10000}} className="loader" >
      <MoonLoader color="#fff" />
    </div>
  }
  return (
    <>
      <LoadingOverlay
        active={isActive}
        text={overLayFun()}
      >
        <div className={styles.form}>
          <form className={styles.formIn}>
            <img
              className={styles.snapzLogo}
              src="/Snapz-logo.jpg"
              alt="snapz logo"
            />
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Username
              </label>
              <input
                type="email"
                className="form-control"
                id="exampleFormControlInput1"
                placeholder="username"
                onChange={(e) => setemail(e.target.value)}
              />
            </div>
            <>
              <div>
                <label htmlFor="inputPassword5" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="inputPassword5"
                  className="form-control"
                  placeholder="password"
                  aria-describedby="passwordHelpBlock"
                  onChange={(e) => setpass(e.target.value)}
                />
              </div>
            </>
            <div className={styles.forget}>
              {/* <a
                onClick={() =>
                  notify("Please recover your password on snapz.com")
                }
              >
                Forgot password ?
              </a> */}
              <p>
                <Link href="https://snapz.com/login-member/?action=forgot_password">
                Forgot Password
                </Link>

              </p>
            </div>
            <div className={styles.buttonGrp}>
              <button
                id={styles.loginButton}
                className="btn mx-2"
                onClick={handleLogin}
              >
                Login
              </button>
              <button className="btn btn-secondary mx-2" type="reset">
                Clear
              </button>
            </div>
          </form>
        </div>
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          transition={Slide}
        />
      </LoadingOverlay>
    </>
  );
};

export default Login;

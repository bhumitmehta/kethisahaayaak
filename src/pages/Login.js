import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

//Components
import InputField from "../components/input/InputField";
import Loader from "../components/loader/";

//Functions
import { SuccessMsg, ErrorMsg } from "../components/alerts";
import {
  postLoginDataEmail,
  postLoginDataPhone,
  verifyOtpLogin
} from "../api/authAPI";
import {
  getLoginAction,
  getSaveTokenAction,
  getSaveProfileAction
} from "../redux/actions";

//Images
import logo from "../img/logo.png";
import cross_black from "../img/cross_black.svg";

const Login = ({ onClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [data, setData] = useState();
  const [OTP, setOTP] = useState("");
  const [success2, setSuccess2] = useState(false);
  const [error, setError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function Login(e) {
    //request to server
    e.preventDefault();
    setLoading(true);
    try {
      console.log("login")
      const data2 = await postLoginDataEmail({ email, password });
      console.log(data2)
      if (data2) {
       
        setLoading(false);
        setSuccess(true);
        setMessage(data2.message);
        saveData(data2);
      }
      return;
    } catch (err) {
      setSuccess(false);
      setLoading(false);
      setMessage("Server Issue, Try again later");
      console.log(err);
    }
  }

  async function handleLoginPhone() {
    //request to server
    // e.preventDefault();
    setShowOTP(true);
    try {
      const data = await postLoginDataPhone({ phone_number: phone_number });
      if (data.success) {
        setData(data);
        setShowOTP(true);
      }
    } catch (err) {
      setSuccess(false);
      setLoading(false);
      setMessage("Server Issue, Try again later");
      console.log(err);
    }
  }

  async function verify(e) {
    e.preventDefault();
    try {
      const data2 = await verifyOtpLogin({
        phone_number: phone_number,
        otp: OTP
      });
      if (data2.success) {
        saveData(data2);
        setSuccess2(true);
        setLoading(false);
        navigate("/");
      } else {
        setOTP("");
        setError(true);
      }
      console.log(data);
    } catch (err) {}
  }


  async function saveData(data) {
    setSuccess(data.success);
    setMessage(data.message);
    localStorage.setItem("isLoggedIn", true);
  
    // Ensure tokens are defined before setting cookies
    if (data && data.token) {
      Cookies.set("access-token", data.token, {
        path: "/",
        expires: new Date().setDate(new Date().getDate() + 1)
      });
      Cookies.set("refresh-token", data.token, {
        path: "/",
        expires: new Date().setDate(new Date().getDate() + 1)
      });
    } else {
      console.error("Tokens not found in response data.");
      setMessage("Login failed: Tokens missing from response.");
      return;
    }
  
    Cookies.set("uuid", data.uid, {
      path: "/",
      expires: new Date().setDate(new Date().getDate() + 1)
    });
    Cookies.set("user",JSON.stringify(data));
    console.log(Cookies.get("user"));
  
    dispatch(getLoginAction());
    dispatch(
      getSaveTokenAction({
        accessToken: data.token,
        refreshToken: data.token
      })
    );
    dispatch(getSaveProfileAction(data));
    setLoading(false);
    navigate("/");
  }
  
  const commonButtonStyles = {
    padding: "12px 24px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "#219653",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
  };

  const inputStyles = {
    padding: "10px 30px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "16px",
    fontSize: "14px",
  };

  return (
    <div style={{ position: "fixed", top: 0,right:0, width: "100%", zIndex: 50, backgroundColor: "#219653", opacity:0.95}}>
      <div style={{ position: "absolute", top: "10px", right: "100px" }}>
        <img
          src={cross_black}
          alt="Close"
          style={{
            cursor: "pointer",
            backgroundColor: "#E5E5E5",
            borderRadius: "50%",
            padding: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            transition: "opacity 0.3s ease",
          }}
          onClick={() => onClick(false)}
        />
      </div>
      {loading && <Loader />}

      {/* VERIFY OTP SCREEN */}
      <div
        style={{
          transition: "opacity 0.5s, transform 0.5s",
          display: showOTP ? "block" : "none",
          transform: showOTP ? "translateX(0)" : "translateX(-100%)",
          opacity: showOTP ? 1 : 0,
        }}
      >
        <div style={{ backgroundColor: "#219653", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"  }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "20px", width: "400px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
            <form onSubmit={verify} style={{ display: "flex", flexDirection: "column", position: "relative" ,paddingTop:"10px"}}>
              <div style={{ position: "absolute", top: "0px", left: "50%", transform: "translateX(-50%)" }}>
                {/* <img src={logo} alt="logo" style={{  height: "96px", width: "96px", filter: "drop-shadow(0px 4px 4px rgba(104, 172, 93, 0.25))" }} /> */}
              </div>
              <h1 style={{ marginTop: "80px", marginBottom: "30px",marginTop:0, textAlign: "center", fontWeight: "500", fontSize: "18px" }}>
                Enter the OTP sent to your Registered Number
              </h1>
              <input
                placeholder="OTP"
                value={OTP}
                onChange={(e) => setOTP(e.target.value)}
                type="text"
                required={true}
                style={inputStyles}
              />
              <button style={{ ...commonButtonStyles, margin: "0 auto", display: "block", width: "150px" }} type="submit">
                Verify OTP
              </button>
              {success2 && <p style={{ textAlign: "center", color: "green" }}>OTP verified successfully!</p>}
              {error && <p style={{ textAlign: "center", color: "red" }}>Wrong OTP, please try again!</p>}
            </form>
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              Didn't receive OTP? <span style={{ color: "#1e90ff", textDecoration: "underline", cursor: "pointer" }}>Resend</span>
            </p>
          </div>
        </div>
      </div>

      {/* LOGIN DETAIL SCREEN */}
      <div style={{ filter: loading ? "blur(4px)" : "none", display: showOTP ? "none" : "block" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
          <div style={{ backgroundColor: "#219653", borderRadius: "16px", padding: "60px 20px", width: "60%" }}>
            <form
              onSubmit={Login}
              style={{
                backgroundColor: "#fff",
                borderRadius: "24px",
                padding: "40px",
                width: "70%",
                margin: "0 auto",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
                          <div style={{ position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)" }}>
              <img 
                src={logo} 
                alt="logo" 
                style={{ height: "96px", width: "96px", filter: "drop-shadow(0px 4px 4px rgba(104, 172, 93, 0.25))" }} 
              />
            </div>

              <h1 style={{ marginTop: "60px", fontWeight: "700", fontSize: "24px" }}>Login Here</h1>
              {success && <p style={{ color: "green" }}>{message}</p>}
              {error && <p style={{ color: "red" }}>{message}</p>}
              <p style={{ marginBottom: "20px", fontSize: "16px" }}>Login Using Email</p>
              <span><input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                style={inputStyles}
              /></span>
             <div> <input
                placeholder="Password*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                style={inputStyles}
              /></div>
              <button style={commonButtonStyles} type="submit">
                Login
              </button>
              <div style={{ position: "relative", marginTop: "30px", marginBottom: "20px", borderTop: "1px solid #4F4F4F", paddingTop: "20px" }}>
                <h1
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#fff",
                    padding: "5px 15px",
                    borderRadius: "50%",
                    boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
                  }}
                >
                  OR
                </h1>
              </div>
              <p style={{ marginBottom: "20px", fontSize: "16px" }}>Login Using Mobile No.</p>
              <input
                placeholder="Mobile No."
                value={phone_number}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="text"
                style={inputStyles}
              />
              <button
                style={{ ...commonButtonStyles, margin: "20px 0" }}
                onClick={() => handleLoginPhone()}
              >
                Login with OTP
              </button>
              <p style={{ marginTop: "10px", fontSize: "14px" }}>An OTP will be sent to your mobile number for verification.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;

import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  LogIn,
  Check,
  ChartSpline,
  TrendingUp,
  X,
  Mail,
  Contact,
  Shield,
  CircleUserRound,
  UserX,
  UserRoundCheck,
} from "lucide-react";
import IconizedButton from "../components/subcomponents/IconizedButton";
import IconizedTextField from "../components/subcomponents/IconizedTextField";
import Feedback from "../components/subcomponents/Feedback";

const proxy = "http://localhost:15000/";

const Login = ({ setShowNavbar }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    email: "",
    role: "team_member",
    isRemembered: false,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const timer = 3;

  useEffect(() => {
    setShowNavbar(!showPopup);
    return () => {
      setShowNavbar(true);
    };
  }, [showPopup, setShowNavbar]);

  useEffect(() => {
    let feedbackTimer;
    if (showFeedback) {
      feedbackTimer = setTimeout(() => {
        setShowFeedback(false);
        setFeedbackMessage("");
      }, timer * 1000);
    }
    return () => clearTimeout(feedbackTimer);
  }, [showFeedback]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const showFeedbackMessage = (message, success) => {
    setFeedbackMessage(message);
    setIsSuccess(success);
    setShowFeedback(true);
  };

  const registerPopup = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const registerUser = (e) => {
    e.preventDefault();
    addUser();
  };

  const addUser = () => {
    const { displayName, email, username, password } = formData;

    if (!displayName || !email || !username || !password) {
      showFeedbackMessage("Please fill in all required fields.", false);
      return;
    } else if (password.length < 8) {
      showFeedbackMessage(
        "Password must be at least 8 characters long.",
        false
      );
      return;
    }

    fetch(proxy + "user/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        display_name: displayName,
        email,
        username,
        password_hash: password,
        role: formData.role,
      }),
    })
      .then((res) => {
        const statusCode = res.status;
        return res.json().then((data) => ({
          statusCode,
          data,
        }));
      })
      .then(({ statusCode, data }) => {
        if (statusCode === 201) {
          showFeedbackMessage("Registration successful!", true);

          // Clear form fields except username and password
          setFormData((prev) => ({
            ...prev,
            displayName: "",
            email: "",
            role: "team_member",
            isRemembered: true,
          }));
          setShowPopup(false);
        } else {
          showFeedbackMessage(data.message || "Registration failed.", false);
          setShowPopup(true);
        }
      })
      .catch((error) => {
        console.error(error);
        showFeedbackMessage(
          "An error occured while trying to add user.",
          false
        );
      });
  };

  const loginUser = (e) => {
    e.preventDefault();
    fetch(proxy + "user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: formData.username,
        password_hash: formData.password,
      }),
    })
      .then((res) => {
        const statusCode = res.status;
        return res.json().then((data) => ({
          statusCode,
          data,
        }));
      })
      .then(({ statusCode, data }) => {
        if (statusCode === 200) {
          console.log(data.session.user);
          showFeedbackMessage("Login successful!", true);
          setCurrentUser(data.session.user);
        } else {
          showFeedbackMessage(data.message || "Login failed.", false);
        }
      })
      .catch((error) => {
        console.error(error);
        showFeedbackMessage("An error occurred while trying to log in.", false);
      });
  };

  return (
    <div className="animate-fadein">
      {showFeedback && (
        <Feedback
          icon={isSuccess ? <UserRoundCheck size={25} /> : <UserX size={25} />}
          message={feedbackMessage}
          seconds={timer}
          isSuccess={isSuccess}
        />
      )}
      <div className="grid grid-cols-2 h-screen">
        <div className="flex flex-col justify-center p-5 bg-slate-950">
          <h1 className="text-7xl font-extrabold text-left">CTMS.</h1>
          <p className="text-5xl font-extralight">
            The next generation of Task Management.
          </p>
        </div>
        <div className="flex flex-col justify-center bg-slate-900 p-5">
          <div className="space-y-4 text-center">
            <h1 className="title text-white">
              {currentUser
                ? `Welcome back! ${currentUser.display_name}`
                : "Login to myCMTS"}
            </h1>
            <hr className="w-1/4 m-auto my-4" />
            <form className="flex flex-col space-y-4 w-1/2 m-auto">
              <IconizedTextField
                icon={<User strokeWidth={3} className="text-field-icon" />}
                inputDisplay="Username"
                inputStyle="text-field"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                maxLength={50}
              />

              <IconizedTextField
                icon={<Lock strokeWidth={3} className="text-field-icon" />}
                inputDisplay="Password"
                inputStyle="text-field"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                maxLength={255}
              />

              <div className="flex items-center justify-center">
                <div className="relative flex items-center w-1/2 justify-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative items-center">
                      <input
                        type="checkbox"
                        name="isRemembered"
                        className="items-center flex justify-center cursor-pointer
                                  h-6 w-6 border-2 peer checked:border-blue-500 appearance-none 
                                  rounded-md border-slate-400 t200e"
                        checked={formData.isRemembered}
                        onChange={handleInputChange}
                      />
                      <Check
                        className="absolute top-1/2 left-1/2 
                                  -translate-x-3
                                  -translate-y-4 w-7 h-7 
                                  pointer-events-none opacity-0 peer-checked:opacity-100 
                                  transition-opacity duration-200"
                      />
                    </div>
                    <h1 className="ml-2 font-semibold">Remember Me</h1>
                  </label>
                </div>

                <IconizedButton
                  text="Login"
                  btnStyle="btn-blue w-1/2"
                  icon={<LogIn className="ml-2" size={20} strokeWidth={3} />}
                  onClick={loginUser}
                />
              </div>
            </form>
          </div>
          <hr className="w-1/2 m-auto my-4" />
          <div className="space-y-2 text-center">
            <h1 className="title-sm text-white">New Here?</h1>
            <form className="flex flex-col space-y-4 w-1/2 m-auto">
              <p>Sign up to start tracking your progress.</p>
              <IconizedButton
                text="Sign Up"
                btnStyle="btn-white w-full space-x-2"
                icon={<ChartSpline size={20} strokeWidth={3} />}
                onClick={registerPopup}
              />
            </form>
          </div>
        </div>
      </div>
      <div
        className={`${
          showPopup
            ? "opacity-80 z-20 pointer-events-auto"
            : "opacity-0 -z-20 pointer-events-none"
        }  t500e fixed left-0 top-0 bg-black w-full h-full`}
      ></div>
      <div
        className={`${
          showPopup
            ? "opacity-100 z-30 translate-x-1/4 pointer-events-auto"
            : "opacity-0 -z-30 translate-x-full pointer-events-none"
        } t200e fixed top-0 left-0 w-full h-full flex justify-center items-center`}
      >
        <div className="bg-slate-600 p-8 rounded-lg w-1/3">
          <div className="flex justify-between items-center mb-4">
            <h1 className="title">Register</h1>
            <X size={40} onClick={closePopup} className="cursor-pointer" />
          </div>
          <div className="mb-4">
            <p className="font-extralight text-xl">
              Let's get you started on your journey our intuitive task manager.
            </p>
          </div>
          <hr className="my-4 w-1/2 m-auto" />
          <form className="flex flex-col space-y-4">
            <IconizedTextField
              icon={<User strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Username"
              inputStyle="text-field"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              maxLength={50}
            />
            <IconizedTextField
              icon={<Lock strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Password"
              inputStyle="text-field"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              maxLength={255}
            />
            <IconizedTextField
              icon={<Contact strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Display Name*"
              inputStyle="text-field"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              maxLength={100}
            />
            <IconizedTextField
              icon={<Mail strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Email*"
              inputStyle="text-field"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              maxLength={255}
            />
            <h1>
              <p className="font-semibold text-lg">User Role</p>
            </h1>
            <div className="flex space-x-4 justify-center text-center">
              <label className="w-1/2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="team_member"
                  className="hidden peer"
                  defaultChecked
                  onChange={handleInputChange}
                />
                <div
                  className="p-4 border-2 t200e font-bold border-slate-500 
                  bg-slate-700 rounded-full peer-checked:bg-slate-950 
                  peer-checked:border-slate-300 peer-checked:text-white
                  flex justify-center items-center space-x-2"
                >
                  <p>Team Member</p>
                  <CircleUserRound size={20} strokeWidth={3} />
                </div>
              </label>

              <label className="w-1/2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  className="hidden peer"
                  onChange={handleInputChange}
                />
                <div
                  className="p-4 border-2 t200e font-bold border-slate-500 
                  bg-slate-700 rounded-full peer-checked:bg-slate-950 
                  peer-checked:border-slate-300 peer-checked:text-white
                  flex justify-center items-center space-x-2"
                >
                  <p>Admin</p>
                  <Shield size={20} strokeWidth={3} />
                </div>
              </label>
            </div>
            <hr className="my-4 w-1/4 m-auto" />
            <div className="flex justify-end">
              <IconizedButton
                text="Register"
                btnStyle="btn-white space-x-2 w-full hover:bg-green-600"
                icon={<TrendingUp size={20} strokeWidth={3} />}
                onClick={registerUser}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

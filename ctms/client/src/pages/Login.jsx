import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  LogIn,
  ChartSpline,
  TrendingUp,
  X,
  Mail,
  Contact,
  Shield,
  CircleUserRound,
  UserCog,
} from "lucide-react";
import IconizedButton from "../components/subcomponents/IconizedButton";
import IconizedTextField from "../components/subcomponents/IconizedTextField";
import TickCheckbox from "../components/subcomponents/TickCheckbox";
import IconButton from "../components/subcomponents/IconButton";

const proxy = "http://localhost:15000/";

// setFeedbackMessage should accept { title: string, description: string }

const Login = ({
  setShowNavbar,
  sessionUser,
  setSessionUser,
  setFeedbackMessage,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    email: "",
    role: "team_member",
    isRemembered: true,
    manager_username: "",
  });

  const [showPopup, setShowPopup] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  useEffect(() => {
    setShowNavbar(!showPopup);
    return () => {
      setShowNavbar(true);
    };
  }, [showPopup, setShowNavbar]);

  const addUser = async () => {
    const { displayName, email, username, password, role, manager_username } =
      formData;

    // In the addUser function
    if (!displayName || !email || !username || !password || !role) {
      setFeedbackMessage({
        title: "Missing Requirements",
        description: "Please fill in all required fields.",
      });

      return;
    } else if (password.length < 8) {
      setFeedbackMessage({
        title: "Password Error",
        description: "Password must be at least 8 characters long.",
      });

      return;
    } else if (role === "team_member" && !manager_username) {
      setFeedbackMessage("Team members must provide their admin's username.");
      setFeedbackMessage({
        title: "Manager Username Required",
        description: "Please provide your admin's username.",
      });
      return;
    }

    try {
      // Only fetch manager's ID if the user is a team member
      let manager_id = null;

      if (role === "team_member") {
        // Fetch the manager's user ID
        const managerResponse = await fetch(
          proxy + `user/username/${manager_username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const managerData = await managerResponse.json();

        if (managerResponse.status !== 200) {
          setFeedbackMessage({
            title: "Manager Not Found",
            description: "The provided manager username does not exist.",
          });
          return;
        }

        manager_id = managerData.id;
      }

      // Register the new user with the manager_id (null for admins)
      const registerResponse = await fetch(proxy + "user/register", {
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
          role,
          manager_id,
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.status === 201) {
        setFeedbackMessage({
          title: "Registration Successful",
          description: "You have successfully registered.",
        });

        // Clear form fields except username and password
        setFormData((prev) => ({
          ...prev,
          displayName: "",
          email: "",
          role: "team_member",
          isRemembered: true,
          manager_username: "",
        }));
        setShowPopup(false);
      } else {
        setFeedbackMessage({
          title: "Registration Failed",
          description:
            registerData.message || "An error occurred while registering.",
        });
        setShowPopup(true);
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        title: "Registration Failed",
        description: "An error occurred while trying to register.",
      });
    }
  };

  // In your Login.js component, modify the loginUser function
  const loginUser = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setFeedbackMessage({
        title: "Missing Requirements",
        description: "Please fill in all required fields.",
      });
      return;
    }
    fetch(proxy + "user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: formData.username,
        password_hash: formData.password,
        isRemembered: formData.isRemembered,
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
          setFeedbackMessage({
            title: "Login Successful",
            description: "You have successfully logged in.",
          });
          setSessionUser(data.session.user);
        } else if (statusCode === 401 || statusCode === 404) {
          setFeedbackMessage({
            title: "Invalid Credentials",
            description: "Username or password is incorrect.",
          });
        } else {
          setFeedbackMessage({
            title: "Login Failed",
            description: "An error occurred while trying to log in.",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        setFeedbackMessage({
          title: "Login Failed",
          description: "An error occurred while trying to log in.",
        });
      });
  };

  const userLogout = () => {
    fetch(proxy + "user/logout", {
      method: "POST",
      credentials: "include",
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
          setFeedbackMessage({
            title: "Logout Successful",
            description: "You have successfully logged out.",
          });

          setSessionUser(null);
          // reset the form data
          setFormData((prev) => ({
            ...prev,
            username: "",
            password: "",
            isRemembered: true,
          }));
        } else {
          setFeedbackMessage({
            title: "Logout Failed",
            description: "An error occurred while trying to log out.",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        setFeedbackMessage({
          title: "Logout Failed",
          description: "An error occurred while trying to log out.",
        });
      });
  };

  return (
    <div className="animate-fadein">
      <div className="grid grid-cols-2 h-screen">
        <div className="flex flex-col justify-center p-5 bg-slate-950">
          <h1 className="text-7xl font-extrabold text-left">CTMS.</h1>
          <p className="text-5xl font-extralight">
            The next generation of Task Management.
          </p>
        </div>
        {sessionUser ? (
          <div className="flex flex-col items-center justify-center bg-slate-900">
            <h1 className="title text-white">
              {sessionUser
                ? `Welcome back, ${sessionUser.display_name}`
                : "Login to myCMTS"}
            </h1>
            <hr className="w-1/4 m-auto my-4" />
            <IconizedButton
              text="Logout"
              btnStyle="btn-red w-1/2"
              icon={<LogIn className="ml-2" size={20} strokeWidth={2} />}
              onClick={userLogout}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-center bg-slate-900 p-5">
            <div className="space-y-4 text-center">
              <h1 className="title text-white">Login to myCMTS</h1>
              <hr className="w-1/4 m-auto my-4" />

              <form className="flex flex-col space-y-4 w-1/2 m-auto ">
                <IconizedTextField
                  icon={<User strokeWidth={2} className="text-field-icon" />}
                  inputDisplay="Username"
                  inputStyle="text-field"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  maxLength={50}
                  inputPlaceholder="Enter your username"
                />

                <IconizedTextField
                  icon={<Lock strokeWidth={2} className="text-field-icon" />}
                  inputDisplay="Password"
                  inputStyle="text-field"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  maxLength={255}
                  inputPlaceholder="Enter your password"
                />

                <div className="flex flex-col space-y-4 items-center justify-center">
                  <TickCheckbox
                    checked={formData.isRemembered}
                    onChange={handleInputChange}
                    label="Remember Me"
                    name="isRemembered"
                  />
                  <IconizedButton
                    text="Login"
                    btnStyle="btn-blue w-3/4"
                    icon={<LogIn className="ml-2" size={20} strokeWidth={2} />}
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
                  icon={<ChartSpline size={20} strokeWidth={2} />}
                  onClick={registerPopup}
                />
              </form>
            </div>
          </div>
        )}
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
            <IconButton
              icon={<X size={40} />}
              onClick={closePopup}
              color="text-white hover:text-slate-950 hover:bg-white"
            />
          </div>
          <div className="mb-4">
            <p className="font-extralight text-xl">
              Let's get you started on your journey our intuitive task manager.
            </p>
          </div>
          <hr className="my-4 w-1/2 m-auto" />
          <form className="flex flex-col space-y-4">
            <IconizedTextField
              icon={<User strokeWidth={2} className="text-field-icon" />}
              inputDisplay="Username"
              inputStyle="text-field"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              maxLength={50}
              inputPlaceholder="Enter your unique username"
            />
            <IconizedTextField
              icon={<Lock strokeWidth={2} className="text-field-icon" />}
              inputDisplay="Password"
              inputStyle="text-field"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              maxLength={255}
              inputPlaceholder="Enter your password"
            />
            <IconizedTextField
              icon={<Contact strokeWidth={2} className="text-field-icon" />}
              inputDisplay="Display Name*"
              inputStyle="text-field"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              maxLength={100}
              inputPlaceholder="Enter your display name"
            />
            <IconizedTextField
              icon={<Mail strokeWidth={2} className="text-field-icon" />}
              inputDisplay="Email*"
              inputStyle="text-field"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              maxLength={255}
              inputPlaceholder="Enter your email"
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
                  checked={formData.role === "team_member"}
                  onChange={handleInputChange}
                />
                <div
                  className="p-4 border-2 t200e font-bold border-slate-500 
                          bg-slate-700 rounded-full peer-checked:bg-slate-950 
                          peer-checked:border-slate-300 peer-checked:text-white
                           flex justify-center items-center space-x-2"
                >
                  <p>Team Member</p>
                  <CircleUserRound size={20} strokeWidth={2} />
                </div>
              </label>

              <label className="w-1/2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  className="hidden peer"
                  checked={formData.role === "admin"}
                  onChange={handleInputChange}
                />
                <div
                  className="p-4 border-2 t200e font-bold border-slate-500 
                            bg-slate-700 rounded-full peer-checked:bg-slate-950 
                            peer-checked:border-slate-300 peer-checked:text-white
                            flex justify-center items-center space-x-2"
                >
                  <p>Admin</p>
                  <Shield size={20} strokeWidth={2} />
                </div>
              </label>
            </div>

            <div>
              <IconizedTextField
                icon={<UserCog strokeWidth={2} className={`text-field-icon`} />}
                inputDisplay="Admin's Username"
                inputStyle={`text-field  ${
                  formData.role === "admin" ? "opacity-50" : "opacity-100"
                }`}
                name="manager_username"
                value={formData.manager_username}
                onChange={handleInputChange}
                maxLength={255}
                inputPlaceholder="Enter your Admin's username"
                disabled={formData.role === "admin"}
              />
            </div>
            <hr className="my-4 w-1/4 m-auto" />
            <div className="flex justify-end">
              <IconizedButton
                text="Register"
                btnStyle="btn-white space-x-2 w-full "
                icon={<TrendingUp size={20} strokeWidth={2} />}
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

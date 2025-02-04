import React, { useState } from "react";
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
} from "lucide-react";
import IconizedButton from "../components/subcomponents/IconizedButton";
import IconizedTextField from "../components/subcomponents/IconizedTextField";

const Login = () => {
  const [showPopup, setShowPopup] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("team_member");

  const registerPopup = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div>
      <div className="grid grid-cols-2 h-screen">
        <div className="flex flex-col justify-center p-5 bg-slate-950">
          <h1 className="text-7xl font-extrabold text-left">CTMS.</h1>
          <p className="text-5xl font-extralight">
            The next generation of Task Management.
          </p>
        </div>
        <div className="flex flex-col justify-center bg-slate-900 p-5">
          <div className="space-y-4 text-center">
            <h1 className="title text-white">Login to Your Account</h1>
            <hr className="w-1/4 m-auto my-4" />
            <form className="flex flex-col space-y-4 w-1/2 m-auto">
              <IconizedTextField
                icon={<User strokeWidth={3} className="text-field-icon" />}
                inputDisplay="Username"
                inputStyle={"text-field"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={50}
              />

              <IconizedTextField
                icon={<Lock strokeWidth={3} className="text-field-icon" />}
                inputDisplay="Password"
                inputStyle={"text-field"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={255}
              />

              <div className="flex items-center justify-center ">
                <div className="relative flex items-center w-1/2 justify-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative items-center">
                      <input
                        type="checkbox"
                        className="items-center flex justify-center 
                                  h-6 w-6 border-2 peer checked:border-blue-500 appearance-none 
                                  rounded-md border-slate-400 t200e"
                      />
                      <Check
                        className="absolute top-1/2 left-1/2 
                                  transform -translate-x-3
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
                  btnStyle={"btn-blue w-1/2"}
                  icon={<LogIn className="ml-2" size={20} strokeWidth={3} />}
                />
              </div>
            </form>
          </div>
          <hr className="w-1/2 m-auto my-4" />
          <div className="space-y-2 text-center">
            <h1 className="title-sm text-white ">New Here?</h1>
            <form className="flex flex-col space-y-4 w-1/2 m-auto">
              <p>Sign up to start tracking your progress.</p>
              <IconizedButton
                text="Sign Up"
                btnStyle={"btn-white w-full space-x-2"}
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
        } t500e fixed left-0 top-0 bg-black w-full h-full`}
      ></div>
      <div
        className={`${
          showPopup
            ? "opacity-100 translate-x-1/4 z-30 pointer-events-auto"
            : "opacity-0 translate-x-full -z-10 pointer-events-none"
        } t500e fixed top-0 left-0 w-full h-full flex justify-center items-center`}
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
          <form className="flex flex-col space-y-4 ">
            <IconizedTextField
              icon={<Contact strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Display Name"
              inputStyle={"text-field"}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
            />
            <IconizedTextField
              icon={<Mail strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Email"
              inputStyle={"text-field"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
            <IconizedTextField
              icon={<User strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Username"
              inputStyle={"text-field"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
            />
            <IconizedTextField
              icon={<Lock strokeWidth={3} className="text-field-icon" />}
              inputDisplay="Password"
              inputStyle={"text-field"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={255}
            />
            <h1>
              <p className="font-semibold text-lg">User Role</p>
            </h1>
            <div class="flex space-x-4 justify-center text-center">
              <label class="w-1/2 cursor-pointer ">
                <input
                  type="radio"
                  name="user_role"
                  value="team_member"
                  class="hidden peer"
                />
                <div
                  class="p-4 border-2 t200e font-bold border-slate-500 
                  bg-slate-700 rounded-full peer-checked:bg-slate-950 
                  peer-checked:border-slate-300 peer-checked:text-white
                  flex justify-center items-center space-x-2"
                >
                  <p>Team Member</p>
                  <CircleUserRound size={20} strokeWidth={3} />
                </div>
              </label>

              <label class="w-1/2 cursor-pointer ">
                <input
                  type="radio"
                  name="user_role"
                  value="admin"
                  class="hidden peer"
                />
                <div
                  class="p-4 border-2 t200e font-bold border-slate-500 
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
                btnStyle={"btn-white space-x-2 w-full hover:bg-green-600"}
                icon={<TrendingUp size={20} strokeWidth={3} />}
                onClick={closePopup}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

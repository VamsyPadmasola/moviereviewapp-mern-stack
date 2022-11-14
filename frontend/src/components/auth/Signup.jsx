import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createUser } from "../../api/auth";
import { useAuth, useNotification } from "../../hooks";
import { isValidEmail } from "../../utils/helper";
import CustomLink from "../CustomLink";
import FormInput from "../form/FormInput";
import Submit from "../form/Submit";
import LeftContainer from "../LeftContainer";

const validateUserInfo = ({ name, email, password }) => {
  const isValidName = /^[a-z A-Z]+$/;

  if (!name.trim()) return { ok: false, error: "Name is missing!" };
  if (!isValidName.test(name)) return { ok: false, error: "Invalid name!" };

  if (!email.trim()) return { ok: false, error: "Email is missing!" };
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email!" };

  if (!password.trim()) return { ok: false, error: "Password is missing!" };
  if (password.length < 8)
    return { ok: false, error: "Password must be 8 characters long!" };

  return { ok: true };
};

export default function Signup() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { authInfo } = useAuth();
  const { isLoggedIn } = authInfo;

  const { updateNotification } = useNotification();

  const handleChange = ({ target }) => {
    const { value, name } = target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, error } = validateUserInfo(userInfo);

    if (!ok) return updateNotification("error", error);

    const response = await createUser(userInfo);
    if (response.error) return updateNotification('error', response.error);

    navigate("/", {
      state: { user: response.user },
      replace: true,
    });
  };

  useEffect(() => {
    // we want to move our user to somewhere else
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  const { name, email, password } = userInfo;

  return (
    <div className="flex bg-secondary w-full min-h-screen">
      <LeftContainer />
      <form className="w-[55%] flex items-center justify-center">
        <div className="w-[60%] bg-white rounded">
          <div className="bg-highlight w-full p-5 text-white text-center rounded">
            <h1>Sign up</h1>
          </div>
          <div className="p-4 flex flex-col space-y-5">
            <FormInput
              value={name}
              onChange={handleChange}
              label="Name"
              placeholder="John Doe"
              name="name"
            />
            <FormInput
              value={email}
              onChange={handleChange}
              label="Email"
              placeholder="john@email.com"
              name="email"
            />
            <FormInput
              value={password}
              onChange={handleChange}
              label="Password"
              placeholder="********"
              name="password"
              type="password"
            />

            <div className="flex items-center justify-center">
              <Submit value="Sign up" onClick={handleSubmit} />
            </div>

            <div className="flex justify-between">
              <CustomLink to="/auth/forget-password">Forget password</CustomLink>
              <CustomLink to="/">Sign in</CustomLink>
            </div>
          </div>
        </div>
      </form>

    </div >
  );
}

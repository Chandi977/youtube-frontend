import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { client } from "../utils"; // Adjust the import based on your file structure
import { login } from "../reducers/user";
import useInput from "../hooks/useInput";
import styled from "styled-components";
// import { client, authenticate } from "../utils";
const StyledAuth = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
`;

const Login = ({ setAuth }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const email = useInput("");
  const password = useInput("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.value.trim() || !password.value.trim()) {
      return toast.error("Please fill in all the fields");
    }

    const payload = {
      email: email.value.trim(),
      username: " ",
      password: password.value.trim(),
      };

    try {
      // Use client() directly
      const response = await client(`${process.env.REACT_APP_BE}/users/login`, {
        method: "POST",
        body: payload,
      });

      console.log("Login response:", response);

      // Backend response: { statusCode, data: { user, accessToken, refreshToken }, ... }
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;

        dispatch(login({ user, accessToken, refreshToken }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, accessToken, refreshToken })
        );

        toast.success("Login successful!");
        history.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <StyledAuth>
      <h2>Login to your account</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email.value}
          onChange={email.onChange}
        />
        <input
          type="password"
          placeholder="Password"
          value={password.value}
          onChange={password.onChange}
        />
        <div className="action input-group">
          <span className="pointer" onClick={() => setAuth("SIGNUP")}>
            Signup instead
          </span>
          <button type="submit">Login</button>
        </div>
      </form>
    </StyledAuth>
  );
};

export default Login;

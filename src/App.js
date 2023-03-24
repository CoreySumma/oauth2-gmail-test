import Emails from "./Emails";
import SignIn from "./SignIn";
import Bard from "./Bard";
import React, { useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import gmailApi from "react-gmail";
import axios from "axios";

function App() {
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  // const login = useGoogleLogin({
  //   onSuccess: (codeResponse) => setUser(codeResponse),
  //   onError: (error) => console.log("Login Failed:", error),
  // });

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
    prompt: "consent",
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    redirectUri: "http://localhost:3000",
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly",
  });

  useEffect(() => {
    if (user) {
      console.log("this is user ---->, ", user)
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
          setToken(user.access_token);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);
  
  useEffect(() => {
    if (user && profile && profile.email) {
      axios
        .get(
          // `https://www.googleapis.com/gmail/v1/users/${profile.email}/messages`,
          // `gmail.googleapis.com/gmail/v1/users/${profile.email}/messages?key=${apiKey} HTTP/1.1`,
          // `https://gmail.googleapis.com/gmail/v1/users/${profile.email}/messages?key=${apiKey}`,
          `https://gmail.googleapis.com/gmail/v1/users/${profile.email}/messages?access_token=${token}`,

          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            params: {
              maxResults: 5,
              pageToken: 1,
            }
          }
        )
        .then((res) => {
          console.log(res.data)
          setMessages(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user, profile]);

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
    setMessages([]);
  };

  return (
    <>
      <div>
        <h2>React Google Login</h2>
        <br />
        <br />
        {profile ? (
          <div>
            <img src={profile.picture} alt="user image" />
            <h3>User Logged in</h3>
            <p>Name: {profile.name}</p>
            <p>Email Address: {profile.email}</p>
            <h3>Emails</h3>
            {messages.map((message) => (
              <p key={message.id}>{message.snippet}</p>
            ))}
            <br />
            <br />
            <button onClick={logOut}>Log out</button>
          </div>
        ) : (
          <button onClick={() => login()}>Sign in with Google 🚀 </button>
        )}
      </div>
      {/* <Emails /> */}
      {/* <SignIn /> */}
    </>
  );
}
export default App;

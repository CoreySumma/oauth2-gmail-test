import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar/NavBar";
import LandingPage from "../LandingPage/LandingPage";
import "./App.css";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { displayMessage } from "../../utilities/utils";

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
    prompt: "consent",
    clientId,
    redirectUri: "http://localhost:3000",
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly",
  });

  const handleEmailClick = (message) => {
    setSelectedMessage(message);
  };

  useEffect(() => {
    if (user) {
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
    if (token && profile && profile.email) {
      setIsLoading(true);
      axios
        .get(`https://gmail.googleapis.com/gmail/v1/users/me/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          params: {
            maxResults: 35,
            includeSpamTrash: false,
          },
        })
        .then((res) => {
          setMessages(res.data.messages);
        })
        .catch((err) => console.log(err));
    }
  }, [profile]);

  useEffect(() => {
    if (token && profile && profile.email && messages.length > 0) {
      const fetchMessages = async () => {
        const fetchedMessages = await displayMessage(token, messages);
        setDisplayMessages(fetchedMessages);
        setIsLoading(false);
      };
      fetchMessages();
    }
  }, [profile, messages]);

  const logOut = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    setMessages([]);
    setDisplayMessages([]);
  };

  return (
    <>
      <NavBar />
      <div className="App">
        <div>
          <br />
          <br />
          {profile ? (
            <div>
              <div className="img-container">
                <img src={profile.picture} alt="user image" />
              </div>
              <h1>Hello, {profile.name}</h1>
              <h2>
                Please wait while I fetch: <u>{profile.email}'s</u> Email data
              </h2>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <div className="content">
                <div className="email-list card bg-gray-800 border hover:bg-white hover:text-gray-800 hover:border-black text-white font-semibold py-2 px-4 rounded-lg transition ease-in-out duration-300">
                  {isLoading ? (
                    <div className="loader-container">
                      <div className="loader"></div>
                      <p>Loading emails...</p>
                    </div>
                  ) : (
                    <table>
                      <tbody>
                        {displayMessages.map((message) => (
                          <tr
                            key={message.id}
                            onClick={() => handleEmailClick(message)}
                          >
                            <td>{message.Date}</td>
                            <td>{message.From}</td>
                            <td>{message.Subject}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="summary card bg-white border hover:border-white hover:bg-gray-800 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded-lg mr-2 transition ease-in-out duration-300">
                  <h3>Summary</h3>
                  {selectedMessage && (
                    <div>
                      <p>{selectedMessage.plainTextNoLinks}</p>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={logOut}>Log out</button>
              <br />
              <br />
            </div>
          ) : (
            <>
              <LandingPage />
              <button className="border-2 border-black" onClick={() => login()}>
                Sign in with Google
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

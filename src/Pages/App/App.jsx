import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar/NavBar";
import LandingPage from "../LandingPage/LandingPage";
import "./App.css";
import { displayMessage } from "../../utilities/utils";
import Bot from "../../assets/bot.png";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  
  
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPEN_AI_KEY,
  });
  const openai = new OpenAIApi(configuration);
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

  const aiResponse = async (selectedMessage) => {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `This is an email:${selectedMessage.plainTextNoLinks}. I need you to summarize it concisely highlighting the most important points.`,
      temperature: 0.7,
      max_tokens: 100,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    setAiResult(response.data.choices[0].text.trim());
  };

  useEffect(() => {
  }, [setSelectedMessage]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatFrom(content) {
    return content.replace(/<.*?>/g, "").trim();
  }

  const handleEmailClick = (message) => {
    setSelectedMessage(message);
    aiResponse(message);
    console.log(aiResponse);
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
    setSelectedMessage(null);
  };

  return (
    <>
      <NavBar login={login} logout={logOut} />
      <div className="App">
        <div>
          <br />
          {profile ? (
            <div>
              <div className="img-container">
                <img
                  className="img-profile"
                  src={profile.picture}
                  alt="user image"
                />
              </div>
              <h1>Hello, {profile.name}</h1>
              <h2>
                Please wait while I fetch: <u>{profile.email}'s</u> Email data
              </h2>
              <br />
              {/* <thead>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>Subject</th>
                </tr>
              </thead> */}
              <div className="content">
                <div className="email-list card bg-gray-800 border hover:bg-white hover:text-gray-800 hover:border-black text-white font-semibold py-2 px-4 rounded-lg transition ease-in-out duration-200">
                  {isLoading ? (
                    <div className="loader-container">
                      <div className="loader"></div>
                      <p>Loading Emails...</p>
                    </div>
                  ) : (
                    <table>
                      <tbody>
                        {displayMessages.map((message) => (
                          <tr
                            key={message.id}
                            onClick={() => handleEmailClick(message)}
                            className="email-list-item"
                          >
                            <td>{formatDate(message.Date)}</td>
                            <td>{formatFrom(message.From)}</td>
                            <td>{message.Subject}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="summary card bg-white border hover:border-white hover:bg-gray-800 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded-lg mr-2 transition ease-in-out duration-200">
                  {selectedMessage ? (
                    <div>
                      {/* <p>{selectedMessage.plainTextNoLinks}</p> */}
                      <p>{ aiResult }</p>
                    </div>
                  ) : (
                    <img className="img-bot" src={Bot} alt="Bot" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <LandingPage />
            </>
          )}
        </div>
      </div>
    </>
  );
}

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
  // States
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // OpenAI API setup
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPEN_AI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  // Login with Google
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

  // ai fetch and response ---> set aiResult state
  const aiResponse = async (selectedMessage) => {
    setAiLoading(true);
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: `This is an email: "${selectedMessage.plainTextNoLinks}". I need you to summarize it concisely highlighting the most important points.  The email is to me so, phrase your response appropriatley.  If I just gave you an empty string or not enough information, please just respond appropriately for that as well.`,
        temperature: 0.7,
        max_tokens: 1500,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPEN_AI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    setAiResult(response.data.choices[0].text.trim());
    setAiLoading(false);
  };

  useEffect(() => {}, [setSelectedMessage]);

  // format the date from the getMessages API call
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
  // Remove <> from the "from" field of the message
  function formatFrom(content) {
    return content.replace(/<.*?>/g, "").trim();
  }
  // handleClick function for the email list
  const handleEmailClick = (message) => {
    setSelectedMessage(message);
    aiResponse(message);
  };
  // Set the login token and fetch the user's profile
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
  //  Fetch the user's messages so we can loop through them within utils.js fetchMessage function
  // set the messages state with the repsonse from the API call
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
  }, [profile, token]);

  // Fetch the messages from the API call and set the displayMessages state
  useEffect(() => {
    if (token && profile && profile.email && messages.length > 0) {
      const fetchMessages = async () => {
        const fetchedMessages = await displayMessage(token, messages);
        setDisplayMessages(fetchedMessages);
        setIsLoading(false);
      };
      fetchMessages();
    }
  }, [profile, messages, token]);

  // Log out function reseting state for the app
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
                    <>
                      {aiLoading ? (
                        <div className="loader-container">
                          <img className="img-bot" src={Bot} alt="Bot" />
                        </div>
                      ) : (
                        <div>
                          <p>{aiResult}</p>
                        </div>
                      )}
                    </>
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

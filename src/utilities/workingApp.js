// import React, { useState, useEffect } from "react";
// import { useGoogleLogin } from "@react-oauth/google";
// import axios from "axios";
// import { base64UrlToBase64, base64ToUint8Array, displayMessage } from './utilities/utils';

// function App() {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [displayMessages, setDisplayMessages] = useState([]);
//   const [token, setToken] = useState(null);

//   const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

//   const login = useGoogleLogin({
//     onSuccess: (codeResponse) => setUser(codeResponse),
//     onError: (error) => console.log("Login Failed:", error),
//     prompt: "consent",
//     clientId,
//     redirectUri: "http://localhost:3000",
//     scope:
//       "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly",
//   });

//   useEffect(() => {
//     if (user) {
//       axios
//         .get(
//           `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
//           {
//             headers: {
//               Authorization: `Bearer ${user.access_token}`,
//               Accept: "application/json",
//             },
//           }
//         )
//         .then((res) => {
//           setProfile(res.data);
//           setToken(user.access_token);
//         })
//         .catch((err) => console.log(err));
//     }
//   }, [user]);

//   useEffect(() => {
//     if (token && profile && profile.email) {
//       axios
//         .get(`https://gmail.googleapis.com/gmail/v1/users/me/messages`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: "application/json",
//           },
//           params: {
//             maxResults: 10,
//             includeSpamTrash: false,
//           },
//         })
//         .then((res) => {
//           setMessages(res.data.messages);
//         })
//         .catch((err) => console.log(err));
//     }
//   }, [token, profile]);
//   useEffect(() => {
//     if (token && profile && profile.email && messages.length > 0) {
//       const fetchMessages = async () => {
//         const fetchedMessages = [];
//         for (const message of messages) {
//           try {
//             const res = await axios.get(
//               `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                   Accept: "application/json",
//                 },
//               }
//             );
            
//             const data = res.data;
//             let decodedRaw = ''
//             if (data.raw) {
//               const textDecoder = new TextDecoder();
//               decodedRaw = textDecoder.decode(base64ToUint8Array(base64UrlToBase64(data.raw)));
//               fetchedMessages.push({
//                 id: data.id,
//                 decodedRaw,
//               });
//             }
//             const headers = res.data.payload.headers;
//             const relevantHeaders = headers.reduce((acc, header) => {
//               if (["Date", "From", "To"].includes(header.name)) {
//                 acc[header.name] = header.value;
//               }
//               return acc;
//             }, {});

//             fetchedMessages.push({
//               id: data.id,
//               snippet: data.snippet,
//               ...relevantHeaders,
//             });
//           } catch (err) {
//             console.log(err);
//           }
//         }
//         setDisplayMessages(fetchedMessages);
//       };
//       fetchMessages();
//     }
//   }, [token, profile, messages]);

//   const logOut = () => {
//     setUser(null);
//     setProfile(null);
//     setToken(null);
//     setMessages([]);
//     setDisplayMessages([]);
//   };

//   return (
//     <>
//       <div>
//         <h2>React Google Login</h2>
//         <br />
//         <br />
//         {profile ? (
//           <div>
//             <img src={profile.picture} alt="user image" />
//             <h3>User Logged in</h3>
//             <p>{profile.name}</p>
//             <p>Email Address: {profile.email}</p>
//             <h3>Emails</h3>
//             {messages.map((message) => (
//               <p key={message.id}>{message.id}</p>
//             ))}
//             <div>
//               <h3>Messages</h3>
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>From</th>
//                     <th>Message</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {displayMessages.map((message) => (
//                     <tr key={message.id}>
//                       <td>{message.Date}</td>
//                       <td>{message.From}</td>
//                       <td>
//                         <a
//                           target="_blank"
//                           rel="noreferrer"
//                           href={`https://mail.google.com/mail/u/0/#inbox/${message.id}`}
//                         >
//                           {message.snippet}
//                           {message.dec}
//                         </a>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <button onClick={logOut}>Log out</button>
//             <br />
//             <br />
//           </div>
//         ) : (
//           <button onClick={() => login()}>Sign in with Google </button>
//         )}
//       </div>
//     </>
//   );
// }

// export default App;

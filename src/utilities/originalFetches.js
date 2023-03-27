import axios from "axios";

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
    axios
      .get(`https://gmail.googleapis.com/gmail/v1/users/me/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          maxResults: 10,
          includeSpamTrash: false,
        },
      })
      .then((res) => {
        setMessages(res.data.messages);
      })
      .catch((err) => console.log(err));
  }
}, [token, profile]);
useEffect(() => {
  if (token && profile && profile.email && messages.length > 0) {
    const fetchMessages = async () => {
      const fetchedMessages = [];
      for (const message of messages) {
        try {
          const res = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          const headers = res.data.payload.headers;
          const relevantHeaders = headers.reduce((acc, header) => {
            if (["Date", "From", "To"].includes(header.name)) {
              acc[header.name] = header.value;
            }
            return acc;
          }, {});

          fetchedMessages.push({
            id: data.id,
            snippet: data.snippet,
            ...relevantHeaders,
          });
        } catch (err) {
          console.log(err);
        }
      }
      setDisplayMessages(fetchedMessages);
    };
    fetchMessages();
  }
}, [token, profile, messages]);

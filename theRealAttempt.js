
export default function getMessages(number) {
  console.log(number);
  fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=" +
      number,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  )
    .then((data) => data.json())
    .then((info) => {
      console.log(info);
      Array.from(info.messages).forEach((message) => {
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
          }
        )
          .then((info) => {
            return info.json();
          })
          .then((data) => {
            console.log(data);
            messageData = {
              id: data.id,
              msg: data.snippet,
            };
            let result = [];
            Array.from(data.payload.headers).forEach((message) => {
              if (
                message.name == "Date" ||
                message.name == "From" ||
                message.name == "To"
              ) {
                result.push(message.value);
              }
            });
 
            console.log(result);
          });
      });
    });
}
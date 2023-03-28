import axios from "axios";

export function base64UrlToBase64(base64Url) {
  if (!base64Url) return "";
  return base64Url.replace("-", "+").replace("_", "/");
}

export function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function displayMessage(token, messages) {
  const fetchedMessages = [];
  for (let message of messages) {
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

      const payload = res.data.payload;
      console.log("this is my payload --->", payload)

      let raw = "";
      if (payload.mimeType === "multipart/alternative") {
        const plainTextPart = payload.parts.find((part) => part.mimeType === "text/plain");
        const htmlPart = payload.parts.find((part) => part.mimeType === "text/html");

        raw = plainTextPart ? plainTextPart.body.data : htmlPart.body.data;
      } else if (payload.mimeType === "text/plain") {
        raw = payload.body.data;
      } else if (payload.mimeType === "text/html") {
        raw = payload.body.data;
      }

      console.log("this is my raw email data --->", raw)


    } catch (err) {
      console.log(err);
    }
  }
  return fetchedMessages;
}
import axios from "axios";
import { Base64 } from "js-base64";

export function base64UrlToBase64(base64Url) {
  if (!base64Url) return "";
  let base64 = base64Url.replace("-", "+").replace("_", "/");

  // Ensure the base64 string has a valid length (multiple of 4)
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  return base64;
}

export function base64ToUint8Array(base64) {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error("Error in base64ToUint8Array:", err);
    return new Uint8Array(0);
  }
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
      console.log("this is my res --->", res);
      const payload = res.data.payload;
      console.log("this is my payload --->", payload);

      let raw = "";
      if (payload.mimeType === "multipart/alternative") {
        const plainTextPart = payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        const htmlPart = payload.parts.find(
          (part) => part.mimeType === "text/html"
        );

        raw = plainTextPart ? plainTextPart.body.data : htmlPart.body.data;
      } else if (payload.mimeType === "text/plain") {
        raw = payload.body.data;
      } else if (payload.mimeType === "text/html") {
        raw = payload.body.data;
      } else {
        raw = payload.body.data;
        console.log("Unhandled MIME type:", payload.mimeType);
      }

      console.log("this is my raw email data --->", raw);

      const headers = res.data.payload.headers;
      const relevantHeaders = headers.reduce((acc, header) => {
        if (["Date", "From", "To"].includes(header.name)) {
          acc[header.name] = header.value;
        }
        return acc;
      }, {});

      let decodedRaw = "";
      try {
        const base64String = base64UrlToBase64(raw);
        decodedRaw = Base64.decode(base64String);
        console.log("MIME type of the successful email:", payload.mimeType);
        console.log("Successful email parts:", payload.parts);
      } catch (err) {
        console.log("MIME type of the problematic email:", payload.mimeType);
        console.log("Problematic email parts:", payload.parts);
      }

      fetchedMessages.push({
        id: message.id,
        snippet: res.data.snippet,
        decodedRaw,
        ...relevantHeaders,
      });
    } catch (err) {
      console.log(err);
    }
  }
  return fetchedMessages;
}

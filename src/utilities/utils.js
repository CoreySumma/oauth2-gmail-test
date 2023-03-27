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

      const payload = res.data.payload;
      const raw = payload.parts.find((part) => part.mimeType === "text/plain")
        .body.data;

        console.log("this is my raw email data --->", raw)

      const data = res.data;
      let decodedRaw = "";
      if (raw) {
        console.log(raw);
        const textDecoder = new TextDecoder();
        decodedRaw = textDecoder.decode(
          base64ToUint8Array(base64UrlToBase64(raw))
        );
      }
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
        decodedRaw: decodedRaw,
        ...relevantHeaders,
      });
    } catch (err) {
      console.log(err);
    }
  }
  return fetchedMessages;
}

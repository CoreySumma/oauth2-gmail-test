import axios from "axios";
// Libraries for decoding base64 and converting HTML to text
import { Base64 } from "js-base64";
import { convert } from "html-to-text";

// Function to convert base64Url to base64 just in case
export function base64UrlToBase64(base64Url) {
  if (!base64Url) return "";
  let base64 = base64Url.replace("-", "+").replace("_", "/");

  // Ensure the base64 string has a valid length (multiple of 4)
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  return base64;
}

export function finalCleanup(text) {
  // Remove CSS styles between <style> tags
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove inline CSS styles
  text = text.replace(/style="[\s\S]*?"/gi, '');

  // Remove content between <script> tags
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove URLs
  const urlPattern = /(?:https?|ftp):\/\/[\n\S]+/gi;
  text = text.replace(urlPattern, '');

  // Remove CSS styles not enclosed in tags
  const cssPattern = /[@.][^;}]+[{][^}]*[}]/gi;
  text = text.replace(cssPattern, '');

  // Remove content between curly braces
  const curlyBracesPattern = /\{[^\}]*\}/gi;
  return text.replace(curlyBracesPattern, '');
}

// Loop through messages object and fetch each message
// Then, extract the payload and convert it to text
// Finally, push the text to the fetchedMessages object
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
        if (["Date", "From", "To", "Subject"].includes(header.name)) {
          acc[header.name] = header.value;
        }
        return acc;
      }, {});
      // declared variables for plain text and decoded raw
      let plainTextNoLinks = "";
      let decodedRaw = "";
      let plainText = "";
      // options for html-to-text
      let options = {
        wordwrap: 100,
        ignoreHref: true,
        ignoreImage: true,
        noAnchorUrl: true,
        tables: false,
        linkHrefBaseUrl: '',
        hideLinkHrefIfSameAsText: true,
      }
      try {
        const base64String = base64UrlToBase64(raw);
        decodedRaw = Base64.decode(base64String);
        plainText = convert(decodedRaw, options);
        plainTextNoLinks = finalCleanup(plainText);
        console.log("This is my plain text ---> ", plainText);
        console.log("MIME type of the successful email:", payload.mimeType);
        console.log("Successful email parts:", payload.parts);
      } catch (err) {
        console.log("MIME type of the problematic email:", payload.mimeType);
        console.log("Problematic email parts:", payload.parts);
      }

      fetchedMessages.push({
        id: res.data.subject,
        snippet: res.data.snippet,
        decodedRaw,
        plainTextNoLinks,
        ...relevantHeaders,
      });
    } catch (err) {
      console.log(err);
    }
  }
  return fetchedMessages;
}

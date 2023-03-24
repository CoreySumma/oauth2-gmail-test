// import React, { Component } from 'react';
// import { GmailClient } from 'react-gmail';

// class MessagesList extends Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       messages: [],
//     };
//   }

//   componentDidMount() {
//     this.client = new GmailClient({
//       apiKey: this.props.apiKey,
//       clientId: this.props.clientId,
//       clientSecret: this.props.clientSecret,
//     });
//     this.client.messages().then(response => {
//       this.setState({
//         messages: response.data.messages,
//       });
//     });
//   }

//   render() {
//     return (
//       <ul>
//         {this.state.messages.map((message, index) => (
//           <li key={`message-${index}`}>
//             {message.subject}
//           </li>
//         ))}
//       </ul>
//     );
//   }
// }

// export default MessagesList;
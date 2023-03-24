import React from "react";
import gmailApi from "react-gmail";
 
class SignIn extends React.Component {
  state = {
    sign: gmailApi.sign
  };
 
  componentDidMount() {
    gmailApi.listenSign(this.signUpdate);
  }
 
  signUpdate = sign => {
    this.setState({ sign });
  };
 
  handleSignIn = () => {
    gmailApi.handleSignIn().then(() => {
      console.log("handleSignIn");
    });
  };
 
  handleSignOut = () => {
    gmailApi.handleSignOut().then(() => {
      console.log("handleSignOut");
    });
  };
 
  render() {
    return (
      <div>
        <button onClick={this.handleSignIn}>SignIn Google</button>
        <button onClick={this.handleSignOut}>SignOut Google</button>
        <p> Sign status: {this.state.sign} </p>
      </div>
    );
  }
}

export default SignIn;
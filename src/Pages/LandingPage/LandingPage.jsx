import logo from "../../assets/two.png";
import "./LandingPage.css";

export default function LandingPage () {
  return (
    <div>
    <h1 className="text-4xl">Skip the appetizer and cut right to the main course.</h1>
    <br />
    <p className="text-2xl">Get the run down on all your daily emails with the click of a button.</p>
    <img src={logo} className="App-logo" alt="logo" />
  <p>(Powered by OpenAI)</p>
  </div>
  )
}
import logo from "../../assets/two.png";

export default function LandingPage () {
  return (
    <header>
    <h1 className="text-5xl">Skip the appetizer and cut right to the main course.</h1>
    <br />
    <p className="text-3xl">Get the run down on all your daily emails with the click of a button.</p>
    <img src={logo} className="App-logo" alt="logo" />
  <p>(Powered by OpenAI)</p>
  </header>
  )
}
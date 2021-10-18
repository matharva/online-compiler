import "./App.css";
import React, { useState } from "react";
import axios from "axios";
function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      language: "cpp",
      code,
    };

    try {
      const { data } = await axios.post("http://localhost:5000/run", payload);
      setOutput(data.output);
      console.log(output);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <h1>Online code compiler</h1>
      <textarea
        name=""
        id=""
        cols="75"
        rows="20"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      ></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{output}</p>
    </div>
  );
}

export default App;

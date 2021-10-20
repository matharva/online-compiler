import "./App.css";
import React, { useState } from "react";
import axios from "axios";
function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      language,
      code,
    };

    try {
      const { data } = await axios.post("http://localhost:5000/run", payload);
      console.log(data);

      // Polling

      // setOutput(data.output);
      // console.log(output);
    } catch (error) {
      console.log(error);
      if (error.response) {
        const errorMessage = error.response.data.error.stderr;
        console.log(errorMessage);
        setOutput(errorMessage);
      } else {
        setOutput("Error connecting to the server");
      }
    }
  }

  return (
    <div className="App">
      <h1>Online code compiler</h1>
      <div className="">
        <label htmlFor="">Languages:</label>
        <select
          name=""
          id=""
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>
      <br />
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

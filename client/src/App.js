import "./App.css";
import React, { useState } from "react";
import axios from "axios";
function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      language,
      code,
    };

    try {
      setJobId("");
      setOutput("");
      setStatus("");

      const { data } = await axios.post("http://localhost:5000/run", payload);
      console.log(data);
      setJobId(data.jobId);

      // Polling

      let pollingInterval = setInterval(async () => {
        const { data: dataRes } = await axios.get(
          "http://localhost:5000/status",
          { params: { id: data.jobId } }
        );

        const { success, job, error } = dataRes;
        console.log(dataRes);

        if (success) {
          const { status, output } = job;
          setStatus(status);
          console.log("status", status);
          if (status === "pending") return;
          setOutput(output);
          clearInterval(pollingInterval);
        } else {
          setStatus("Error: please retry!!");
          clearInterval(pollingInterval);
          console.log(error);
          setOutput(error);
        }
      }, 1000);

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
      <p>{status}</p>
      <p>{jobId && `JobID: ${jobId}`}</p>
    </div>
  );
}

export default App;

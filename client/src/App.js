import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import stubs from "./defaultStubs";
import moment from "moment";
function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  useEffect(() => {
    const defaultLanguage = localStorage.getItem("default-lanuguage");
    if (defaultLanguage) setLanguage(defaultLanguage);
  }, []);

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
          {
            params: { id: data.jobId },
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        const { success, job, error } = dataRes;
        console.log(dataRes);

        if (success) {
          const { status, output } = job;
          setStatus(status);
          setJobDetails(job);
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

  function setDefaultLanguage() {
    localStorage.setItem("default-language", language);
    console.log(`${language} was set as your default language`);
  }

  function renderTimeDetails() {
    if (!jobDetails) return "";

    let result = "";
    let { submittedAt, completedAt, startedAt } = jobDetails;
    submittedAt = moment(submittedAt).toString();
    result += `Submitted At: ${submittedAt}`;

    if (!completedAt || !startedAt) {
      return result;
    }
    const start = moment(startedAt);
    const end = moment(completedAt);
    const executionTime = end.diff(start, "seconds", true);

    result += `Execution time: ${executionTime}s`;

    return result;
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Online code compiler</h1>
        <div className="">
          <label htmlFor="">Languages:</label>
          <select
            name=""
            id=""
            value={language}
            onChange={(e) => {
              let response = window.confirm(
                "WARNING: Changing language will remove your code. Do you wish to proceed?"
              );
              if (response) {
                setLanguage(e.target.value);
              }
            }}
          >
            <option value="cpp">C++</option>
            <option value="py">Python</option>
          </select>
        </div>
        <br />
        <button onClick={setDefaultLanguage}>Set default</button>
        <br />
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
        <p>{renderTimeDetails()}</p>
        <p>{status}</p>
        <p>{jobId && `JobID: ${jobId}`}</p>
      </div>
    </div>
  );
}

export default App;

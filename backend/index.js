const express = require("express");
const cors = require("cors");

// File execution exports
const { generateFile } = require("./generateFile");
const { addJobToQueue } = require("./jobQueue");

// DB Exports
const connectDB = require("./connect");
require("dotenv").config();
const Job = require("./models/Jobs");

const app = express();
const PORT = 5000;

// Middleware
app.enable("trust proxy");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ data: "The app is running, lesssssgo!!!!!!!!!!!" });
  console.log("GET / request served");
});

app.get("/status", async (req, res) => {
  // 1. Get the job id from the query params for polling
  console.log("/status");
  const jobId = req.query.id;

  if (jobId === undefined) {
    return res
      .status(400)
      .json({ success: false, error: "Missing query params" });
  }

  // 2. Find the respective document
  try {
    const job = await Job.findById(jobId);
    console.log(`Status request for: ${jobId} and status: ${job.status}`);
    if (job === undefined) {
      return res.status(400).json({
        success: false,
        error: `No job with id: ${jobId} is in the DB`,
      });
    }

    return res.status(200).json({ success: true, job });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: JSON.stringify(error),
    });
  }
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  // console.log(language, code);

  if (code === undefined) {
    return res
      .status(400)
      .json({ error: "The code in the body cannot be empty" });
  }

  let job;
  try {
    // 1. Create a file where the code will be stored
    const filePath = await generateFile(language, code);
    // console.log("File Path: ", filePath);

    // 2. Store the filepath in the db
    job = await Job.create({ language, filePath });
    console.log("Job created for: ", job._id);

    // 3. Send the jobId in the front end to confirm that the
    // code is submitted and is executing and add it to the job queue
    const jobId = job._id;
    addJobToQueue(jobId);
    res.status(201).json({ success: true, jobId });
  } catch (error) {
    res.status(500).json({ success: false, error: JSON.stringify(error) });
  }
});

/////////////////////////////////////////////////////////
////  Clock Sync Starts
/////////////////////////////////////////////////////////
let timestamp = new Date().getTime();
let timeDelta = 0;

app.get("/getTimestamp", (req, res) => {
  res.json({
    data: "The app is running, lesssssgo!!!!!!!!!!!",
    timestamp: new Date().getTime(),
  });
  console.log("GET / request served");
});

app.get("/getBerkleyTimestamp", (req, res) => {
  console.log("In server 3: ", timestamp);
  res.json({
    timestamp: timeDelta + new Date().getTime(),
    // ip: results["eth0"][0],
  });
});

app.get("/sendTime", (req, res) => {
  res.json({
    timestamp: new Date().getTime(),
  });
});

app.post("/sendTime", (req, res) => {
  timeDelta = req.body.timestamp;
  res.send("ok");
});

/////////////////////////////////////////////////////////
////  Clock Sync Ends
/////////////////////////////////////////////////////////

// Sever Init
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server listening at port ${PORT}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

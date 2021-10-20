const express = require("express");
const cors = require("cors");

// File execution exports
const { generateFile } = require("./generateFile");
const { executePy } = require("./executePy");
const { executeCpp } = require("./executeCpp");

// DB Exports
const connectDB = require("./connect");
require("dotenv").config();
const Job = require("./models/Jobs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/status", async (req, res) => {
  // 1. Get the job id from the query params for polling
  const jobId = req.query.id;

  if (jobId === undefined) {
    return res
      .status(400)
      .json({ success: false, error: "Missing query params" });
  }

  console.log(jobId);

  // 2. Find the respective document
  try {
    const job = await Job.findById(jobId);
    console.log("job is", job);
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
  console.log(language, code);

  if (code === undefined) {
    return res
      .status(400)
      .json({ error: "The code in the body cannot be empty" });
  }

  let job;
  try {
    // 1. Create a file where the code will be stored
    const filePath = await generateFile(language, code);
    console.log("File Path: ", filePath);

    // 2. Store the filepath in the db
    job = await Job.create({ language, filePath });
    console.log(job);

    // 3. Send the jobId in the front end to confirm that the
    // code is submitted and is executing
    const jobId = job._id;
    console.log(jobId);
    res.status(201).json({ success: true, jobId });

    // 4. Execute code in parallel
    let output;
    job["startedAt"] = new Date();
    if (language === "cpp") {
      output = await executeCpp(filePath);
    } else {
      output = await executePy(filePath);
    }

    // 5. Update the code status, time and output in the DB
    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;
    await job.save();
    // console.log({ filePath, output });
    console.log(job);
  } catch (error) {
    // Else update the status and add the error in the DB
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(error);
    await job.save();
    console.log(job);
  }
});

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

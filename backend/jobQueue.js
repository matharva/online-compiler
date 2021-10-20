const Queue = require("bull");

const jobQueue = new Queue("job-queue");
const NUM_WORKERS = 5;
const Job = require("./models/Jobs");
const { executePy } = require("./executePy");
const { executeCpp } = require("./executeCpp");

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  const { id: jobId } = data;

  //   1. Find the job from the DB
  const job = await Job.findById(jobId);
  if (job === undefined) {
    throw Error("Job not found");
  }
  console.log("Fetched job", job);

  try {
    // 2. Execute code in parallel
    let output;
    job["startedAt"] = new Date();
    if (job.language === "cpp") {
      output = await executeCpp(job.filePath);
    } else {
      output = await executePy(job.filePath);
    }

    // 3. Update the code status, time and output in the DB
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

  return true;
});

jobQueue.on("failed", (error) => {
  console.log(error.data.id, "failed", error.failedReason);
});

const addJobToQueue = async (jobId) => {
  await jobQueue.add({ id: jobId });
};

module.exports = { addJobToQueue };

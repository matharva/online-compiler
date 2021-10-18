const express = require("express");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log(language, code);

  if (code === undefined) {
    return res
      .status(400)
      .json({ error: "The code in the body cannot be empty" });
  }

  try {
    // Create a file where the code will be stored
    const filePath = await generateFile(language, code);
    console.log("File Path: ", filePath);

    // Run the file and send the response
    const output = await executeCpp(filePath);
    console.log(output);
    return res.json({ filePath, output });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
});

app.listen(5000, () => console.log("Listening on port 5000..."));

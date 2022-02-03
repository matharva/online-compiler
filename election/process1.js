const axios = require("axios");
const app = require("express")();

app.get("/", (req, res) => {
  res.json({ data: "process1" });
});

let coordinator = null;

async function findCordinator() {
  //   setTimeout(async () => {
  try {
    const data3 = await axios.get("http://localhost:8003");
    console.log("The data is: ", data3.data);
    coordinator = 3;
  } catch (e) {
    console.log("The error is: ", e.message);
  }

  if (!coordinator) {
    try {
      const data3 = await axios.get("http://localhost:8002");
      console.log("The data is: ", data3.data);
      coordinator = 2;
    } catch (e) {
      console.log("The error is: ", e.message);
    }
  }

  if (!coordinator) {
    coordinator = 1;
    await setCordinator();
  }

  console.log("The coordinator is: ", coordinator);
  //   }, 2000);
}

findCordinator();

async function setCordinator() {
  try {
    const data3 = await axios.get(
      "http://localhost:8000/setCoordinator?coordinator=1"
    );
    console.log("The data is: ", data3.data);
    // coordinator = 3;
  } catch (e) {
    console.log("The error is: ", e.message);
  }
}

app.get("/setCoordinator", (req, res) => {
  console.log("The new coordinator is: ", req.query.coordinator);
  coordinator = parseInt(req.query.coordinator);
  res.json({ OP: "OP" });
});

setInterval(async () => {
  if (coordinator != null) {
    try {
      const data3 = await axios.get(`http://localhost:${8000 + coordinator}`);
      console.log("The data is: ", data3.data, coordinator);
      //   coordinator = 1;
    } catch (e) {
      coordinator = null;
      await findCordinator();
      console.log("The error is: ", e.message);
    }
  }
}, 5000);

app.listen(8001, () => {
  console.log("Server on port: ", 8001);
});

const axios = require("axios");
const fs = require("fs");

async function main() {
  console.log("Ocean wave auto claim by: akimabs");
  const [address, token] = readCredentials();
  const url = "https://api-walletapp.waveonsui.com/api/claim";
  const data = JSON.stringify({ address: address });
  requestData(url, data, token);

  setInterval(async () => {
    requestData(url, data);
  }, 2 * 60 * 60 * 1000);
}

async function requestData(url, data, token) {
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        accept: "application/json, text/plain, */*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "access-control-allow-origin": "*",
        authorization: `Bearer ${token}`,
        origin: "https://walletapp.waveonsui.com",
        priority: "u=1, i",
        referer: "https://walletapp.waveonsui.com/",
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    });
    console.log(response.data.data);
  } catch (error) {
    const err = error.response.data.message.toLowerCase() == "Not time to claim yet.".toLowerCase();
    if (err) {
      console.error("Belum waktunya claim, tinggal aja bang botnya masih nyala ko...");
      return;
    }
    console.error("Error sending request:", error.response.data);
  }
}

function readCredentials() {
  try {
    const content = fs.readFileSync("credentials.txt", "utf-8").split("\n");
    if (content.length !== 2) {
      console.log("Invalid format of credentials file");
      process.exit(1);
    }
    return content.map((line) => line.trim());
  } catch (err) {
    console.error("Error reading file:", err);
    process.exit(1);
  }
}

main();

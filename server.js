const { default: axios } = require("axios")

const appUrl = "https://fullnode.mainnet.sui.io"
const claimUrl = "https://api-walletapp.waveonsui.com/api/claim";

const address = "Your Wallet Address"
const token = "Your Access Token"

const getLastClaimTime = async () => {
    try {
        var headers = {
            "Content-Type": "application/json",
            "Content-Length": 240,
            accept: "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "access-control-allow-origin": "*",
            origin: "https://walletapp.waveonsui.com",
            priority: "u=1, i",
            referer: "https://walletapp.waveonsui.com/",
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
        }

        var payload = {
            "jsonrpc": "2.0",
            "id": 220,
            "method": "suix_getDynamicFieldObject",
            "params": [
                "0x4846a1f1030deffd9dea59016402d832588cf7e0c27b9e4c1a63d2b5e152873a",
                {
                    "type": "address",
                    "value": address //Our wallet address
                }
            ]
        }

        var result = await axios.post(appUrl, payload, headers)
        return parseInt(result.data.result.data.content.fields.last_claim);
    } catch (error) {
        console.log("Failed to get last claim time, error: " + error);
        process.exit();
    }
}

const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
};

const convertTzToDate = (tz) => {
    // Create a new Date object using the timestamp
    const date = new Date(tz);

    // Get hours, minutes, and seconds from the Date object
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `${hours}:${minutes}:${seconds}`;

}



const claimRunner = async () => {
    try {
        const data = JSON.stringify({ address: address });

         await axios.post(claimUrl, data, {
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
        let successTime = new Date();
        console.log(`Success claim at ${successTime.toLocaleString()}`);
        return
    } catch (error) {
        return error
    }
}


const RunApp = async () => {
    console.log("Starting app...");
    var delayTime = 0
    while (true) {
        var lastClaimTime = await getLastClaimTime()
        var formatedLCT = convertTzToDate(lastClaimTime)
        console.log("Last Claim Time At : " + formatedLCT);

        const timeNow = Date.now();

        let gap = timeNow - lastClaimTime
        
        if(gap <= 0){
            await claimRunner()
            await delay(5000)
            return
        }else {
            var gaptz = 7200000 - gap
            const hours = Math.floor(gaptz / (1000 * 60 * 60));
            const minutes = Math.floor((gaptz % (1000 * 60 * 60)) / (1000 * 60));

            console.log(`Next claim : ${hours} hours and ${minutes} minutes.`);


            var nextClaimAt = new Date(timeNow + gaptz);
            console.log(`Next claim at ${nextClaimAt.toLocaleString()}`);
            delayTime = gaptz
        }
        await delay(delayTime)
    }
}

RunApp()
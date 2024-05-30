import axios from "axios";
import { config } from "dotenv";
import { userId } from "./index.js";

config();

// Define interfaces
interface Limit {
    storeType: string;
    name: string;
    limit: number;
    used: number;
    earliestTimestamp: number;
    earliestHash: string;
}

interface LimitsResponse {
    limits: Limit[];
}



//Export user storage data
export let userCastStorage: string;

export let userLinkStorage: string;

export let userReactionStorage: string;

export let userDataStorage: number;

// Main function to fetch and handle data
const main = async () => {
    const server = "https://hubs.airstack.xyz";

    try {
        const response = await axios.get<LimitsResponse>(`${server}/v1/storageLimitsByFid?fid=${userId}`, {
            headers: {
                "Content-Type": "application/json",
                "x-airstack-hubs": process.env.AIRSTACK_API_KEY,
            },
        });

        // Check if response.data is defined
        if (!response.data) {
            console.error("Response data is undefined.");
            return;
        }

        const tmp = response.data.limits;

        tmp.forEach((i) => {
            if (i["storeType"] === 'STORE_TYPE_CASTS') {
                var t = i['used'] / i['limit'];
                userCastStorage = (parseFloat(t.toFixed(3)) * 100).toFixed(1);
            }
            if (i["storeType"] === 'STORE_TYPE_LINKS') {
                var t = i['used'] / i['limit'];
                userLinkStorage = (parseFloat(t.toFixed(3)) * 100).toFixed(1);
            }
            if (i["storeType"] === 'STORE_TYPE_REACTIONS') {
                var t = i['used'] / i['limit'];
                userReactionStorage = (parseFloat(t.toFixed(3)) * 100).toFixed(1);
            }
            if (i["storeType"] === 'STORE_TYPE_USER_DATA') {
                userDataStorage = i['used'] - 1;
            }
        })



    } catch (e) {
        // Enhanced error logging
        if (axios.isAxiosError(e)) {
            console.error("Axios error:", e.message);
            if (e.response) {
                console.error("Response data:", e.response.data);
                console.error("Response status:", e.response.status);
                console.error("Response headers:", e.response.headers);
            }
        } else {
            console.error("Unexpected error:", e);
        }
    }
}
main();

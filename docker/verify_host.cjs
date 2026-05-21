
const email = "superadmin@proquelec.sn";
const password = "Sovereign2026!";
const authUrl = "http://localhost:3102/auth/v1/token?grant_type=password";
const apiUrl = "http://localhost:3102/rest/v1/site_settings?select=*";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY5NjYxMDMxLCJleHAiOjIwODUwMjEwMzF9.Ogs9QlGJImh3E2SP_rlCzHAHeIdhTYRW7GW5rfQptEI";

async function verify() {
    try {
        console.log("1. Authenticating...");
        const authRes = await fetch(authUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": anonKey
            },
            body: JSON.stringify({ email, password })
        });

        if (!authRes.ok) {
            const err = await authRes.text();
            console.error("Auth Failed:", authRes.status, err);
            return;
        }

        const authData = await authRes.json();
        const token = authData.access_token;
        console.log("   Success! Token received.");

        console.log("2. Accessing Protected Resource (site_settings)...");
        const apiRes = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "apikey": anonKey,
                "Content-Type": "application/json"
            }
        });

        console.log(`   API Status: ${apiRes.status} ${apiRes.statusText}`);

        if (apiRes.ok) {
            const data = await apiRes.json();
            console.log("   Data Length:", data.length);
            console.log("   Sample Data:", JSON.stringify(data[0]).substring(0, 100) + "...");
            console.log("✅ VERIFICATION SUCCESSFUL");
        } else {
            const err = await apiRes.text();
            console.error("❌ API ACCESS DENIED:", err);
        }

    } catch (error) {
        console.error("Execution Error:", error.message);
    }
}

verify();

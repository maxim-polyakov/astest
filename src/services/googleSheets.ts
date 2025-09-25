import { google, sheets_v4 } from "googleapis";
// @ts-ignore
import { Tariff } from "./db";

// Singleton для Google Sheets
let sheetsClient: sheets_v4.Sheets | null = null;

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
    if (!sheetsClient) {
        const auth = new google.auth.GoogleAuth({
            keyFile: "perfect-precept-433720-f3-d0f24cfa89e6.json",
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        sheetsClient = google.sheets({ version: "v4", auth });
    }
    return sheetsClient;
}

export async function updateGoogleSheet(tariffs: Tariff[]) {
    try {
        const sheets = await getSheetsClient();
        const spreadsheetId = "1SB6z-eEB7SEN8vEuKTcSd6-Uh76XBOgZObCyp7F2MhU";

        // Prepare the data
        const values = tariffs.map(t => [t.id, t.value]);

        // Update the sheet
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Лист1!A2:B", // Check this range carefully
            valueInputOption: "RAW",
            requestBody: { values },
        });
        console.log("Update successful:", response.data);
    } catch (err) {
        // This will log the specific error from the Google API
        throw err;
    }
}



import { google, sheets_v4 } from "googleapis";
// @ts-ignore
import { Tariff } from "./db";

// Singleton для Google Sheets
let sheetsClient: sheets_v4.Sheets | null = null;

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
    if (!sheetsClient) {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        sheetsClient = google.sheets({ version: "v4", auth });
    }
    return sheetsClient;
}

export async function updateGoogleSheet(tariffs: Tariff[]) {
    const sheets = await getSheetsClient();
    const spreadsheetId = "YOUR_SPREADSHEET_ID";

    const values = tariffs.map(t => [t.id, t.value]);

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A2:B",
        valueInputOption: "RAW",
        requestBody: { values },
    });
}
import { google, sheets_v4 } from "googleapis";
// @ts-ignore
import { Tariff } from "./db";

// Singleton для Google Sheets
let sheetsClient: sheets_v4.Sheets | null = null;

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
    if (!sheetsClient) {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || "/app/dist/perfect-precept-433720-f3-23d6ba7a783b.json",
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        sheetsClient = google.sheets({ version: "v4", auth });
    }
    return sheetsClient;
}

export async function updateGoogleSheet(tariffs: Tariff[], spreadsheetIds: string[]) {
    try {
        const sheets = await getSheetsClient();

        // Prepare the data once for all sheets
        const values = tariffs.map(t => [t.id, t.value]);

        // Update all spreadsheets
        const updatePromises = spreadsheetIds.map(spreadsheetId =>
            sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "Лист1!A2:B",
                valueInputOption: "RAW",
                requestBody: { values },
            })
        );

        // Wait for all updates to complete
        const responses = await Promise.all(updatePromises);

        console.log(`Update successful for ${responses.length} sheets`);
        return responses;
    } catch (err) {
        console.error("Error updating Google Sheets:", err);
        throw err;
    }
}



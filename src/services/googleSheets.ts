import { google } from "googleapis";
/**
 * @typedef {{ id: string, value: number }} Tariff
 * @typedef {{ saveHistory?: boolean, saveCurrent?: boolean }} SaveOptions
 */

/**
 * @param {Tariff[]} tariffs
 */
export async function updateGoogleSheet(tariffs) {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "YOUR_SPREADSHEET_ID";

    const values = tariffs.map(t => [t.id, t.value]);

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A2:B",
        valueInputOption: "RAW",
        requestBody: { values },
    });
}
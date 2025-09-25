import { google } from "googleapis";

export interface Tariff {
    id: string;
    value: number;
}

/**
 * Обновляет Google Sheet актуальными тарифами
 * @param tariffs - массив тарифов
 */
export async function updateGoogleSheet(tariffs: Tariff[]) {
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
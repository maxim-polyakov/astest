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

        // Обрабатываем тарифы: заполняем пустые value нулями
        const processedTariffs = tariffs.map(t => {
            let value = t.value;

            // Проверяем, является ли value числом
            if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
                console.warn(`Некорректное значение для тарифа ${t.id}: ${value}, заменяем на 0`);
                value = 0;
            }

            return {
                ...t,
                value: value
            };
        });

        // Сортируем тарифы по возрастанию коэффициента (value)
        const sortedTariffs = [...processedTariffs].sort((a, b) => a.value - b.value);

        // Подготавливаем данные с заголовками
        const values = [
            ["Тариф", "Коэффициент"], // Заголовки
            ...sortedTariffs.map(t => [t.id, t.value])
        ];

        // Обновляем все таблицы
        const updatePromises = spreadsheetIds.map(spreadsheetId =>
            sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "stocks_coefs!A1:B", // Обновляем с первой строки (заголовки)
                valueInputOption: "RAW",
                requestBody: { values },
            })
        );

        // Ждем завершения всех обновлений
        const responses = await Promise.all(updatePromises);

        // Подсчитываем сколько значений было заполнено нулями
        const zeroCount = processedTariffs.filter(t => t.value === 0).length;

        console.log(`Успешно обновлено ${responses.length} таблиц, отсортировано ${sortedTariffs.length} тарифов`);
        console.log(`Заполнено нулями: ${zeroCount} пустых значений`);

        return responses;
    } catch (err) {
        console.error("Ошибка при обновлении Google Sheets:", err);
        throw err;
    }
}
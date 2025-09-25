import cron from "node-cron";
import { fetchTariffsFromWB } from "./services/wb.js";
import { saveTariffsToDB, Tariff, transformWBTariffsToTariffArray } from "./services/db.js";
import { updateGoogleSheet } from "./services/googleSheets.js";

/**
 * Запускаем сервис
 */
async function bootstrap() {
    console.log("Service starting...");

    // Cron каждую секунду (только для теста)
    cron.schedule("* * * * * *", async () => {
        const start = new Date();
        console.log(start.toISOString(), "Running 1-second cron...");

        try {
            let tariffs: Tariff[] = await fetchTariffsFromWB();

            tariffs = await transformWBTariffsToTariffArray(tariffs);

            // Сохраняем текущие тарифы batch insert
            await saveTariffsToDB(tariffs, { saveCurrent: true });

            // Обновляем Google Sheets
            await updateGoogleSheet(tariffs);

            // Лог памяти для мониторинга
            const mem = process.memoryUsage();
            console.log(
                `Heap used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`
            );

            console.log(new Date().toISOString(), "1-second cron finished");
        } catch (err) {
            console.error("Error in 1-second cron:", err);
        }
    });
    console.log("1-second cron job scheduled successfully");
}

bootstrap().catch(err => {
    console.error("Fatal error during bootstrap:", err);
    process.exit(1);
});
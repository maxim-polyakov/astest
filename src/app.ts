import cron from "node-cron";
import { fetchTariffsFromWB } from "./services/wb.js";
import { saveTariffsToDB, Tariff, transformWBTariffsToTariffArray } from "./services/db.js";
import { updateGoogleSheet } from "./services/googleSheets.js";
import knex, { migrate, seed } from "#postgres/knex.js";
/**
 * Запускаем сервис
 */
async function bootstrap() {
    console.log("Service starting...");

    await migrate.latest();
    await seed.run();

    cron.schedule("0 * * * *", async () => {
        const start = new Date();
        console.log(start.toISOString(), "Running 1-second cron...");

        try {
            let tariffs: Tariff[] = await fetchTariffsFromWB();

            tariffs = await transformWBTariffsToTariffArray(tariffs);

            // Сохраняем текущие тарифы batch insert
            await saveTariffsToDB(tariffs, { saveCurrent: true });

            const spreadsheetIds = [
                "1SB6z-eEB7SEN8vEuKTcSd6-Uh76XBOgZObCyp7F2MhU",
                "1mwGwr5M9hjFLPX9ShwTCpNNYdReLf6Wpgkyk2kn_5KY"
            ];

            await updateGoogleSheet(tariffs, spreadsheetIds);

            // Лог памяти для мониторинга
            const mem = process.memoryUsage();
            console.log(
                `Heap used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`
            );

            console.log(new Date().toISOString(), "1-hour cron finished");
        } catch (err) {
            console.error("Error in 1-hour cron:", err);
        }
    });
    console.log("1-hour cron job scheduled successfully");
}

bootstrap().catch(err => {
    console.error("Fatal error during bootstrap:", err);
    process.exit(1);
});
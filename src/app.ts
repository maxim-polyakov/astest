import cron from "node-cron";
import { migrate, seed } from "#postgres/knex.js";
import { fetchTariffsFromWB } from "./services/wb.ts";
import { saveTariffsToDB } from "./services/db.ts";
import { updateGoogleSheet } from "./services/googleSheets.ts";

async function bootstrap() {
    // 1️⃣ Запускаем миграции и сиды при старте
    await migrate.latest();
    await seed.run();
    console.log("All migrations and seeds have been run");

    // 2️⃣ Cron-задачи

    // Сохраняем исторические тарифы каждый день в 02:00
    cron.schedule("0 2 * * *", async () => {
        const tariffs = await fetchTariffsFromWB();
        await saveTariffsToDB(tariffs, { saveHistory: true });
        console.log("Historical tariffs saved");
    });

    // Обновляем актуальные тарифы и Google Sheets каждый час
    cron.schedule("* * * * * *", async () => {
        try {
            const tariffs = await fetchTariffsFromWB();
            await saveTariffsToDB(tariffs, { saveCurrent: true });
            await updateGoogleSheet(tariffs);
            console.log(new Date().toISOString(), "Current tariffs updated and Google Sheet synced");
        } catch (err) {
            console.error("Error updating tariffs:", err);
        }
    });

    console.log("Cron jobs started");
}

// Запускаем сервис
bootstrap().catch((err) => {
    console.error("Error starting service:", err);
    process.exit(1);
});
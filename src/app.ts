import cron from "node-cron";
import { fetchTariffsFromWB } from "./services/wb.js";
import { saveTariffsToDB, Tariff, transformWBTariffsToTariffArray } from "./services/db.js";
import { updateGoogleSheet } from "./services/googleSheets.js";
import knex, { migrate, seed } from "#postgres/knex.js";

/**
 * Основная функция выполнения задачи
 */
async function executeHourlyTask() {
    const start = new Date();
    console.log(start.toISOString(), "Запуск ежечасного обновления тарифов...");

    try {
        // 1. Получаем данные из API WB
        console.log("Получение тарифов из API Wildberries...");
        const wbTariffs = await fetchTariffsFromWB();

        if (!wbTariffs || wbTariffs.length === 0) {
            throw new Error("Не удалось получить данные из API Wildberries");
        }

        console.log(`Получено ${wbTariffs.length} тарифов из WB API`);

        // 2. Преобразуем данные в наш формат
        console.log("Преобразование данных...");
        const tariffs = transformWBTariffsToTariffArray(wbTariffs);

        if (tariffs.length === 0) {
            throw new Error("Не удалось преобразовать данные тарифов");
        }

        console.log(`Преобразовано ${tariffs.length} тарифов`);

        // 3. Сохраняем в БД (историю и текущие)
        console.log("Сохранение в базу данных...");
        await saveTariffsToDB(tariffs, {
            saveHistory: true,
            saveCurrent: true
        });

        // 4. Обновляем Google Sheets
        console.log("Обновление Google Sheets...");
        const spreadsheetIds = [
            "1SB6z-eEB7SEN8vEuKTcSd6-Uh76XBOgZObCyp7F2MhU",
            "1mwGwr5M9hjFLPX9ShwTCpNNYdReLf6Wpgkyk2kn_5KY"
        ];

        await updateGoogleSheet(tariffs, spreadsheetIds);

        // 5. Логируем использование памяти
        const mem = process.memoryUsage();
        console.log(
            `Использование памяти: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`
        );

        const end = new Date();
        const duration = (end.getTime() - start.getTime()) / 1000;
        console.log(`${end.toISOString()} Обновление завершено за ${duration.toFixed(2)} секунд`);

    } catch (err) {
        console.error("Ошибка при выполнении ежечасного задания:", err);
        throw err; // Пробрасываем ошибку для внешней обработки
    }
}

/**
 * Запускаем сервис
 */
async function bootstrap() {
    console.log("Запуск сервиса мониторинга тарифов WB...");

    try {
        // 1. Инициализация БД
        console.log("Применение миграций...");
        await migrate.latest();

        console.log("Заполнение начальными данными...");
        await seed.run();

        // 2. Запускаем сразу при старте
        console.log("Первоначальное обновление тарифов...");
        await executeHourlyTask();

        // 3. Настраиваем ежечасное выполнение (в 0 минут каждого часа)
        console.log("Настройка ежечасного задания...");
        cron.schedule("0 * * * *", async () => {
            await executeHourlyTask();
        });

        console.log("Ежечасное задание успешно настроено (выполнение в 0 минут каждого часа)");

        // 4. Обработка graceful shutdown
        process.on('SIGINT', async () => {
            console.log('Получен SIGINT. Завершение работы...');
            await knex.destroy();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('Получен SIGTERM. Завершение работы...');
            await knex.destroy();
            process.exit(0);
        });

    } catch (err) {
        console.error("Ошибка при запуске сервиса:", err);
        throw err;
    }
}

// Запуск приложения
bootstrap().catch(err => {
    console.error("Критическая ошибка при запуске:", err);
    process.exit(1);
});
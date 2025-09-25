/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    // Очистим таблицы
    await knex("tariffs_history").del();
    await knex("tariffs_current").del();

    const sampleTariffs = [
        { tariff_id: "delivery", value: 120.5 },
        { tariff_id: "storage", value: 45.0 },
        { tariff_id: "commission", value: 10.75 },
    ];

    // Засеем "актуальные"
    for (const t of sampleTariffs) {
        await knex("tariffs_current").insert({
            tariff_id: t.tariff_id,
            value: t.value,
            updated_at: knex.fn.now(),
        });
    }

    // Засеем "исторические" — например, на сегодня
    for (const t of sampleTariffs) {
        await knex("tariffs_history").insert({
            tariff_id: t.tariff_id,
            value: t.value,
            date: knex.fn.now(),
        });
    }
}
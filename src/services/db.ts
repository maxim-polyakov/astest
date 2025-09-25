import knex from "#postgres/knex.js";

/**
 * @typedef {{ id: string, value: number }} Tariff
 * @typedef {{ saveHistory?: boolean, saveCurrent?: boolean }} SaveOptions
 */

/**
 * @param {Tariff[]} tariffs
 * @param {SaveOptions} options
 */
export async function saveTariffsToDB(tariffs, { saveHistory = false, saveCurrent = false } = {}) {
    if (saveHistory) {
        for (const t of tariffs) {
            await knex("tariffs_history").insert({
                tariff_id: t.id,
                value: t.value,
                date: knex.fn.now(),
            });
        }
    }

    if (saveCurrent) {
        for (const t of tariffs) {
            await knex("tariffs_current")
                .insert({
                    tariff_id: t.id,
                    value: t.value,
                    updated_at: knex.fn.now(),
                })
                .onConflict("tariff_id")
                .merge();
        }
    }
}
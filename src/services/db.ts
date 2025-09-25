import knex from "#postgres/knex.js";

export interface Tariff {
    id: string;
    value: number;
}

export interface SaveOptions {
    saveHistory?: boolean;
    saveCurrent?: boolean;
}

export async function saveTariffsToDB(
    tariffs: Tariff[],
    { saveHistory = false, saveCurrent = false }: SaveOptions = {}
) {
    if (saveHistory) {
        await knex("tariffs_history").insert(
            tariffs.map(t => ({
                tariff_id: t.id,
                value: t.value,
                date: knex.fn.now(),
            }))
        );
    }

    if (saveCurrent) {
        await knex("tariffs_current")
            .insert(
                tariffs.map(t => ({
                    tariff_id: t.id,
                    value: t.value,
                    updated_at: knex.fn.now(),
                }))
            )
            .onConflict("tariff_id")
            .merge();
    }
}
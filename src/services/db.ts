import knex from "#postgres/knex.js";

// Типы тарифов
export interface Tariff {
    id: string;
    value: number;
}

// Опции сохранения
export interface SaveOptions {
    saveHistory?: boolean;
    saveCurrent?: boolean;
}

/**
 * Сохраняет тарифы в БД
 * @param tariffs - массив тарифов
 * @param options - опции сохранения
 */
export async function saveTariffsToDB(
    tariffs: Tariff[],
    { saveHistory = false, saveCurrent = false }: SaveOptions = {}
) {
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
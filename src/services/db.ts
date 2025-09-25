import knex from "#postgres/knex.js";

export interface Tariff {
    id: string;
    value: number;
}

export interface SaveOptions {
    saveHistory?: boolean;
    saveCurrent?: boolean;
}

// Функция для преобразования WB тарифов в ваш формат
export function transformWBTariffsToTariffArray(wbTariffs: any[]): Tariff[] {
    return wbTariffs.map((wbTariff, index) => {
        // Создаем ID на основе склада и региона (уникальный идентификатор)
        const id = `${wbTariff.warehouseName}_${wbTariff.geoName}`
            .toLowerCase()
            .replace(/[^a-z0-9а-яё]/g, '_')
            .replace(/_+/g, '_');

        // Преобразуем строку в число (заменяем запятую на точку)
        // Используем boxDeliveryBase как основное значение
        const value = parseFloat(wbTariff.boxDeliveryBase.replace(',', '.'));

        return {
            id: id,
            value: value
        };
    });
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
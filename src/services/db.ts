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
    if (!wbTariffs || !Array.isArray(wbTariffs)) {
        console.warn('Получен пустой или некорректный массив тарифов');
        return [];
    }

    return wbTariffs.map((wbTariff) => {
        if (!wbTariff.warehouseName || !wbTariff.geoName) {
            console.warn('Пропущен тариф с отсутствующими обязательными полями:', wbTariff);
            return null;
        }

        // Создаем ID на основе склада и региона
        const id = `${wbTariff.warehouseName}_${wbTariff.geoName}`
            .toLowerCase()
            .replace(/[^a-z0-9а-яё]/g, '_')
            .replace(/_+/g, '_');

        // Безопасное преобразование значения
        let value = 0;
        try {
            if (wbTariff.boxDeliveryBase) {
                value = parseFloat(wbTariff.boxDeliveryBase.toString().replace(',', '.'));
            }
        } catch (error) {
            console.warn(`Ошибка преобразования значения для тарифа ${id}:`, error);
            value = 0;
        }

        return {
            id: id,
            value: value
        };
    }).filter(tariff => tariff !== null); // Убираем null значения
}

export async function saveTariffsToDB(
    tariffs: Tariff[],
    { saveHistory = false, saveCurrent = false }: SaveOptions = {}
) {
    if (tariffs.length === 0) {
        console.log('Нет данных для сохранения');
        return;
    }

    const today = new Date().toISOString().split('T')[0]; // Текущая дата YYYY-MM-DD
    const now = new Date();

    // Используем транзакцию для гарантии целостности данных
    const trx = await knex.transaction();

    try {
        if (saveHistory) {
            // УДАЛЯЕМ существующие записи за сегодняшний день перед добавлением новых
            await trx("tariffs_history")
                .where(knex.raw("DATE(date) = ?", [today]))
                .del();

            // Добавляем новые записи за сегодняшний день
            await trx("tariffs_history").insert(
                tariffs.map(t => ({
                    tariff_id: t.id,
                    value: t.value,
                    date: now, // Все записи получают одинаковую дату/время для дня
                }))
            );

            console.log(`Сохранено ${tariffs.length} записей в историю за ${today}`);
        }

        if (saveCurrent) {
            await trx("tariffs_current")
                .insert(
                    tariffs.map(t => ({
                        tariff_id: t.id,
                        value: t.value,
                        updated_at: now,
                    }))
                )
                .onConflict("tariff_id")
                .merge(["value", "updated_at"]);

            console.log(`Обновлено ${tariffs.length} текущих тарифов`);
        }

        await trx.commit();
        console.log('Данные успешно сохранены в БД');

    } catch (error) {
        await trx.rollback();
        console.error('Ошибка при сохранении данных в БД:', error);
        throw error;
    }
}
import axios from "axios";

const WB_API_KEY = ''; // токен из переменной окружения

export async function fetchTariffsFromWB() {
    try {
        const { data } = await axios.get(
            "https://common-api.wildberries.ru/api/v1/tariffs/box",
            {
                headers: {
                    "Authorization": `Bearer ${WB_API_KEY}`, // или X-API-KEY
                },
            }
        );
        return data.tariffs; // массив тарифов [{ id, value }]
    } catch (err) {
        throw err;
    }
}
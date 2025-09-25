import axios from "axios";

const WB_API_KEY = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjIwMjUwNTIwdjEiLCJ0eXAiOiJKV1QifQ.eyJlbnQiOjEsImV4cCI6MTc2NTY3MDIyOSwiaWQiOiIwMTk3NmU0Yy1mZTgwLTc1NDAtODkyMi02NGE5ZWUzYTU4MzYiLCJpaWQiOjQ1OTExNjA5LCJvaWQiOjExMzA0NiwicyI6MTA3Mzc0MTgzMiwic2lkIjoiOTMyYzE3NmEtNTA4NS01YzZmLWJjMzMtNGU4NGNkZjU4ZDdlIiwidCI6ZmFsc2UsInVpZCI6NDU5MTE2MDl9.wDoH8FLdZu1049uPCmhx3UHaw28YJB-CylWeD2LgkpRZFIMlOsUlnlVmfmYKy__JWNjfbDkOtdJ69QpSD5EKag'; // токен из переменной окружения

export async function fetchTariffsFromWB() {
    try {
        const date = new Date().toISOString().split('T')[0];
        const response = await axios.get(
            "https://common-api.wildberries.ru/api/v1/tariffs/box",
            {
                headers: {
                    "Authorization": `${WB_API_KEY}`, // или X-API-KEY
                },
                params: { // Add the 'date' as a query parameter
                    date: date// Use a valid, recent date
                }
            }
        );
        return response.data.response.data.warehouseList; // массив тарифов [{ id, value }]
    } catch (err) {
        throw err;
    }
}
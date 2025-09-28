# Проект выполненный по шаблону для выполнения тестового задания

Ссылка на шаблон https://github.com/lucard17/btlz-wb-test

Сcылка на тестовое задание https://docs.google.com/document/d/e/2PACX-1vTYfLgip1G1-GmLsU7T3RCmT52eoR1ZPOaSBkNWPCA0Db534AhNFm32lplolcTZGdHufBAjz_TrOrdZ/pub

Перед запуском докер контейнера нужно сгенерировать файл GoogleSheetsAPI(perfect-precept-433720-f3-23d6ba7a783b.json) и вставить его в папку src
Необходимо добавить импорт файла в файле googleSheets.ts на 11 строчке keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || "/app/dist/perfect-precept-433720-f3-23d6ba7a783b.json" или создать переменную в файле .env

В шаблоне настоены контейнеры для `postgres` и приложения на `nodejs`.  
Для взаимодействия с БД используется `knex.js`.  
В контейнере `app` используется `build` для приложения на `ts`, но можно использовать и `js`.

## Команды:

Запуск:
```bash
docker compose build
docker compose up -d
```

Для запуска приложения в режиме разработки:
```bash
npm run dev
```


##Проект выполненный по шаблону для выполнения тестового задания

ССылка на тестовое задание https://docs.google.com/document/d/e/2PACX-1vTYfLgip1G1-GmLsU7T3RCmT52eoR1ZPOaSBkNWPCA0Db534AhNFm32lplolcTZGdHufBAjz_TrOrdZ/pub

Перед запуском докер контейнера нужно сгенерировать файл GoogleSheetsAPI(perfect-precept-433720-f3-23d6ba7a783b.json) и вставить его в папку src

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


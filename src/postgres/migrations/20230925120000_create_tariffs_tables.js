/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema
        .createTable("tariffs_history", (table) => {
            table.increments("id").primary();
            table.string("tariff_id").notNullable();
            table.decimal("value", 10, 2).notNullable();
            table.date("date").notNullable().defaultTo(knex.fn.now());
        })
        .createTable("tariffs_current", (table) => {
            table.string("tariff_id").primary();
            table.decimal("value", 10, 2).notNullable();
            table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema
        .dropTableIfExists("tariffs_current")
        .dropTableIfExists("tariffs_history");
}

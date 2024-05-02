// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: "aws-0-us-west-1.pooler.supabase.com",
      user: "postgres.rdifswycioilqlusyfqk",
      password: "!GenAI-Map!!",
      database: "postgres",
      port: 5432,
    },
  },

  // staging: {
  //   client: "pg",
  //   connection: {
  //     host: "aws-0-us-west-1.pooler.supabase.com",
  //     user: "postgres.imyaahuvakpwgksjpjtl",
  //     password: "!GenAI-Map!!",
  //     database: "postgres",
  //     port: 5432,
  //   },
  // },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

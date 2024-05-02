// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    ///TESTING
    client: "pg",
    connection: {
      host: "aws-0-us-west-1.pooler.supabase.com",
      user: "postgres.rdifswycioilqlusyfqk",
      password: "!GenAI-Map!!",
      database: "postgres",
      port: 5432,
    },
  },

  production: {
    //PRODUCTION!
    client: "pg",
    connection: {
      host: "aws-0-us-west-1.pooler.supabase.com",
      user: "postgres.imyaahuvakpwgksjpjtl",
      password: "!GenAI-Map!!",
      database: "postgres",
      port: 5432,
    },
  },
};

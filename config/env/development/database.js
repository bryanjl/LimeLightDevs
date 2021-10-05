module.exports = ({ env }) => ({
    defaultConnection: 'default',
    connections: {
      default: {
        connector: 'mongoose',
        settings: {
          host: env('DATABASE_HOST', 'limelightdevs.5wq7a.mongodb.net'),
          srv: env.bool('DATABASE_SRV', true),
          port: env.int('DATABASE_PORT', 27017),
          database: env('DATABASE_NAME', 'LimeLightDevs'),
          username: env('DATABASE_USERNAME', 'limelightdevs'),
          password: env('DATABASE_PASSWORD', 'limelightdevs'),
        },
        options: {
          authenticationDatabase: env('AUTHENTICATION_DATABASE', null),
          ssl: env.bool('DATABASE_SSL', true),
        },
      },
    },
  });
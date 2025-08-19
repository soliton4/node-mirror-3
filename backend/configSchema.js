export const configSchema = {
  rootDir: {
    default: process.cwd(),
    cliFlag: '--dir',
    frontendVisible: false,
    readOnly: true,
    description: 'Virtual filesystem root',
  },
  password: {
    default: 'iamtostupidtochangemypassword',
    cliFlag: '--password',
    frontendVisible: false,
    readOnly: true,
    description: 'Login password',
  },
  port: {
    default: 3000,
    cliFlag: '--port',
    frontendVisible: true,
    readOnly: true,
    description: 'Backend HTTP port',
  },
  openaiapikey: {
    default: "",
    cliFlag: '--openaiapikey',
    frontendVisible: false,
    readOnly: true,
    description: 'api key for openai',
  },
  digitaloceanmodelkey: {
    default: "",
    cliFlag: '--digitaloceanmodelkey',
    frontendVisible: false,
    readOnly: true,
    description: 'api key for digitalocean serverless inference',
  },
};

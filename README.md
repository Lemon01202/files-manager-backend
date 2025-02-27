## Project setup

```bash
$ npm install
```

## Create `.env` and `config.json` File
Before running the project:
```bash
create a `.env` file in the root directory based on `.env.sample`
create a `config/config.json` file in the root directory based on `config/config.json`
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run migrations
```bash
npx sequelize-cli db:migrate
```


## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

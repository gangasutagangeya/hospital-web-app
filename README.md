## Commands

- Prisma format file

```sh
npx prisma formate
```

- To load prisma and generate DBML schema

```sh
npm prisma generate
```

- To seed again if we made anychanges

```sh
npx prisma db seed
```

- To genrate migrations use below command for new and when ever there is change
  in the schema file

```sh
npx prisma migrate dev --name connections
```

- To check the routes in the app

```sh
npx create-epic-app@latest
```

Push vs Deploy `Push` when experimenting locally, `migrate` when you're ready to
commit schema changes

- Creates individual migration files

```sh
npx prisma migrate deploy
```

- Use this command when developing in local

```sh
npx prisma db push
or
npx prisma migrate push
```

- Use to reset the database with data in seed.ts file

```sh
npx prisma migrate reset
```

- This command will delete all the data and construct from seed file again

```sh
npx prisma db seed
```

- one way to find and understand optimization opportunities is to use

```sh
EXPLAIN QUERY PLAN
```

```sh
EXPLAIN QUERY PLAN SELECT * FROM user WHERE name = 'Alice';

QUERY PLAN
`--SCAN user
```

- To find all the indexes in database

```sh
SELECT name from sqlite_master where type = "index";
```

## TODOs

- Add URIs to rate limiter code in server.ts

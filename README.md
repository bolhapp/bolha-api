# bolha

### setup

Project uses node >= 23.8 and yarn 4+

To setup yarn 4 run

- corepack enable
- yarn set version stable
- yarn install

### local

to start the api locally, you'll need a postgres connection, create a .env file based on .env.example and then run `yarn dev`


#### postgres docker

run a postgres container

`docker run --name bolha -e POSTGRES_PASSWORD=mysecretpassword -v bolha:/var/lib/postgresql/data -p 5432:5432 -d postgres`

connect to container

`docker exec -it bolha psql -U postgres`

create the database

`docker exec -it bolha psql -U postgres -c "CREATE DATABASE bolha;"`

##### Run migrations

Now that you have your DB, you need to populate it, run `yarn db:migrate`

## Running scripts

To run scripts you need to use `ts-node` and register the pathings. You can either do it using `yarn script <script path> ` or manually type `ts-node -r tsconfig-paths/register <script path>`

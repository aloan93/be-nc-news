# Northcoders News API

A RESTful backend API allowing interaction with a database of news articles, topics, comments and users.

hosted here --> https://northcoders-news-3948.onrender.com

## Getting Started

Before installing you will need to have Node.js, PostgreSQL and NPM installed on your machine. Instructions for doing this can be found at:
Node.js --> https://nodejs.org/en/download
PostgreSQL --> https://www.postgresql.org/docs/current/tutorial-install.html
NPM --> https://docs.npmjs.com/getting-started

### Step 1: Cloning

Clone this repository to your machine and navigate to the root directory with the following terminal commends:
git clone https://github.com/aloan93/be-nc-news.git
cd be-nc-news

### Step 2: Installing Dependencies

Install all the packages required to run this depositry via NPM using the following terminal command:

```
npm install
```

### Step 3: Creating and Seeding the Databases

Before creating and seeding the databases you will need to create two .env files so to connect to the correct database - one housing real data and the other housing slimmed down, fake data for testing purposes. Make sure you are in the root directory for the repositry and use the following terminal commands to create the files:

```
touch .env.development
touch .env.test
```

Into .env.development insert **PGDATABASE=nc_news** and into .env.test insert **PGDATABASE=nc_news_test**

Now you will be able to create and seed the databases, and for this purpose I have created some scripts to make the process easier.

First run the setup-dbs script to create the databases by using the following terminal command:

```
npm run setup-dbs
```

Next, run the seed script to seed the databases with data using the following terminal command:

```
npm run seed
```

### Step 4: Running Tests

If you wish to run the testing suits in this repositry you must now install the appropriate devDependencies. To do this, run the following command in the terminal:

```
npm install -D
```

Once done, you will be able to run the test suites, and for this purpose I have created another script:

```
npm run test
```

Alternatel, if you wish to run the application tests in isolation, you can use the following:

```
npm run test app
```

## Endpoints

For a breakdown of available endpoints with this application please see the endpoints.json file that details each with a desciption and example response.

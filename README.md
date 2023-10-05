# Northcoders News API

For instructions, please head over to [L2C NC News](https://l2c.northcoders.com/courses/be/nc-news).

.env files are required so to connect locally to the correct database. In the home directory create two of these files:

1. .env.test -> into this add PGDATABASE=nc_news_test
2. .env.development -> into this add PGDATABASE=nc_news

A RESTful backend API allowing interaction with a database of news articles, topics, comments and users.

hosted here --> https://northcoders-news-3948.onrender.com

## Getting Started

Before installing you will need to have Node.js and NPM installed on your machine. Instructions for doing this can be found at:
Node.js --> https://nodejs.org/en/download
NPM --> https://docs.npmjs.com/getting-started

### Step 1: Cloning

Clone this repository to your machine and navigate to the root directory with the following terminal commends:
git clone https://github.com/aloan93/be-nc-news.git
cd be-nc-news

### Step 2: Installing Dependencies

Install all the packages required to run this depositry via NPM using the following terminal command:
npm install

### Step 3: Creating and Seeding the Databases

Before creating and seeding the databases you will need to create two .env files so to connect to the correct database - one housing real data and the other housing slimmed down, fake data for testing purposes. Make sure you are in the root directory for the repositry and use the following terminal commands to create the files:
touch .env.development
touch .env.test
Into .env.development insert PGDATABASE=nc_news and into .env.test insert PGDATABASE=nc_news_test

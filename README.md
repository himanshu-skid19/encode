
<h1 align="center">Next-Level NPS - Revolutionizing Feedback Mechanisms</h1>
<h3 align = "center">Team Name - Team 15</h3>

## Introduction
The challenge is to develop an AI-powered snap-in for NPS Survey collection, storage and analytics mechanisms. The solution leverage the capabilities of the DevRev platform, utilizing its APIs.

## Project Objectives

### 1. Scheduled & Customized NPS Survey

Our aim here was to build a mechanism to create a customized NPS Survey and send it out at pre decided intervals to a pre decided audience and collect the survey results. Our NPS Survey form has different lines of questioning for promoters, passives and detractors along with several other customizations based on the inputs taken from the snap-in configuration page. We take as input the survey frequency and start date in the snap-in configuraton page. Based on configuration page inputs, we decide the filters (arguments) for the rev-users list api to determine the audience.


### 2. Meaningful Analytics & Insights

We do sentiment analysis of the customer survey response and also determine if it has any actionable insights in real-time. A summary report of collected responses is maintained which is timely updated. This report highlights the specific key issues and their related features. We also highlight positive feedback and features which receive praises. A dashboard is provided to visualize the derived analytics, like nps score over time, distribution of promoters, passives and detractors and also wordclouds to focus on positive and negative feedback separately.


### 3. Dealing with Spam Surveys

We've incorporated a CAPTCHA verification step at the start of our survey form to prevent automated bots from accessing it. We also use honeypot fields as an additional layer of security against bots. Additionally, we request survey participants to provide their email addresses, enabling us to ensure that only one survey response can be submitted from a given email within a predetermined timeframe. We also use LLMs to figure out if the review contains any actionable insights or not. This helps us filter out the spam surveys/ surveys without any meaningful insights. 


### 4. Protecting Customer Information
We create our own survey form using the MERN stack instead of a third-party survey creator. We also do not collect any demographic information from the responses and maintain our own database in MongoDB. Open-source LLMs that we deploy can be used to further ensure that customer information is protected.

### 5. Continuous Improvement Cycle.

We've implemented an automated ticket generation system that works in real-time. For every actionable response with a negative sentiment, a ticket will be created using the works create api where we have used LLMs to generate the title, its severity and figure out the PART it belongs to. Along with that we used several API calls to determine the other parameters that are to be filled. A report/summary, created by LLMs, that summarizes the overall feedback is also maintained. It is dynamically updated in real-time as new responses come in, keeping in mind old summary and new responses.



## Installation and Setup

### Installing the Snap-in
Follow the instructions mentioned in the [Devrev Snap-in documentation](https://docs.devrev.ai/snap-ins/start#prerequisites) to install our snap-in<br><br>
Refer to `snap-in_env.txt` in our [Google Drive Submission](https://drive.google.com/drive/folders/1S6QwV1bT-YR1H58r7wc6rgeZJSqAYS5V?usp=sharing)<br>
In the `snap-in` directory, go to `code/src/functions/function_1/env.ts` and change the API keys as follows.
```
export const SENDGRID_API_KEY = "insert SENDGRID_API_KEY here"
.
.
.
.
.
.
export const GITHUB_AUTH = "insert GITHUB_AUTH here";
```
The code for our snap-in (in the format provided in the documentation) is available in the **snap-in folder** and here:<br>
https://github.com/SpyzzVVarun/encode-devrev-snap-in 

### Survey Form Generation

We use Render for deployment of our generated survey form. You will have to put a .env file in the root directory with the following parameters filled:

```
1. OPENAI_API_KEY=<Insert OPENAI key here>
2. MONGODB_URI="mongodb+srv://username:password@cluster0.ycuyumn.mongodb.net/Database_name?retryWrites=true&w=majority"
3. PORT=3001
```

The code for the survey form is available in the **survey-form folder** and here:<br>
https://github.com/SpyzzVVarun/survey-form-deploy

### Analytics Dashboard Generation

We again use Render to deploy our generated analytics dashboard . You will have to create and fill `credentials.json` in the src directory with the following parameters filled:

```json
{
    "OPENAI_API_KEY": "<Insert OPENAI key here>",
    "MONGODB_URI": "mongodb+srv://username:password@cluster0.ycuyumn.mongodb.net/Database_name?retryWrites=true&w=majority"
}
```
The code for the survey form is available in the **analytics-dashboard** folder and here:<br>
https://github.com/Parth-Agarwal216/render-nps

## Solution Pipeline & Usage Guide

1. The owner installs the snap-in in the DevRev platform. 
2. We provide a configuration page for the snap-in (for more details and customization refer to the manifest.yaml file) where we provide the owner with option to customize various aspects of the survey form and the snap in. 
    - We ask the owner to submit their PAT token which is used in an API call to create the mailing list. We create the mailing list for the survey form using the `rev-users.list` API (other DevRev or personal APIs also possible) with filters and arguments that can be taken from the configuration page.
    - We ask the owner to modify various aspects of the survey form including changing the email through which the survey form will be sent, name of the company, Name of the product and other content of the survey form for customizaton.  
    - We also ask the owner to configure the settings for the slack and PLuG integrations.
    - We provide the owner with the option to select when the survey should be first distributed, how often it is distributed and how often the system should check the status of survey distributions and responses.


https://github.com/SpyzzVVarun/encode/assets/118837763/47088d97-47ba-4fe7-9a75-5c47cdce422f

3. For survey distribution, the owner must create a "Surveys" product (PART) and then create an issue under this PART to generate and send the survey to the mailing list. The link to the survey form and analytics dashboard is also made available to the survey form owner via ths issue discussion section.

4. The survey form has been created by us using MERN stack with various customizations in terms of the lines of questioning. We have also added a CAPTCHA functionality and honeypot fields to protect against spamming by automated bots. Responses from the surveys are stored in a MongoDB collection under the `DevRev-Surveys` database. The collection name for each survey is defined as the `companyName_servuct_index` where the index refers to the index of survey iteration (for periodic surveys) and servuct refers to the service/product name.

5. Our solution offers real-time AI analysis capabilities, including sentiment analysis, identification of whether the reviews contain actionable insights, and automated ticket creation, all facilitated by large language models (LLMs). For every actionable response with a negative sentiment, a ticket will be created, in realtime,  using the `works.create` API where we have used LLMs to generate the title, its severity and figure out the PART it belongs to by getting the list of sub-parts of the part using the `parts-list` API whose survey is being conducted and prompting an LLM to figure out the exact part. Along with that we used several API calls to determine the other parameters that are to be filled like owned_by using `dev-users.self`. 

7. On the analytics side, A summary/report is generated and updated in batches, with the dashboard reflecting these updates at predetermined intervals.
The summary is created by LLMs to summarize the overall feedback. It is dynamically updated as new responses come in, keeping in mind old summary and new responses.
Various basic statistics based on NPS responses are also available in the dashboard as can be seen in the demo video and dashboard video below.

https://github.com/SpyzzVVarun/encode/assets/106423963/30db4bfb-3075-4810-aeeb-a4d47c11c73c

## Project Architecture

```
├── README.md
├── analytics-dashboard
│   ├── app.py
│   ├── credentials.json
│   └── summary.py
├── snap-in
│   ├── code
│   │   ├── README.md
│   │   ├── babel.config.js
│   │   ├── build.tar.gz
│   │   ├── dist
│   │   ├── jest.config.js
│   │   ├── nodemon.json
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── fixtures
│   │   │   │   ├── command_event.json
│   │   │   │   ├── function_1_event.json
│   │   │   │   └── function_2_event.json
│   │   │   ├── function-factory.ts
│   │   │   ├── functions
│   │   │   │   ├── function_1
│   │   │   │   │   ├── env.ts
│   │   │   │   │   ├── index.test.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── function_2
│   │   │   │       ├── index.test.ts
│   │   │   │       └── index.ts
│   │   │   ├── index.ts
│   │   │   ├── main.ts
│   │   │   └── test-runner
│   │   │       ├── example.test.ts
│   │   │       └── test-runner.ts
│   │   ├── trial.js
│   │   ├── trial.ts
│   │   ├── tsconfig.eslint.json
│   │   └── tsconfig.json
│   ├── manifest.yaml
│   └── package.json
└── survey-form
    ├── backend
    │   ├── constants.json
    │   ├── package.json
    │   ├── server.js
    │   └── trial.js
    ├── client
    │   ├── README.md
    │   ├── package.json
    │   ├── public
    │   │   └── index.html
    │   └── src
    │       ├── SurveyComponent.jsx
    │       ├── constants.json
    │       ├── index.css
    │       ├── index.js
    │       ├── json.js
    │       └── theme.js
    └── package.json
```

### Snap-in 
This directory follows the same structure as the templates provided in the resources. 
- The main modified code is in the `function_1` directory (`snap-in/code/src/functions/function_1/`). `index.ts` contains all the snap-in logic and `env.ts` stores some configuration constants.
- The `manifest.yaml` file contains the specifications for the configuration page

### Survey-Form
MERN-stack based survey form application

`Backend` This directory contains the server-side code of your application.
- `constants.json`  A configuration file storing config values, survey name and the recieved PAT token used in the backend.
- `server.js` The main server file which initializes and runs the backend server, handling API requests (LLM + DevRev).

`Client` This directory is a standard `create-react-app` directory which contains the client-side code, which is what users interact with in their web browsers.
- `SurveyComponent.jsx` A React component, the main component for rendering the captcha and survey form.
- `constants.json` A configuration file for the client-side that stores the surevy form customizations based on configuration page inputs.
- `index.css` The main stylesheet for the web application, centers the captcha and button div.

### Analytics Dashboard 
This directory contains the dashboard app code, which is deployed using render app.

- `app.py` Python app for the survey analytics dashboard built using dash & plotly.
- `summary.py` Contains code to create or update the summary of the survey responses dynamically using LLMs.
- `credentials.json` JSON file containing mongoDB URI and other API keys.

## Demo Video

https://github.com/SpyzzVVarun/encode/assets/95134445/5c26fb84-8139-4f6e-afee-2c4435e4e915

Link to Demo Video: https://drive.google.com/file/d/17YharkmL-dOdl3Ja4BmUkyAkYfDPJRlZ/view?usp=sharing

## Team Members

1. Varun Nagpal - [@SpyzzVVarun](https://github.com/SpyzzVVarun)
2. Aditya Gupta - [@aditya-gupta-04](https://github.com/aditya-gupta-04)
3. Himanshu Singhal - [@himanshu-skid19](https://github.com/himanshu-skid19)
4. Parth Agarwal - [@Parth-Agarwal216](https://github.com/Parth-Agarwal216)

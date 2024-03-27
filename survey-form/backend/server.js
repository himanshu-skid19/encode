// Import necessary modules and libraries
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
require("dotenv").config({ path: '../.env' });

// Create an Express application
const app = express();
app.use(cors()); // Enable CORS for your server
app.use(express.json());

// Initialize OpenAI API
const { OpenAI } = require('openai');
const openai = new OpenAI();

// Connect to MongoDB using the provided URI
mongoose.connect(process.env.MONGODB_URI);

// Define a schema for the survey data
const surveySchema = new mongoose.Schema({
    surveyData: mongoose.Schema.Types.Mixed,
});

// Specify the path to your JSON file
const filePath = 'constants.json';

let collectionName = '';
let PAT = '';

// Read the JSON file synchronously and set the collectionName and PAT
try {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonObject = JSON.parse(data);
  collectionName = jsonObject["survey"];
  PAT = jsonObject["PAT"];
} catch (error) {
  console.error('Error reading or parsing JSON:', error);
  collectionName = 'Maple_Finance_Gateway_0'; // Default collection name (pre populated with responses)
}

// Create a model based on the schema
const Survey = mongoose.model('Survey', surveySchema, collectionName);

// Header for DevRev API requests
const headers = {
  'Authorization': PAT,
};

// Async function to call an API and handle any errors
async function callAPI(apiUrl, headers) {
  try {
    const response = await axios.get(apiUrl, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Endpoint to receive survey data
app.post('/submit-survey', async (req, res) => {
  try {
    // Extract survey text based on conditions
    let surveyText = "";
    if (req.body["improvements-required"] === undefined) {
      surveyText = req.body["disappointing-experience"];
    } else {
      surveyText = req.body["improvements-required"];
    }

    // Perform sentiment analysis on the survey text
    const completion = await openai.chat.completions.create({
      messages: [{ role: "assistant", content: "Perform sentiment analysis on the following review. Return a JSON with the key Sentiment and the value being one of positive, negative or neutral. Review: " + surveyText }],
      model: "gpt-3.5-turbo",
    });

    // Extract sentiment result from OpenAI response and add it to the request body
    const sentimentResult = JSON.parse(completion.choices[0].message.content);
    req.body.sentiment = sentimentResult["Sentiment"];

    // Perform another analysis to identify if the review contains actionable insights
    const completionAgain = await openai.chat.completions.create({
      messages: [{ role: "assistant", content: "Identify whether the following review contains any actionable insights. Return a JSON with the key Actionable and the value being one of yes or no. Review: " + surveyText }],
      model: "gpt-3.5-turbo",
    });

    // Extract actionable insights result from OpenAI response and add it to the request body
    const actionableResult = JSON.parse(completionAgain.choices[0].message.content);
    req.body.actionable = actionableResult["Actionable"];

    req.body.summarised = false; // Set a default value
    req.body.date = "14-12-2023"; // Set a default date

    // Save response to the database
    const newSurvey = new Survey({
      surveyData: req.body,
    });
    await newSurvey.save();
    res.status(200).send('Survey data saved successfully');

    // If the review is both actionable and negative, perform automatic ticket creation
    if (req.body.actionable === "yes" && req.body.sentiment === "negative") {
      (async () => {
        try {
          // Summarize the negative issue from the review to create the ticket title
          const completionv3 = await openai.chat.completions.create({
            messages: [{ role: "assistant", content: "Summarize the issue given below in one line. Your answer should be concise and short. Issue: " + surveyText }],
            model: "gpt-3.5-turbo",
          });
          const title = completionv3.choices[0].message.content;
          console.log(title);

          // Identify the severity of the issue from the review
          const completionv4 = await openai.chat.completions.create({
            messages: [{ role: "assistant", content: "Identify the severity of the issue from the given customer review. Return a JSON with the key severity and the value being one of low, medium, high, blocker. Review: " + surveyText }],
            model: "gpt-3.5-turbo",
          });

          const severity = JSON.parse(completionv4.choices[0].message.content)["severity"];

          // Fetch data from APIs and process it
          const apiUrl1 = "https://api.devrev.ai/dev-users.self";
          const apiUrl2 = "https://api.devrev.ai/parts.list";

          const data1 = await callAPI(apiUrl1, headers);
          if (data1.error === "error") {
            console.log("Error in the first API call");
            return;
          }
          const ownedBy = [data1.dev_user.id]; // owned_by

          const data2 = await callAPI(apiUrl2, headers);
          if (data2.error === "error") {
            console.log("Error in the second API call");
            return;
          }
          const partsList = data2.parts;
          let strPartsList = "[";
          for (let part of partsList) {
            strPartsList = strPartsList + part.name + ", ";
          }
          strPartsList = strPartsList + "]"; // parts list

          // Figuring out the exact part to which the customer review points and will be used to create the ticket
          const completionv5 = await openai.chat.completions.create({
            messages: [{ role: "assistant", content: "Classify the following customer review in one of the product category from this list of categories: " + strPartsList + "Return a JSON with the key category and value being the category name. Review: " + surveyText }],
            model: "gpt-3.5-turbo",
          });
          const partsName = JSON.parse(completionv5.choices[0].message.content)["category"];

          let appliesToPart = "";
          for (let part of partsList) {
            if (part.name === partsName) {
              appliesToPart = part.id;
            }
          }

          // Create a request body for creating a ticket
          const postRequestBody = {
            title: title,
            type: "ticket",
            body: surveyText,
            severity: severity,
            owned_by: ownedBy,
            applies_to_part: appliesToPart
          };

          console.log(postRequestBody);

          // Send a POST request to create a ticket
          const postApiUrl = "https://api.devrev.ai/works.create";
          const postHeaders = {
            "Content-Type": "application/json",
            'Authorization': PAT,
          };
          const response = await axios.post(postApiUrl, postRequestBody, { headers: postHeaders });

          // Handle the response of the POST request here
          console.log(response.data);
        } catch (error) {
          console.error("An error occurred:", error);
        }
      })();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error saving survey data');
  }
});

// Define the port for the Express server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

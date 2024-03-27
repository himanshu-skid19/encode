// const fs = require('fs');

// // Specify the path to your JSON file
// const filePath = 'constants.json';

// let collectionName = ''; // Initialize collectionName

// // Read the JSON file synchronously and set the collectionName
// try {
//   const data = fs.readFileSync(filePath, 'utf8');
//   const jsonObject = JSON.parse(data);
// //   console.log(jsonObject);
//   collectionName = jsonObject["company"];
// } catch (error) {
//   console.error('Error reading or parsing JSON:', error);
//   collectionName = 'test'; // Set a default collection name
// }

// console.log(collectionName)


// // // Read the JSON file
// // const collection = fs.readFile(filePath, 'utf8', (err, data) => {
// //   if (err) {
// //     console.error('Error reading the file:', err);
// //     return "test";
// //   }
// //   try {
// //     // Parse the JSON data into an object
// //     const jsonObject = JSON.parse(data);
// //     // You can now work with the jsonObject as a regular JavaScript object
// //     console.log(jsonObject);
// //     return jsonObject["company"];
// //   } catch (error) {
// //     console.error('Error parsing JSON:', error);
// //     return "test";
// //   }
// // });

// console.log(JSON.parse('{\n  "Sentiment": "negative"\n}')["Sentiment"]);

// You need to use await here since callAPI is asynchronous
// const resultPromise = (async () => {
//     const data = await callAPI(apiUrl, headers);
//     let result;
  
//     if (data.error === "error") {
//       result = "ERROR";
//     } else {
//       result = data.dev_user.id; // owned_by
//     }
  
//     return result;
//   })();
  
//   resultPromise.then((result) => {
//     console.log(result);
//   });

const axios = require('axios');
const headers = {
    'Authorization': 'eyJhbGciOiJSUzI1NiIsImlzcyI6Imh0dHBzOi8vYXV0aC10b2tlbi5kZXZyZXYuYWkvIiwia2lkIjoic3RzX2tpZF9yc2EiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOlsiamFudXMiXSwiYXpwIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6OmRldnUvMSIsImV4cCI6MTc5ODk2NTAwOSwiaHR0cDovL2RldnJldi5haS9hdXRoMF91aWQiOiJkb246aWRlbnRpdHk6ZHZydi11cy0xOmRldm8vc3VwZXI6YXV0aDBfdXNlci9vaWRjfHBhc3N3b3JkbGVzc3xlbWFpbHw2NTRiYmIyY2FkZGY2YTg3ZmViN2RkNjkiLCJodHRwOi8vZGV2cmV2LmFpL2F1dGgwX3VzZXJfaWQiOiJvaWRjfHBhc3N3b3JkbGVzc3xlbWFpbHw2NTRiYmIyY2FkZGY2YTg3ZmViN2RkNjkiLCJodHRwOi8vZGV2cmV2LmFpL2Rldm9fZG9uIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6IiwiaHR0cDovL2RldnJldi5haS9kZXZvaWQiOiJERVYtaWN1M1ZKN3oiLCJodHRwOi8vZGV2cmV2LmFpL2RldnVpZCI6IkRFVlUtMSIsImh0dHA6Ly9kZXZyZXYuYWkvZGlzcGxheW5hbWUiOiJuLXZhcnVuIiwiaHR0cDovL2RldnJldi5haS9lbWFpbCI6Im4udmFydW5AaWl0Zy5hYy5pbiIsImh0dHA6Ly9kZXZyZXYuYWkvZnVsbG5hbWUiOiJWYXJ1biBOYWdwYWwiLCJodHRwOi8vZGV2cmV2LmFpL2lzX3ZlcmlmaWVkIjp0cnVlLCJodHRwOi8vZGV2cmV2LmFpL3Rva2VudHlwZSI6InVybjpkZXZyZXY6cGFyYW1zOm9hdXRoOnRva2VuLXR5cGU6cGF0IiwiaWF0IjoxNzA0MzU3MDA5LCJpc3MiOiJodHRwczovL2F1dGgtdG9rZW4uZGV2cmV2LmFpLyIsImp0aSI6ImRvbjppZGVudGl0eTpkdnJ2LXVzLTE6ZGV2by9pY3UzVko3ejp0b2tlbi8zb2RQZ1pqZiIsIm9yZ19pZCI6Im9yZ19uU20wdWpTQk0xcmp4Z3Z0Iiwic3ViIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6OmRldnUvMSJ9.0oyFzajxkYqBGoluxRYMDIKoOCEtCbq0FJdfgzZMpn2j3imzrvkWkJs0XpRW4Wjg7Jien1I6U0Ee19-TuzhHOtiYBUIaTG0H_yw5zOqO0DSknU--smi9Dok6-bhIQg1KL2eNQJZZ-wQ3Z9UcRwrs3Nwfpb8cWU2yn4UHsWG67bFZps2Pk5CRQONmlGGleWMF97UK84i2QIhJ5kscNqJ0e6moraEyLw389fJiuUl8IF_26zwua-JMAbbYpP-xbPPUIokHCwLVd6ZLYLxD2jhIAJnqGx9bUvDz2BzZhBAFaQmmewtZ9NSkJLQouK34VZMU_6mii9777kMR75wIjhNcLg',
};
async function callAPI(apiUrl, headers) {
  try {
    const response = await axios.get(apiUrl, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
}

(async () => {
  try {
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
    const appliesToPart = data2.parts[0].id;

    const postRequestBody = {
      title: "Dummy Ticket V1",
      type: "ticket",
      owned_by: ownedBy,
      applies_to_part: appliesToPart
    };

    const postApiUrl = "https://api.devrev.ai/works.create"; 
    const postHeaders = {
      "Content-Type": "application/json",
      'Authorization': 'eyJhbGciOiJSUzI1NiIsImlzcyI6Imh0dHBzOi8vYXV0aC10b2tlbi5kZXZyZXYuYWkvIiwia2lkIjoic3RzX2tpZF9yc2EiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOlsiamFudXMiXSwiYXpwIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6OmRldnUvMSIsImV4cCI6MTc5ODk2NTAwOSwiaHR0cDovL2RldnJldi5haS9hdXRoMF91aWQiOiJkb246aWRlbnRpdHk6ZHZydi11cy0xOmRldm8vc3VwZXI6YXV0aDBfdXNlci9vaWRjfHBhc3N3b3JkbGVzc3xlbWFpbHw2NTRiYmIyY2FkZGY2YTg3ZmViN2RkNjkiLCJodHRwOi8vZGV2cmV2LmFpL2F1dGgwX3VzZXJfaWQiOiJvaWRjfHBhc3N3b3JkbGVzc3xlbWFpbHw2NTRiYmIyY2FkZGY2YTg3ZmViN2RkNjkiLCJodHRwOi8vZGV2cmV2LmFpL2Rldm9fZG9uIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6IiwiaHR0cDovL2RldnJldi5haS9kZXZvaWQiOiJERVYtaWN1M1ZKN3oiLCJodHRwOi8vZGV2cmV2LmFpL2RldnVpZCI6IkRFVlUtMSIsImh0dHA6Ly9kZXZyZXYuYWkvZGlzcGxheW5hbWUiOiJuLXZhcnVuIiwiaHR0cDovL2RldnJldi5haS9lbWFpbCI6Im4udmFydW5AaWl0Zy5hYy5pbiIsImh0dHA6Ly9kZXZyZXYuYWkvZnVsbG5hbWUiOiJWYXJ1biBOYWdwYWwiLCJodHRwOi8vZGV2cmV2LmFpL2lzX3ZlcmlmaWVkIjp0cnVlLCJodHRwOi8vZGV2cmV2LmFpL3Rva2VudHlwZSI6InVybjpkZXZyZXY6cGFyYW1zOm9hdXRoOnRva2VuLXR5cGU6cGF0IiwiaWF0IjoxNzA0MzU3MDA5LCJpc3MiOiJodHRwczovL2F1dGgtdG9rZW4uZGV2cmV2LmFpLyIsImp0aSI6ImRvbjppZGVudGl0eTpkdnJ2LXVzLTE6ZGV2by9pY3UzVko3ejp0b2tlbi8zb2RQZ1pqZiIsIm9yZ19pZCI6Im9yZ19uU20wdWpTQk0xcmp4Z3Z0Iiwic3ViIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6OmRldnUvMSJ9.0oyFzajxkYqBGoluxRYMDIKoOCEtCbq0FJdfgzZMpn2j3imzrvkWkJs0XpRW4Wjg7Jien1I6U0Ee19-TuzhHOtiYBUIaTG0H_yw5zOqO0DSknU--smi9Dok6-bhIQg1KL2eNQJZZ-wQ3Z9UcRwrs3Nwfpb8cWU2yn4UHsWG67bFZps2Pk5CRQONmlGGleWMF97UK84i2QIhJ5kscNqJ0e6moraEyLw389fJiuUl8IF_26zwua-JMAbbYpP-xbPPUIokHCwLVd6ZLYLxD2jhIAJnqGx9bUvDz2BzZhBAFaQmmewtZ9NSkJLQouK34VZMU_6mii9777kMR75wIjhNcLg',
    };
    const response = await axios.post(postApiUrl, postRequestBody, { headers: postHeaders });

    // Handle the response of the POST request here
    console.log(response.data);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();


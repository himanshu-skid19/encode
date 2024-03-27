// Imports
import axios from 'axios'
import { client } from "@devrev/typescript-sdk";
import sgMail from '@sendgrid/mail';
import { Octokit } from "@octokit/rest";
import * as _ from './env'
import { check } from 'yargs';
sgMail.setApiKey(_.SENDGRID_API_KEY);

/**
 * Retrieves a mailing list from a specified API endpoint.
 *
 * @param {string} apiUrl - The URL of the API endpoint to fetch the mailing list from.
 * @param {Record<string, string>} headers - Headers to include in the HTTP request.
 * @returns {Promise<{ name: string; email: string }[]>} - A Promise that resolves to an array of mailing list entries containing name and email.
 */
async function createMailingList(apiUrl: string, headers: Record<string, string>): Promise<{ name: string; email: string }[]> {
  try {
    const response = await axios.get(apiUrl, { headers });
    const data = response.data;

    interface User {
      name: string;
      email: string;
    }

    const userList: User[] = data.rev_users;
    let mailingList: { name: string; email: string }[] = [];

    for (let user of userList) {
      if (user.email !== undefined && user.name !== undefined) {
        mailingList.push({ name: user.name, email: user.email });
      }
      else if (user.email !== undefined){
        mailingList.push({ name: "customer", email: user.email });
      }
    }

    return mailingList;
  } catch (error) {
    console.error('Error:', error);
    return [{ name: "error", email: "error" }];
  }
}

/**
 * Sends an email to a specified recipient.
 *
 * @param {string} mailId - The email address of the recipient.
 * @param {number} startDate - The start date for the email.
 * @param {string} servuct - The name of the service/product.
 * @param {string} companyName - The name of the company.
 * @param {string} customerName - The name of the customer.
 */
async function sendMail(mailId: string, startDate: number, servuct: string, companyName: string, customerName: string) {
  // Draft message
  const msg = {
    to: mailId,
    from: _.mailSender,
    subject: `Share Your Experience with ${servuct} - Your Feedback Matters!`,
    // sendAt: startDate,
    html: `<p>Dear ${customerName},</p>
    <p>At ${companyName}, we're always striving to enhance ${servuct} to meet your needs. Your feedback is vital in guiding our efforts and ensuring we deliver the best experience possible with ${servuct}. We invite you to participate in our survey about ${servuct}. </p>
    <p>It won't take more than a few minutes, and your insights will directly influence the improvements we make.</p>
    <p><a href="${_.surveyLink}">${_.surveyLink}</a></p>
    <p>Your responses will remain confidential and will be used solely for improving ${servuct} and understanding our customers better. As part of our commitment to continuous improvement, we highly value your opinion and look forward to your valuable feedback on ${servuct}. </p>
    <p>Thank you for being a part of the ${companyName} community and for using [Service/Product Name]. Your input is instrumental in shaping our future.</p>
    <p>Warm regards,<br>The ${companyName} Team</p>`,
  };

  // Send the email
  try {
    await sgMail.send(msg);
    console.log('Email sent to', mailId);
  } catch (error: any) {
    console.error('Error sending email to', mailId, ':', error);
  }
}

/**
 * Commits changes to a JSON file hosted in a GitHub repository. Used with the backend and client directories in our survey-form repository, 
 * to update the parameters dependent on the config page inputs.
 *
 * @param {string} filePath - The path to the JSON file in the repository.
 * @param {Record<string, any>} updates - Key-value pairs representing updates to be applied to the JSON file.
 */
async function commitJsonChange(filePath: string, updates: Record<string, any>) {
  
  const fetch = await import("node-fetch");
  const octokit = new Octokit({ auth: _.GITHUB_AUTH, request: {fetch}});

  try {
      // Fetch the current JSON file
      const { data: fileData } = await octokit.repos.getContent({
          owner: _.owner,
          repo: _.repo,
          path: filePath,
      });

      if ('content' in fileData && 'sha' in fileData) {
          const sha = fileData.sha;
          let jsonContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
      
          // Update the JSON content
          for (const [key, value] of Object.entries(updates)) {
              jsonContent[key] = value;
          }
      
          // Commit the updated JSON file
          await octokit.repos.createOrUpdateFileContents({
              owner: _.owner,
              repo: _.repo,
              path: filePath,
              message: `Update JSON configuration in ${filePath}`,
              content: Buffer.from(JSON.stringify(jsonContent, null, 2)).toString('base64'),
              sha,
          });
      
          console.log(`${filePath} updated successfully`);
      } else {
          console.error(`Error: ${filePath} is not a file or does not exist`);
      }
  } catch (error) {
      console.error(`Error updating ${filePath}:`, error);
  }
}


async function handleEvent(
  event: any,
) {
  const devrevPAT = event.context.secrets.service_account_token;
  const API_BASE = event.execution_metadata.devrev_endpoint;
  
  const devrevSDK = client.setup({
    endpoint: API_BASE,
    token: devrevPAT,
  })

  // Extracting config page inputs
  const workCreated = event.payload.work_created.work;
  const startDate = event.input_data.global_values.start_date;
  const PAT = event.input_data.global_values.pat;
  const servuct = event.input_data.global_values.survey_config[2];
  const improvements = event.input_data.global_values.survey_config[3];
  const disappointing = event.input_data.global_values.survey_config[5];
  let checkboxes = [];
  for(let i = 6; i<15; i++){
    if(event.input_data.global_values.survey_config[i] === undefined){
      break;
    }
    checkboxes.push(event.input_data.global_values.survey_config[i]);
  }
  const companyName = event.input_data.global_values.survey_config[1];
  let creatorName = workCreated.created_by.name
  if (creatorName === undefined){
    creatorName = event.input_data.global_values.survey_config[0];
  }
  
  // Message to be sent by the DevRev bot in the issue discussion section
  let bodyComment = `
  Survey has been created by ${creatorName}.\n 
  Here is the Link to the Survey Form: ${_.surveyLink}.\n
  Here is the Link to the Analytics Dashboard: ${_.analyticsLink}.
  `; 
  
  // Define the updates to be made
  const jsonUpdatesBackend = {
    'survey': companyName + "_" + servuct + "_0",
    'PAT': PAT
  };
  // Path to the JSON file in the repository
  const jsonFilePathBackend = 'backend/constants.json';  

  // Define the updates to be made
  const jsonUpdatesClient = {
    "productName" : servuct,
    "disappointing" : disappointing,
    "improvements" : improvements,
    "checkboxes" : checkboxes
  };
  // Path to the JSON file in the repository
  const jsonFilePathClient = 'client/src/constants.json';  

  const body = {
    object: workCreated.id,
    type: 'timeline_comment',
    body:  bodyComment,
  }
  const loadBody = {
    object: workCreated.id,
    type: 'timeline_comment',
    body:  "Sending Customized Survey Form and Preparing Analytics Dashboard...",
  }
  const headers = {
    'Authorization': PAT
  };
  const mailingList: { name: string; email: string }[] = await (async () => {
      const mailingList: { name: string; email: string }[] = await createMailingList(_.apiURL, headers);
      return mailingList;
  })();  

  // If an issue is created under the part "Surveys"
  if ((workCreated.type == "issue" && mailingList[0].name !== "error" && workCreated.applies_to_part.name == "Surveys")){
    await commitJsonChange(jsonFilePathBackend, jsonUpdatesBackend);
    await commitJsonChange(jsonFilePathClient, jsonUpdatesClient);
    // const loading = await devrevSDK.timelineEntriesCreate(loadBody as any);
    // setTimeout(async () => {
    //     const response = await devrevSDK.timelineEntriesCreate(body as any);
    //     const mailPromises = mailingList.map(mailId => 
    //         sendMail(mailId.email, startDate, servuct, companyName, mailId.name));
        
    //     Promise.all(mailPromises).then(() => {
    //         console.log('All emails sent');
    //     });
    // }, 180000);

    const response = await devrevSDK.timelineEntriesCreate(body as any);
    const mailPromises = mailingList.map(mailId => sendMail(mailId.email, startDate, servuct, companyName, mailId.name));
    Promise.all(mailPromises).then(() => {
      console.log('All emails sent');
    });
    return response;
  }
  if ((workCreated.type == "issue" && mailingList[0].name !== "error" && workCreated.applies_to_part.name == "Surveys")){
    const rejectBody = {
      object: workCreated.id,
      type: 'timeline_comment',
      body:  "Survey not sent to the entire mailing list",
    }
    const rejectResponse = await devrevSDK.timelineEntriesCreate(rejectBody as any);
    return rejectResponse;
  }
  
  return undefined;
  
}

export const run = async (events: any[]) => {
  console.info('events', JSON.stringify(events), '\n\n\n');
  for (let event of events) {
    const resp = await handleEvent(event);
    // console.log(JSON.stringify(resp.data));
  }
};

export default run;


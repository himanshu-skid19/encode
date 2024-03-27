"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
// Imports
const axios_1 = __importDefault(require("axios"));
const typescript_sdk_1 = require("@devrev/typescript-sdk");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const rest_1 = require("@octokit/rest");
const _ = __importStar(require("./env"));
mail_1.default.setApiKey(_.SENDGRID_API_KEY);
function createMailingList(apiUrl, headers) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(apiUrl, { headers });
            const data = response.data;
            const userList = data.rev_users;
            let mailingList = [];
            for (let user of userList) {
                if (user.email !== undefined && user.name !== undefined) {
                    mailingList.push({ name: user.name, email: user.email });
                }
                else if (user.email !== undefined) {
                    mailingList.push({ name: "customer", email: user.email });
                }
            }
            return mailingList;
        }
        catch (error) {
            console.error('Error:', error);
            return [{ name: "error", email: "error" }];
        }
    });
}
function sendMail(mailId, startDate, servuct, companyName, customerName) {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield mail_1.default.send(msg);
            console.log('Email sent to', mailId);
        }
        catch (error) {
            console.error('Error sending email to', mailId, ':', error);
        }
    });
}
function commitJsonChange(filePath, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetch = yield Promise.resolve().then(() => __importStar(require("node-fetch")));
        const octokit = new rest_1.Octokit({ auth: _.GITHUB_AUTH, request: { fetch } });
        try {
            // Fetch the current JSON file
            const { data: fileData } = yield octokit.repos.getContent({
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
                yield octokit.repos.createOrUpdateFileContents({
                    owner: _.owner,
                    repo: _.repo,
                    path: filePath,
                    message: `Update JSON configuration in ${filePath}`,
                    content: Buffer.from(JSON.stringify(jsonContent, null, 2)).toString('base64'),
                    sha,
                });
                console.log(`${filePath} updated successfully`);
            }
            else {
                console.error(`Error: ${filePath} is not a file or does not exist`);
            }
        }
        catch (error) {
            console.error(`Error updating ${filePath}:`, error);
        }
    });
}
function handleEvent(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const devrevPAT = event.context.secrets.service_account_token;
        const API_BASE = event.execution_metadata.devrev_endpoint;
        const devrevSDK = typescript_sdk_1.client.setup({
            endpoint: API_BASE,
            token: devrevPAT,
        });
        const workCreated = event.payload.work_created.work;
        const startDate = event.input_data.global_values.start_date;
        const PAT = event.input_data.global_values.PAT;
        const servuct = event.input_data.global_values.survey_config[2];
        const improvements = event.input_data.global_values.survey_config[3];
        const disappointing = event.input_data.global_values.survey_config[5];
        let checkboxes = [];
        for (let i = 6; i < 15; i++) {
            if (event.input_data.global_values.survey_config[i] === undefined) {
                break;
            }
            checkboxes.push(event.input_data.global_values.survey_config[i]);
        }
        const companyName = event.input_data.global_values.survey_config[1];
        let creatorName = workCreated.created_by.name;
        if (creatorName === undefined) {
            creatorName = event.input_data.global_values.survey_config[0];
        }
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
        // Update the JSON file
        yield commitJsonChange(jsonFilePathBackend, jsonUpdatesBackend);
        // Define the updates to be made
        const jsonUpdatesClient = {
            "productName": servuct,
            "disappointing": disappointing,
            "improvements": improvements,
            "checkboxes": checkboxes
        };
        // Path to the JSON file in the repository
        const jsonFilePathClient = 'client/src/constants.json';
        // Update the JSON file
        yield commitJsonChange(jsonFilePathClient, jsonUpdatesClient);
        const body = {
            object: workCreated.id,
            type: 'timeline_comment',
            body: bodyComment,
        };
        const headers = {
            'Authorization': 'eyJhbGciOiJSUzI1NiIsImlzcyI6Imh0dHBzOi8vYXV0aC10b2tlbi5kZXZyZXYuYWkvIiwia2lkIjoic3RzX2tpZF9yc2EiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOlsiamFudXMiXSwiYXpwIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6OmRldnUvMSIsImV4cCI6MTc5ODk2NTAwOSwiaHR0cDovL2RldnJldi5haS9hdXRoMF91aWQiOiJkb246aWRlbnRpdHk6ZHZydi11cy0xOmRldm8vc3VwZXI6YXV0aDBfdXNlci9vaWRjfHBhc3N3b3JkbGVzc3xlbWFpbHw2NTRiYmIyY2FkZGY2YTg3ZmViN2RkNjkiLCJodHRwOi8vZGV2cmV2LmFpL2F1dGgwX3VzZXJfaWQiOiJvaWRjfHBhc3N3b3JkbGVzc3xlbWFpbHw2NTRiYmIyY2FkZGY2YTg3ZmViN2RkNjkiLCJodHRwOi8vZGV2cmV2LmFpL2Rldm9fZG9uIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6IiwiaHR0cDovL2RldnJldi5haS9kZXZvaWQiOiJERVYtaWN1M1ZKN3oiLCJodHRwOi8vZGV2cmV2LmFpL2RldnVpZCI6IkRFVlUtMSIsImh0dHA6Ly9kZXZyZXYuYWkvZGlzcGxheW5hbWUiOiJuLXZhcnVuIiwiaHR0cDovL2RldnJldi5haS9lbWFpbCI6Im4udmFydW5AaWl0Zy5hYy5pbiIsImh0dHA6Ly9kZXZyZXYuYWkvZnVsbG5hbWUiOiJWYXJ1biBOYWdwYWwiLCJodHRwOi8vZGV2cmV2LmFpL2lzX3ZlcmlmaWVkIjp0cnVlLCJodHRwOi8vZGV2cmV2LmFpL3Rva2VudHlwZSI6InVybjpkZXZyZXY6cGFyYW1zOm9hdXRoOnRva2VuLXR5cGU6cGF0IiwiaWF0IjoxNzA0MzU3MDA5LCJpc3MiOiJodHRwczovL2F1dGgtdG9rZW4uZGV2cmV2LmFpLyIsImp0aSI6ImRvbjppZGVudGl0eTpkdnJ2LXVzLTE6ZGV2by9pY3UzVko3ejp0b2tlbi8zb2RQZ1pqZiIsIm9yZ19pZCI6Im9yZ19uU20wdWpTQk0xcmp4Z3Z0Iiwic3ViIjoiZG9uOmlkZW50aXR5OmR2cnYtdXMtMTpkZXZvL2ljdTNWSjd6OmRldnUvMSJ9.0oyFzajxkYqBGoluxRYMDIKoOCEtCbq0FJdfgzZMpn2j3imzrvkWkJs0XpRW4Wjg7Jien1I6U0Ee19-TuzhHOtiYBUIaTG0H_yw5zOqO0DSknU--smi9Dok6-bhIQg1KL2eNQJZZ-wQ3Z9UcRwrs3Nwfpb8cWU2yn4UHsWG67bFZps2Pk5CRQONmlGGleWMF97UK84i2QIhJ5kscNqJ0e6moraEyLw389fJiuUl8IF_26zwua-JMAbbYpP-xbPPUIokHCwLVd6ZLYLxD2jhIAJnqGx9bUvDz2BzZhBAFaQmmewtZ9NSkJLQouK34VZMU_6mii9777kMR75wIjhNcLg',
        };
        const mailingList = yield (() => __awaiter(this, void 0, void 0, function* () {
            const mailingList = yield createMailingList(_.apiURL, headers);
            return mailingList;
        }))();
        if ((workCreated.type == "issue" && mailingList[0].name !== "error" && workCreated.applies_to_part.name == "Surveys")) {
            const response = yield devrevSDK.timelineEntriesCreate(body);
            const mailPromises = mailingList.map(mailId => sendMail(mailId.email, startDate, servuct, companyName, mailId.name));
            Promise.all(mailPromises).then(() => {
                console.log('All emails sent');
            });
            return response;
        }
        if ((workCreated.type == "issue" && mailingList[0].name !== "error" && workCreated.applies_to_part.name == "Surveys")) {
            const rejectBody = {
                object: workCreated.id,
                type: 'timeline_comment',
                body: "Survey not sent to the entire mailing list",
            };
            const rejectResponse = yield devrevSDK.timelineEntriesCreate(rejectBody);
            return rejectResponse;
        }
        return undefined;
    });
}
const run = (events) => __awaiter(void 0, void 0, void 0, function* () {
    console.info('events', JSON.stringify(events), '\n\n\n');
    for (let event of events) {
        const resp = yield handleEvent(event);
        // console.log(JSON.stringify(resp.data));
    }
});
exports.run = run;
exports.default = exports.run;

import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
import json

# Load Mongo DB URI and other API keys
with open('credentials.json') as json_file:
    creds = json.load(json_file)

# Set-up OpenAI API key
os.environ['OPENAI_API_KEY'] = creds['OpenAI_Key']

# Prompt template to generate an initial summary if no previous summary exists
initial_summary_template = '''You are an AI expert in textual analysis, with a specific focus on distilling customer feedback from surveys into clear, concise summaries. 

Guidelines for generating summaries:ch

1: Start by identifying and grouping responses that refer to the same feature.

2:  For each feature identified, create a short and succinct one sentence summary.

3:  Summary should encapsulate the most relevant feedback, focusing on distinct issues or specific praises. 

4: Summary should not include general sentiments or vague feedback.

LIST OF RESPONSES BEGIN

{RESPONSES}

LIST OF RESPONSE END

Summary :
'''

# Prompt template to modify an existing summary
summary_updation_template = '''You are an AI expert in textual analysis, with a specific focus on distilling customer feedback from surveys into clear, concise summaries. Your task is to update an existing summary with insights from new survey responses. 

Guidelines to update summary : 

1. Review new responses and the existing summary. Group responses by similar features. Determine if the new responses mention features already covered in the summary or introduce new ones.

2. For every identified feature (both existing and new), create a short and succinct one-sentence summary. 

3. Ensure the updated summary highlights distinct issues or specific praises. Avoid general sentiments or vague feedback.

EXISTING SUMMARY BEGINS

{OLD_SUMMARY}

EXISTING SUMMARY ENDS

NEW RESPONSES BEGIN

{NEW_RESPONSES}

NEW RESPONSES END

Modified Summary:'''

# Prompt to generate initial summary
initial_summary_prompt = PromptTemplate(
    input_variables=["RESPONSES"], template= initial_summary_template,
    output_key="summary"
)

# Prompt to update existing summary
summary_updation_prompt = PromptTemplate(
    input_variables=["RESPONSES"], template= summary_updation_template,
    output_key="updated_summary"
)

# Chain to generate initial summary
initial_summary_chain = LLMChain(llm= ChatOpenAI(temperature = 0.0, model =  "gpt-3.5-turbo-1106"),
                        prompt= initial_summary_prompt,
                        verbose=True)
# Chain to update existing summary
summary_updation_chain = LLMChain(llm= ChatOpenAI(temperature = 0.0, model =  "gpt-3.5-turbo-1106"),
                        prompt= summary_updation_prompt,
                        verbose=True)

# Function to generate or modify summary
def get_summary(response_string):

    if os.path.exists("summary.txt") == False: # Check if an existing summary exists
        summary = initial_summary_chain.run(RESPONSES = response_string)

    else:
        with open("summary.txt") as f: # Read existing summary
            old_summary = f.read()

        with open('summary.txt', 'w'):
            pass

        summary = summary_updation_chain.run(OLD_SUMMARY = old_summary,  NEW_RESPONSES = response_string)

    with open("summary.txt", "w") as text_file: # Store the generated or modified summary
            text_file.write(summary)
    
    return summary

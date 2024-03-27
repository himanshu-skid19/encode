from dash import Dash, html,dcc, Input, Output
import pandas as pd
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pymongo
import json
import sys
from collections import Counter
from summary import *

import base64
from io import BytesIO
from wordcloud import WordCloud

SURVEY_NAME = 'Maple_Finance_Gateway_0'

# Load Mongo DB URI and other API keys
with open('credentials.json') as json_file:
    creds = json.load(json_file)

atlas_conn_str = creds['Atlas-Conn-Str']
survey_fields = ['nps-score', 'review', 'checkbox_fts', 'rebuy', 'sentiment', 'date', 'actionable', 'summarised']

# Format each response to contain same and consistent named fields
def reformat_docs(doc):
    
    if 'surveyData' in doc.keys():
        doc = doc['surveyData']

    if 'review' not in doc.keys():
        if 'disappointing-experience' in doc.keys():
            doc['review'] = doc['disappointing-experience']
            del doc['disappointing-experience']
        elif 'improvements-required' in doc.keys():
            doc['review'] = doc['improvements-required']
            del doc['improvements-required']

    if 'checkbox_fts' not in doc.keys():
        if 'promoter-features' in doc.keys():
            doc['checkbox_fts'] = str(doc['promoter-features'])
            del doc['promoter-features']
        elif 'passive/defractor-features' in doc.keys():
            doc['checkbox_fts'] = str(doc['passive/defractor-features'])
            del doc['passive/defractor-features']

    return doc

# Function to get data from Mongo DB
def get_nps_survey_responses(survey):
    # Try to establish a connection with MongoDB 
    try:
        client = pymongo.MongoClient(atlas_conn_str)
    except pymongo.errors.ConfigurationError:
        print("An Invalid URI host error was received. Is your Atlas host name correct in your connection string?")
        sys.exit(1)

    NPSResponsesDB = client.NPSResponsesDB 
    survey_collection = NPSResponsesDB[survey]

    survey_data_docs = []
    for doc in survey_collection.find(): 
        doc = reformat_docs(doc) # Reformat each document
        survey_data_docs.append(doc)

    survey_data_df = pd.DataFrame(survey_data_docs)[survey_fields] 
    return survey_data_df

nps_data = get_nps_survey_responses(SURVEY_NAME)

total_responses = nps_data.shape[0]

# Finding the number of detractors
condition_detractors = (nps_data['nps-score'] >= 1) & (nps_data['nps-score'] <= 6)
filter_detractors = nps_data[condition_detractors]
detractors = len(filter_detractors)

# Finding the number of passive responses
condition_passive = (nps_data['nps-score'] >= 7) & (nps_data['nps-score'] <= 8)
filter_passive = nps_data[condition_passive]
passives = len(filter_passive)

# Finding the number of promoters
condition_promo = (nps_data['nps-score'] >= 9) & (nps_data['nps-score'] <= 10)
filter_promo = nps_data[condition_promo]
promoters = len(filter_promo)

# Calculate the NPS score
nps_score = round(((promoters - detractors) / total_responses) * 100, 2)

# Add Category (Detractors/Passive/Promoters) column to response data based on Score
nps_data['Category'] = ''
nps_data.loc[condition_detractors, 'Category'] = 'detractors'
nps_data.loc[condition_passive, 'Category'] = 'passive'
nps_data.loc[condition_promo, 'Category'] = 'promoters'

# Add a column specifying the month when response was recorded
nps_data['Month'] = nps_data['date'].apply(lambda x : x.split('-')[1])
nps_data.sort_values('date', inplace=True)
nps_data.drop('date', axis='columns')

nps_data['NPS-over-time'] = 0
for mo in nps_data['Month'].unique():
    nps_data.loc[nps_data['Month'] == mo, 'NPS-over-time'] = 1 / (nps_data['Month'] == mo).sum()

## Word Cloud ##

pos_reviews = " ".join(word for word in nps_data.loc[condition_promo, 'review'])
neg_reviews = " ".join(word for word in nps_data.loc[condition_passive | condition_detractors, 'review'])

pos_word_cloud = WordCloud(collocations = False, background_color = '#010203',
                        width = 512, height = 256, min_font_size=16).generate(pos_reviews)

neg_word_cloud = WordCloud(collocations = False, background_color = '#010203',
                        width = 512, height = 256, min_font_size=16).generate(neg_reviews)

pos_word_cloud_img2 = pos_word_cloud.to_image()
neg_word_cloud_img2 = neg_word_cloud.to_image()

with BytesIO() as buffer:
    pos_word_cloud_img2.save(buffer, 'png')
    pos_word_cloud_img = base64.b64encode(buffer.getvalue()).decode()

with BytesIO() as buffer:
    neg_word_cloud_img2.save(buffer, 'png')
    neg_word_cloud_img = base64.b64encode(buffer.getvalue()).decode()

## -------------- ##

app = Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
server = app.server

# Select text color based on score
def score_color(nps_score):
    if nps_score <= 6:
        return '#c61236'
    elif nps_score >= 9:
        return '#07da63'
    else:
        return '#fd8c3e'

# Select text color based on sentiment
def sentiment_color(sentiment):
    if sentiment == 'negative':
        return '#c61236'
    elif sentiment == 'positive':
        return '#07da63'
    else:
        return '#fd8c3e'

# Function to display the customer reviews, scores and sentiment
def generate_card(nps_score, review, sentiment):
    return html.Div(
        dbc.Card(
            dbc.CardBody([
                dbc.Row([
                    dbc.Col(html.H5(f"Score: {nps_score}", className="card-title", 
                                    style={'color': score_color(nps_score)}), 
                            width="auto", align="start"),
                    dbc.Col(html.H6(f"Sentiment: {sentiment}", className="card-sentiment", 
                                    style={'color': sentiment_color(sentiment)}), 
                            width="auto", align="end")
                ], justify="between"),  
                html.P(review, className="card-text")
            ])
        ),
        style={'margin-bottom': '10px', 'padding-left': '20px', 'padding-right': '20px'}
    )

## NPS over time plots ##

# Graph to display fraction of responses of each category in each month
nps_over_time_fig = px.bar(nps_data, x="Month", y="NPS-over-time", color='Category', color_discrete_sequence= ['#c61236','#fd8c3e','#07da63',])

nps_over_time_fig.update_layout(
    paper_bgcolor='#010203',
    plot_bgcolor='#010203',
    font=dict(color='white'),
)

nps_over_time_fig.update_traces(marker_line_width=0)

## Product Rebuy ##

percent_rebuy_yes = round(100 * nps_data['rebuy'].sum()/len(nps_data)) # Perecentage of people willing to use the service again
br = pd.DataFrame({'Yes/No':['Yes', 'No'], 'Percentage Customers Buy Again':[percent_rebuy_yes, 100 - percent_rebuy_yes], 'Response':['Yes/No', 'Yes/No']})

# Graph to indicate percentage of people willing to use the service again
product_yn_bar = px.bar(br, y="Response", x="Percentage Customers Buy Again", orientation='h', color='Yes/No',
                         color_discrete_sequence= ['green', 'red'], text=br['Percentage Customers Buy Again'].apply(lambda x: f'{x}%'))

product_yn_bar.update_layout(
    height=200,
    paper_bgcolor='#010203',
    plot_bgcolor='#010203',
    font=dict(color='white'),
    xaxis=dict(showgrid=False),
    yaxis=dict(showgrid=False),
    title_x=0.5,
    showlegend=False,
)

## Summary Generation ##
response_string = f""
ct = 0
for idx in nps_data[nps_data['summarised'] == False].index: # Selecting the responses which have not been summarized
    response_string += f"Response {ct + 1} : {nps_data.loc[idx, 'review']} \n" 
    ct+=1

summary = get_summary(response_string) # LLM call for summary updation
summary_points = summary.split('\n') 

## ---------------- ##

## NPS Pie Chart ##

# Pie chart for percentage of promoters, passives and detractors
pie_chart_figure = px.pie(values=[promoters, passives, detractors], 
                          names=['Promoters', 'Passives', 'Detractors'],
                          color_discrete_sequence= ['#c61236','#fd8c3e','#07da63',],
                          title="Categories Distribution")

pie_chart_figure.update_traces(
    textinfo='percent+label', 
    marker=dict(line=dict(color='white', width=2)),
    hoverinfo='label+percent',
    textfont=dict(color='white')
)

pie_chart_figure.update_layout(
    paper_bgcolor='#010203',
    plot_bgcolor='#010203',
    font=dict(color='white'),
)

dcc.Graph(
    figure=pie_chart_figure
)

## Checkboxes Responses ##

pos_fts_list = []
neg_fts_list = []

for idx in nps_data.index:
    if nps_data.loc[idx, 'sentiment'] == 'positive':
        pos_fts_list.extend(eval(nps_data.loc[idx, 'checkbox_fts']))
    else:
        neg_fts_list.extend(eval(nps_data.loc[idx, 'checkbox_fts']))

# Selecting 5 most common checkbox responses in positive sentiment reviews
pos_counter = Counter(pos_fts_list)
pos_counter = dict(pos_counter.most_common(5))

# Selecting 5 most common checkbox responses in negative/neutral sentiment reviews
neg_counter = Counter(neg_fts_list)
neg_counter = dict(neg_counter.most_common(5))

# Bar graph for positive responses
positive_aspects_bar = px.bar(pd.DataFrame({'Well Performing Aspects' : pos_counter.keys(), '#Responses' : pos_counter.values()}), 
                                x='Well Performing Aspects', y='#Responses', color_discrete_sequence=['green'])

# Bar graph for negative responses
negative_aspects_bar = px.bar(pd.DataFrame({'Poorly Performing Aspects' : neg_counter.keys(), '#Responses' : neg_counter.values()}), 
                                x='Poorly Performing Aspects', y='#Responses', color_discrete_sequence=['#E34234'])

positive_aspects_bar.update_layout( 
    paper_bgcolor='#010203',
    plot_bgcolor='#010203',
    font=dict(color='white'),
    title_x=0.5,
    title=dict(text="Well Performing Aspects", font=dict(size=30)),
)

negative_aspects_bar.update_layout( 
    paper_bgcolor='#010203',
    plot_bgcolor='#010203',
    font=dict(color='white'),
    title_x=0.5,
    title=dict(text="Poorly Performing Aspects", font=dict(size=30)),
)

## -------------- ##

app.layout = dbc.Container([

    # App heading
    html.H1("NPS Responses", className="text-center my-4", style={'color': 'white'}), 

    # Display total response and responses of each category
    dbc.Row([
        dbc.Row([
            dbc.Col([
                html.H4("Total Responses", className="text-center", style={'color': '#1870d5'}),
                html.H5(f"{total_responses}", className="text-center", style={'color': 'white'}),
            ], width=3),
            dbc.Col([
                html.H4("Promoters", className="text-center", style={'color': '#07da63'}),
                html.H5(f"{promoters}", className="text-center", style={'color': 'white'})
            ], width=3),
            dbc.Col([
                html.H4("Passive", className="text-center", style={'color': '#fd8c3e'}),
                html.H5(f"{passives}", className="text-center", style={'color': 'white'})
            ], width=3),

            dbc.Col([
                html.H4("Detractors", className="text-center", style={'color': '#c61236'}),
                html.H5(f"{detractors}", className="text-center", style={'color': 'white'})
            ], width=3)
        ], justify='center'),
        
        # Display the NPS score
        dbc.Row([
            dbc.Col([
                html.H4("NPS Score", className="text-center", style={'color': '#1870d5', 'margin-top': '60px'}),
                html.H5(f"{nps_score}%", className="text-center", style={'color': 'white'})
            ], width=3),

        # Chart indicating % of users willing to use the product again
            dbc.Col([
                html.Div([
                    dcc.Graph(
                        figure=product_yn_bar
                    )
                ])
            ], width=6),
        ], justify='between')

    ], justify="center"),

    html.H3("AI-Powered Feedback Summary", className="text-center my-4", style={'color': 'white'}),

    # Display the generated summary
    html.Div(
        [
            html.Ul(
                [html.Li(item) for item in summary_points],
                style={
                    'color': 'white', 
                    'width': '75%', 
                    'list-style-type': 'none',  
                    'padding-left': '0',
                    'margin-left': 'auto',    
                    'margin-right': 'auto'
                }
            )
        ],
        style={  
            'width': '100%'          
        }
    ),

    # Displays fraction of responses of each category in each month
    html.Div([
        dcc.Graph(
            figure=nps_over_time_fig
        )
    ], style={'width': '48%', 'display': 'inline-block'}),  

    # Pie chart to show the percentage of promoters, passives and detractors
    html.Div([
        dcc.Graph(
            figure=pie_chart_figure
        )
    ], style={'width': '48%', 'display': 'inline-block'}),

    # Positive Feedback Wordcloud
    html.Div(children=[
                    html.H4("Positive Feedback Wordcloud", style={'color': 'white', 'text-align': 'center'}),
                    html.Img(src="data:image/png;base64," + pos_word_cloud_img),
                ], style={'width': '48%', 'display': 'inline-block', 'text-align': 'center', 'margin': 'auto'}),

    # Negative Feedback Wordcloud
    html.Div(children=[
                    html.H4("Negative Feedback Wordcloud", style={'color': 'white', 'text-align': 'center'}),
                    html.Img(src="data:image/png;base64," + neg_word_cloud_img)
                ], style={'width': '48%', 'display': 'inline-block', 'text-align': 'center', 'margin': 'auto'}),

    # Adding line-breaks
    html.Div(
        [
            html.Br(),
            html.Br(),
            html.Br(),
        ]
    ),

     # Display most valued features as highlighted by positive responses
    html.Div([
        dcc.Graph(
            figure=positive_aspects_bar
        )
    ], style={'width': '48%', 'display': 'inline-block', 'margin':10}),  

    # Display most valued features as highlighted by negative responses
    html.Div([
        dcc.Graph(
            figure=negative_aspects_bar
        )
    ], style={'width': '48%', 'display': 'inline-block', 'margin':10}),

    # Line breaks
    html.Div(
        [
            html.Br(),
            html.Br(),
        ]
    ),

    html.Div([
        dbc.Row([

            # Field to filter responses by score
            dbc.Col(
                html.Div([
                    html.P("Filter responses by min and max score:", 
                        className="text-center", style={'color': 'white'}),
                    html.Div([
                        dcc.Input(id='min-score', type='number', placeholder='Min Score', 
                                style={'marginRight': '10px', 'width': '100px'}),
                        dcc.Input(id='max-score', type='number', placeholder='Max Score',
                                style={'marginLeft': '10px', 'width': '100px'}),
                    ], style={'display': 'flex', 'justifyContent': 'center', 'marginTop': '10px'}),
                ], style={'textAlign': 'center'}),
                width=6
            ),

            # Field to filter responses by sentiment
            dbc.Col(
                html.Div([
                    html.P("Filter responses by sentiment:", 
                        className="text-center", style={'color': 'white'}),
                    dcc.Dropdown( #                
                        id='sentiment', placeholder = 'Sentiment',
                        options=[
                            {'label': 'Positive', 'value': 'positive'},
                            {'label': 'Neutral', 'value': 'neutral'},
                            {'label': 'Negative', 'value': 'negative'},
                        ],
                        style={'width': '140px', 'margin': '10px auto'},
                    ),
                ], style={'textAlign': 'center'}),
                width=6
            ),
        ], style={'marginBottom': '20px'})
    ]),

    html.Div(id='response-cards', style={'overflowY': 'scroll', 'height': '400px'})
], fluid=True, style={'backgroundColor': '#010203'} )

# Update response card when selected min/max score or sentiment is changed
@app.callback(
    Output('response-cards', 'children'),
    [Input('min-score', 'value'), Input('max-score', 'value'), Input('sentiment', 'value')]
)
def update_cards(min_score, max_score, sentiment): # Function to update response card
    if min_score is None: # Set default min score
        min_score = 1
    if max_score is None: # Set default max score
        max_score = 10
    filtered_data = nps_data[(nps_data['nps-score'] >= min_score) & (nps_data['nps-score'] <= max_score)] # Filter responses based on score
    if sentiment != None:
        filtered_data = filtered_data[(filtered_data['sentiment']) == sentiment] # Filter responses based on sentiment
    return [generate_card(row['nps-score'], row['review'], row['sentiment']) for index, row in filtered_data.iterrows()]

if __name__ == '__main__':
    app.run(debug=True)

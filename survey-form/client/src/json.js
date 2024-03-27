let productName = "SampleProduct";
let disappointing = "How did we disappoint you and what can we do to make things right?"
let improvements = "What can we do to make your experience more satisfying?";
let checkboxes = ["Performance"
, "User Interface"
, "Quality Support"
, "Stability"
, "Documentations and Demos"];
let entities = []
for (let checkbox of checkboxes){
    entities.push({"value": checkbox, "text": checkbox});
}
export const json = {
  "completedHtmlOnCondition": [
   {
    "expression": "{nps-score} <= 7 or {rebuy} = false",
    "html": {
     "default": "Thanks for your feedback! We highly value all ideas and suggestions from our customers, whether they're positive or critical. In the future, our team might reach out to you to learn more about how we can further improve our product so that it exceeds your expectations.",
     "fr": "Merci pour vos commentaires! Nous accordons une grande importance à toutes les idées et suggestions de nos clients, qu'elles soient positives ou critiques. À l'avenir, notre équipe pourrait vous contacter pour en savoir plus sur la façon dont nous pouvons encore améliorer notre produit afin qu'il dépasse vos attentes."
    }
   },
   {
    "expression": "{nps-score} = 7 or {nps-score} = 8",
    "html": {
     "default": "Thanks for your feedback. Our goal is to create the best possible product, and your thoughts, ideas, and suggestions play a major role in helping us identify opportunities to improve.",
     "fr": "Merci pour vos commentaires. Notre objectif est de créer le meilleur produit possible, et vos réflexions, idées et suggestions jouent un rôle majeur pour nous aider à identifier les opportunités d'amélioration."
    }
   },
   {
    "expression": "{nps-score} >= 8",
    "html": {
     "default": "Thanks for your feedback. It's great to hear that you're a fan of our product. Your feedback helps us discover new opportunities to improve it and make sure you have the best possible experience.",
     "fr": "Merci pour vos commentaires. Nous sommes ravis d'entendre que vous avez apprécié notre produit. Vos commentaires nous aident à découvrir de nouvelles opportunités pour l'améliorer et vous assurer la meilleure expérience possible."
    }
   }
  ],
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "rating",
          "name": "nps-score",
          "title": {
            "default": `On a scale from 0 to 10, how likely are you to recommend ${productName} to a friend or colleague?`,
            "fr": "Sur une échelle de 0 à 10, quelle est la probabilité que vous recommandiez notre produit à un ami ou à un collègue?"
          },
          "rateMin": 0,
          "rateMax": 10,
          "minRateDescription": {
            "default": "Very unlikely",
            "fr": "Très improbable"
          },
          "maxRateDescription": {
            "default": "Very likely",
            "fr": "Très probable"
          }
        },
        {
          "type": "comment",
          "name": "disappointing-experience",
          "visibleIf": "{nps-score} <= 6",
          "title": {
            "default": disappointing,
            "fr": "Nous n'avons pas été a la hauteur de vos attentes, comment pouvons-nous améliorer?"
          },
          "maxLength": 300
        },
        {
          "type": "comment",
          "name": "improvements-required",
          "visibleIf": "{nps-score} >= 7",
          "title": {
            "default": improvements,
            "fr": "Que pouvons-nous faire pour rendre votre expérience plus satisfaisante?"
          },
          "maxLength": 300
        },
        {
          "type": "checkbox",
          "name": "promoter-features",
          "visibleIf": "{nps-score} >= 9",
          "title": {
            "default": "Which of the following features do you value the most?",
            "fr": "Laquelle des fonctionnalités suivantes appréciez-vous le plus ?"
          },
          "description": {
            "default": "Please select no more than three features.",
            "fr": "Veuillez ne pas sélectionner plus de trois fonctionnalités."
          },
          "isRequired": true,
          "choices": checkboxes,
          "showOtherItem": true,
          "otherPlaceholder": {
            "default": "Please specify...",
            "fr": "Veuillez préciser..."
          },
          "otherText": {
            "default": "Other features",
            "fr": "Autres fonctionnalités"
          },
          "colCount": 2,
          "maxSelectedChoices": 3
        },
        {
          "type": "checkbox",
          "name": "passive/defractor-features",
          "visibleIf": "{nps-score} < 9",
          "title": {
            "default": "Which of the following features do you think need the most improvement?",
            "fr": "Laquelle des fonctionnalités suivantes appréciez-vous le plus ?"
          },
          "description": {
            "default": "Please select no more than three features.",
            "fr": "Veuillez ne pas sélectionner plus de trois fonctionnalités."
          },
          "isRequired": true,
          "choices": checkboxes,
          "showOtherItem": true,
          "otherPlaceholder": {
            "default": "Please specify...",
            "fr": "Veuillez préciser..."
          },
          "otherText": {
            "default": "Other features",
            "fr": "Autres fonctionnalités"
          },
          "colCount": 2,
          "maxSelectedChoices": 3
        },
        {
          "type": "boolean",
          "name": "rebuy",
          "title": {
            "default": "Would you consider using our service again?",
            "fr": "Achèteriez-vous à nouveau notre produit?"
          },
          "isRequired": true
        },
        {
          "type": "text",
          "name": "email",
          "title": {
            "default": "Your email address will be used solely to ensure each participant submits only one response and to maintain the integrity of the survey results. We respect your privacy and assure you that your email will not be used for any other purpose, nor will it be shared with any third parties. Thank you for your cooperation",
            "fr": "Achèteriez-vous à nouveau notre produit?"
          },
          "isRequred": false,
          "validators": [
            {
              "type": "email",
              "text": {
                "default": "Please enter a valid email address.",
                "fr": "Veuillez entrer une adresse e-mail valide."
              }
            }
          ],
          "inputType": "email",
          "placeholder": {
            "default": "yourname@example.com",
            "fr": "votrenom@exemple.com"
          },
          "isRequired": true
        }
      ]
    },

  ],
  "showPrevButton": false,
  "showQuestionNumbers": "off",
  "completeText": {
   "fr": "Envoyer"
  },
  "widthMode": "static",
  "width": "1000px"
 };

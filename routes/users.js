var express = require('express');
var router = express.Router();
var registrationController = require('../controllers/registrationController')
var loginController = require('../controllers/loginController')
var geminiController = require('../controllers/geminiController')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/register', registrationController.register)

router.post('/login', loginController.login)

router.post('/generate-meal-plan', async (req, res)=>{

  const {
    age,gender,
    feeling,current_diseases,
    allergies,medical_history,bmi
  } = req.body

  let prompt = `
Prompt:
Goal: Create a personalized meal plan to support a healthy body and immune system.
Data:

Age: ${age}
Gender: ${gender}
Health Status: ${feeling}
Medical Conditions: ${current_diseases}
Allergies: ${allergies}
Medical History: ${medical_history}

BMI: ${bmi}

Notes: Consider dietary restrictions, allergies, and health conditions when planning meals.

USE THIS JSON FORMAT:
{
  "meal_plan": {
    "date": "2024-08-28",
    "breakfast": [
      {
        "item": "Oatmeal",
        "notes": "Low-sodium oats, avoid added sugar"
      },...
    ],
    "lunch": [
      {
        "item": "Grilled chicken",
        "notes": "Lean protein source"
      },...
    ],
    "dinner": [
      {
        "item": "Salmon",
        "notes": "Lean protein source"
      },...
    ]
  }
}
  
  
  `;

console.log(prompt)
const response = await geminiController.askGemini(prompt)
console.log(JSON.parse(response))
res.send(response)

})

module.exports = router;

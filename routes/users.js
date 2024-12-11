var express = require('express');
var router = express.Router();
var registrationController = require('../controllers/registrationController')
var loginController = require('../controllers/loginController')
var geminiController = require('../controllers/geminiController');
var pool = require('./../db')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.post('/register', registrationController.register)

router.post('/login', loginController.login)

router.get('/data',async(req, res)=>{
  const user_id = req.query.user_id

  const [healthFetch, fields1] = await pool.query(`SELECT 
    hd.height, 
    hd.weight, 
    hd.waist_circumference AS waistCircumference,
    hd.hip_circumference AS hipCircumference,
    hd.body_temperature AS bodyTemperature,
    hd.blood_pressure AS bloodPressure,
    hd.heart_rate AS heartRate,
    hd.blood_sugar AS bloodSugar,
    hd.cholesterol_levels AS cholesterolLevels,
    u.first_name AS firstName,
    u.last_name AS lastName,
    u.birth_date AS birthday,
    u.gender,
    u.email from health_data hd INNER JOIN users u USING(user_id) WHERE u.user_id = ?`,[user_id]);

const healthData = healthFetch[0];

console.log('user data fetched user_id: '+user_id,healthData)

return res.json(healthData)

  
})

router.post('/save-health-data', async (req, res) => {

  const params = req.body

  console.log('request at /save-health-data', params)



  let existingHealthData = await pool.query('SELECT * FROM health_data WHERE user_id = ?',[params.user_id])

  if(!existingHealthData[0].length){
    const query = `
    INSERT INTO health_data 
    (user_id,height, weight, waist_circumference, hip_circumference, body_temperature, blood_pressure, heart_rate, blood_sugar, cholesterol_levels) 
    VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
    const [insert, fields] = await pool.query(query, [
      params.user_id,
      params.height,
      params.weight,
      params.waistCircumference,
      params.hipCircumference,
      params.bodyTemperature,
      params.bloodPressure,
      params.heartRate,
      params.bloodSugar,
      params.cholesterolLevels
    ])
  
    if(!insert.affectedRows){
      return res.json({
        success:false,
        message:'Insert failed. Affected rows: '+insert.affectedRows,
        result:insert
      })
    }
  }else{
    const update = `UPDATE health_data
    SET 
        height = ?,
        weight = ?,
        waist_circumference = ?,
        hip_circumference = ?,
        body_temperature = ?,
        blood_pressure = ?,
        heart_rate = ?,
        blood_sugar = ?,
        cholesterol_levels = ?
    WHERE user_id = ?`

    const [updateRes, fields2] = await pool.query(update,[ params.height,
      params.weight,
      params.waistCircumference,
      params.hipCircumference,
      params.bodyTemperature,
      params.bloodPressure,
      params.heartRate,
      params.bloodSugar,
      params.cholesterolLevels,
      params.user_id])

      if(!updateRes.affectedRows){
        return res.json({
          success:false,
          message:'update data failed. Affected rows: '+updateRes.affectedRows,
          result:updateRes
        })
      }

  }
  let user_id = params.user_id

  const [healthFetch, fields1] = await pool.query(`SELECT 
            hd.height, 
            hd.weight, 
            hd.waist_circumference AS waistCircumference,
            hd.hip_circumference AS hipCircumference,
            hd.body_temperature AS bodyTemperature,
            hd.blood_pressure AS bloodPressure,
            hd.heart_rate AS heartRate,
            hd.blood_sugar AS bloodSugar,
            hd.cholesterol_levels AS cholesterolLevels,
            u.first_name AS firstName,
            u.last_name AS lastName,
            u.birth_date AS birthday,
            u.gender,
            u.email from health_data hd INNER JOIN users u USING(user_id) WHERE u.user_id = ?`,[user_id]);

  const healthData = healthFetch[0];
  return res.json({
    success:true,
    data:healthData
  })

})

router.post('/generate-meal-plan', async (req, res) => {

  const {
    age, gender,
    feeling, current_diseases,
    allergies, medical_history, bmi
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
        "notes": "Low-sodium oats, avoid added sugar",
        "servings:"1 cup"
      },...
    ],
    "lunch": [
      {
        "item": "Grilled chicken",
        "notes": "Lean protein source",
        "servings:"1 piece"
      },...
    ],
    "dinner": [
      {
        "item": "Salmon",
        "notes": "Lean protein source",
        "services:"2 pieces"
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

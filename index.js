require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const PORT = process.env.PORT || 3000;
const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN; // ✅ متطابق مع .env
const CUSTOM_OBJECT = process.env.CUSTOM_OBJECT; // ✅ متطابق مع .env

// 🏠 الصفحة الرئيسية
app.get("/", async (req, res) => {
  try {
    const propertiesToRetrieve = "pet_name,pet_type,date"; 
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT}?properties=${propertiesToRetrieve}`,
      {
        headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` },
      }
    );

    const records = response.data.results;
    res.render("homepage", {
      title: "Custom Object Records (Pets)",
      records,
    });
  } catch (error) {
    console.error("Error in GET /:", error.response ? error.response.data : error.message);
    res.status(500).send("Error loading records ❌");
  }
});

// 📄 صفحة النموذج
app.get("/update-cobj", (req, res) => {
  res.render("updates", { title: "Create New Record" });
});

app.post("/update-cobj", async (req, res) => {
  const { name, breed, date } = req.body;


  try {
    const payload = {
      properties: {
        pet_name: name, // Maps form input 'name' to HubSpot 'pet_name'
        pet_type: breed, // Maps form input 'breed' to HubSpot 'pet_type'
        date: date, // Maps form input 'date' to HubSpot 'date_of_birth'
      },
    };

    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.redirect("/");
  } catch (error) {
    console.error("Error in POST /update-cobj:", error.response?.data || error.message);
    res.status(500).send("Error creating record ❌");
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

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
const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

// ✅ Custom Object ID مباشرة
const CUSTOM_OBJECT_ID = "2-196074512";

// 🏠 الصفحة الرئيسية – عرض البيانات
app.get("/", async (req, res) => {
  try {
    const propertiesToRetrieve = "name,type,avg_price";

    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}?properties=${propertiesToRetrieve}`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        },
      }
    );

    const records = response.data.results;

    res.render("homepage", {
      title: "Custom Object Records",
      records,
    });
  } catch (error) {
    console.error(
      "Error in GET /:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error loading records ❌");
  }
});

// 📄 صفحة إضافة Record
app.get("/update-cobj", (req, res) => {
  res.render("updates", { title: "Create New Record" });
});

// ➕ إنشاء Record جديد
app.post("/update-cobj", async (req, res) => {
  const { name, type, avg_price } = req.body;

  try {
    const payload = {
      properties: {
        name: name,
        type: type,
        avg_price: avg_price,
      },
    };

    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}`,
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
    console.error(
      "Error in POST /update-cobj:",
      error.response?.data || error.message
    );
    res.status(500).send("Error creating record ❌");
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);

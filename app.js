const axios = require("axios");
require("dotenv").config();
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN; // Replace HubSpot token
const BASE_URL = process.env.BASE_URL;

async function emailCloningProcess(originalEmailId, cloningCount) {
  try {
    let currentEmailId = originalEmailId;
    const response = await axios.get(`${BASE_URL}/${originalEmailId}`, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const originalEmail = response.data;

    for (let i = 0; i < cloningCount; i++) {
      const cloneResponse = await axios.post(`${BASE_URL}/${currentEmailId}/clone`,{},
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const clonedEmail = cloneResponse.data;
      const originalEmailName = originalEmail.name;
      const datePattern = /\d{2} \w{3} \d{4}/;
      const dateMatch = originalEmailName.match(datePattern);
      if (!dateMatch) return;

      let clonedDate = new Date(dateMatch[0]);
      clonedDate.setDate(clonedDate.getDate() + 1 + i);
      const updatedDate = clonedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).replace(",", "");

      const newEmailName = originalEmailName.replace(dateMatch[0], updatedDate);

      const updateEmailData = {
        name: newEmailName,
        subscriptions: {
          mailingListsIncluded: [71],//change seedlist id
        },
        isGraymailSuppressionEnabled: false,
      };

      await axios.put(`${BASE_URL}/${clonedEmail.id}`,updateEmailData,
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      currentEmailId = clonedEmail.id;
    }
  } catch (error) {
    console.error("Error cloning process", error.response?.data || error.message);
  }
}


async function EmailCloner(emailIds, cloningCount) {
  for (const emailId of emailIds) {
    await emailCloningProcess(emailId, cloningCount);
  }
  console.log(`${cloningCount} days of Emails are Cloned Successfully!`);
}

const emailIds = [185864102481,185853515935];//email ids
const cloningCount = 30;
EmailCloner(emailIds, cloningCount);
import nodemailer from "nodemailer";

// Function to generate a responsive email template
function generateResponsiveEmail(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #007bff;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 20px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .email-body {
      padding: 20px;
    }
    .table-container {
      overflow-x: auto; /* Enable horizontal scrolling */
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .email-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px; /* Ensures the table maintains its width for scrolling */
    }
    .email-table th,
    .email-table td {
      padding: 10px;
      font-size: 14px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
      white-space: nowrap; /* Prevents text from wrapping */
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .email-table th {
      background-color: #007bff;
      color: #ffffff;
      text-transform: uppercase;
    }
    .email-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .row-highlight {
      background-color: #ffe6e6;
      color: #d80000;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">Content Upload Status</div>
    <div class="email-body">
      <p>Hello Team,</p>
      <p>Here's the detailed status of the recent uploads:</p>
      <div class="table-container">
        <table class="email-table">
          <thead>
            <tr>
              <th>Page Name</th>
              <th>Page ID</th>
              <th>Status</th>
              <th>Public ID</th>
              <th>Content ID</th>
              <th>Message</th>
              <th>Delete Message</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map((row) => {
                const isHighlight = Object.values(row).some(
                  (value) => value === false || value === "❌" || value == null
                );
                return `
                <tr class="${isHighlight ? "row-highlight" : ""}">
                  <td>${row.page_name || "❌"}</td>
                  <td>${row.page_id || "❌"}</td>
                  <td>${row.success ? "✅ Success" : "❌"}</td>
                  <td>${row.public_id ? "✅" : "❌"}</td>
                  <td>${row.content_id ? "✅" : "❌"}</td>
                  <td>${row.message || "❌"}</td>
                  <td>${row.delete_message || "❌"}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <p>Please review the details above and contact us for any issues.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Function to send an email
export const sendEmail = async (data, recipientEmail = "tanvir.bd.global@gmail.com") => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Use email from .env file
        pass: process.env.EMAIL_PASSWORD, // Use app password from .env file
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: "Upload Status Update",
      text: "Please find the details of the upload status in the attached HTML content.",
      html: generateResponsiveEmail(data),
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error.message || error);
  }
};

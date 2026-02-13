import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middlewares
app.use(
  cors({
    origin: "*", // later you can restrict to frontend URL
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// health check route
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

// contact form route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
   const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});


    console.log("📨 Sending email...");

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      replyTo: email,
      subject: `Portfolio Contact from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    console.log("✅ Email sent");
    res.status(200).json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// start server (VERY IMPORTANT: outside routes)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEy);

// Middlewares
app.use(
  cors({
    origin: "*", // Later change to your frontend domain
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

// Contact route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    console.log("📨 Sending email via Resend...");

    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: process.env.EMAIL,
      subject: `Portfolio Contact from ${name}`,
      reply_to: email,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    console.log("✅ Email sent successfully");

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("❌ Resend error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});


import "dotenv/config";
import mongoose from "mongoose";

import {connectDB} from "../config/db.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";

import Ticket from "../models/Ticket.js";

async function seedUsers() {
  const users = [
    {
      name: "Admin Lead",
      email: "admin@triagesync.test",
      password: "Admin@123",
      role: "ADMIN",
    },
    {
      name: "Agent Demo",
      email: "user@triagesync.test",
      password: "User@123",
      role: "USER",
    },
  ];

  for (const user of users) {
    const existingUser = await User.findOne({
      email: user.email,
    });

    if (existingUser) {
      continue;
    }

    const passwordHash = await hashPassword(user.password);

    await User.create({
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
    });
  }
}

async function seedResources() {
  const resources = [
    {
      name: "Conference Room A",
      type: "ROOM",
      capacity: 12,
      description: "Meeting room with a display and whiteboard",
      isActive: true,
    },
    {
      name: "Training Room B",
      type: "ROOM",
      capacity: 30,
      description: "Large room for training and workshops",
      isActive: true,
    },
    {
      name: "Chemistry Lab",
      type: "LAB",
      capacity: 20,
      description: "Laboratory for chemistry-related support",
      isActive: true,
    },
    {
      name: "Computer Lab",
      type: "LAB",
      capacity: 40,
      description: "Computer laboratory with network access",
      isActive: true,
    },
    {
      name: "Projector Kit",
      type: "EQUIPMENT",
      capacity: 1,
      description: "Portable projector and presentation accessories",
      isActive: true,
    },
    {
      name: "Diagnostic Scanner",
      type: "EQUIPMENT",
      capacity: 2,
      description: "Temporarily unavailable diagnostic equipment",
      isActive: false,
    },
  ];

  for (const resource of resources) {
    await Resource.updateOne(
      { name: resource.name },
      { $setOnInsert: resource },
      {
        upsert: true,
        runValidators: true,
        collation: {
          locale: "en",
          strength: 2,
        },
      },
    );
  }
}

async function seedTickets() {
  const tickets = [
    {
      externalId: "SEED-001",
      subject: "Refund requested for duplicate charge",
      body: "Customer was charged twice and needs a refund.",
      autoCategory: "BILLING",
      category: "BILLING",
      priority: "HIGH",
      status: "OPEN",
    },
    {
      externalId: "SEED-002",
      subject: "Invoice payment is incorrect",
      body: "The amount displayed on the latest invoice is incorrect.",
      autoCategory: "BILLING",
      category: "BILLING",
      priority: "MEDIUM",
      status: "RESOLVED",
      isReviewed: true,
    },
    {
      externalId: "SEED-003",
      subject: "Password locked after sign in",
      body: "The account is locked and the user cannot sign in.",
      autoCategory: "LOGIN",
      category: "LOGIN",
      priority: "URGENT",
      status: "IN_PROGRESS",
      isReviewed: true,
    },
    {
      externalId: "SEED-004",
      subject: "Two factor login is failing",
      body: "The user cannot complete the 2FA login process.",
      autoCategory: "LOGIN",
      category: "LOGIN",
      priority: "HIGH",
      status: "OPEN",
    },
    {
      externalId: "SEED-005",
      subject: "My package has not arrived",
      body: "Tracking shows the package was shipped but not delivered.",
      autoCategory: "DELIVERY",
      category: "DELIVERY",
      priority: "HIGH",
      status: "OPEN",
    },
    {
      externalId: "SEED-006",
      subject: "Delivery tracking has stopped",
      body: "The tracking information has not changed for several days.",
      autoCategory: "DELIVERY",
      category: "DELIVERY",
      priority: "MEDIUM",
      status: "CLOSED",
      isReviewed: true,
    },
    {
      externalId: "SEED-007",
      subject: "Production API returns error 500",
      body: "The API throws an exception for every request.",
      autoCategory: "BUG",
      category: "BUG",
      priority: "URGENT",
      status: "IN_PROGRESS",
    },
    {
      externalId: "SEED-008",
      subject: "Application crashes during upload",
      body: "Uploading a large document causes the page to crash.",
      autoCategory: "BUG",
      category: "BUG",
      priority: "HIGH",
      status: "OPEN",
    },
    {
      externalId: "SEED-009",
      subject: "Add dark mode to the dashboard",
      body: "Users would like a dark theme for the application.",
      autoCategory: "FEATURE_REQUEST",
      category: "FEATURE_REQUEST",
      priority: "LOW",
      status: "OPEN",
    },
    {
      externalId: "SEED-010",
      subject: "Export analytics reports",
      body: "Please add an option to export reports as CSV files.",
      autoCategory: "FEATURE_REQUEST",
      category: "FEATURE_REQUEST",
      priority: "MEDIUM",
      status: "OPEN",
    },
    {
      externalId: "SEED-011",
      subject: "Payment was charged three times",
      body: "The customer needs the duplicate payment charges reversed.",
      autoCategory: "BILLING",
      category: "BILLING",
      priority: "URGENT",
      status: "OPEN",
    },
    {
      externalId: "SEED-012",
      subject: "Unable to reset account password",
      body: "The password reset link does not allow the user to login.",
      autoCategory: "LOGIN",
      category: "LOGIN",
      priority: "MEDIUM",
      status: "OPEN",
    },
    {
      externalId: "SEED-013",
      subject: "Shipping delivery is delayed",
      body: "The order has shipped but delivery is several days late.",
      autoCategory: "DELIVERY",
      category: "DELIVERY",
      priority: "HIGH",
      status: "OPEN",
    },
    {
      externalId: "SEED-014",
      subject: "Dashboard throws an exception",
      body: "A production error causes the dashboard to become unavailable.",
      autoCategory: "BUG",
      category: "BUG",
      priority: "URGENT",
      status: "OPEN",
    },
    {
      externalId: "SEED-015",
      subject: "<script>alert('xss')</script>",
      body: "<img src=x onerror=alert('xss')> must display as plain text.",
      autoCategory: "FEATURE_REQUEST",
      category: "FEATURE_REQUEST",
      priority: "LOW",
      status: "OPEN",
    },
  ];

  for (const ticket of tickets) {
    await Ticket.updateOne(
      { externalId: ticket.externalId },
      {
        $setOnInsert: {
          isHumanOverride: false,
          isReviewed: false,
          ...ticket,
        },
      },
      {
        upsert: true,
        runValidators: true,
      },
    );
  }
}

async function seedDatabase() {
  try {
    await connectDB();
    await seedUsers();
    await seedResources();
    await seedTickets();

    console.log("Database seeded successfully");

    console.log("Users and resources seeded successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();

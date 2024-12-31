import express from "express";
import Order2 from "../models/order.js";

const router = express.Router();

// Fetch all orders
router.get("/orders2", async (req, res) => {
  try {
    const orders = await Order2.find().populate("selectedFormulaId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

// Submit a new order
router.post("/orders2", async (req, res) => {
  const {
    date,
    shift,
    orderNo,
    machineNo,
    operator,
    batchNo,
    batchWeight,
    numberOfBatches,
    remarks,
    selectedFormulaId,
  } = req.body;

  const newOrder = new Order2({
    date,
    shift,
    orderNo,
    machineNo,
    operator,
    batchNo,
    batchWeight,
    numberOfBatches,
    remarks,
    selectedFormulaId,
  });

  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error saving order", error });
  }
});

export default router;

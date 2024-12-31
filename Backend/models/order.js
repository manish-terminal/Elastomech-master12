import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  date: { type: String, required: true },
  shift: { type: String, required: true },
  orderNo: { type: String, required: true },
  machineNo: { type: String, required: true },
  operator: { type: String, required: true },
  batchNo: { type: String, required: true },
  batchWeight: { type: Number, required: true },
  numberOfBatches: { type: Number, required: true },
  remarks: { type: String },
  selectedFormulaId: { type: mongoose.Schema.Types.ObjectId, ref: "Formula" },
});

const Order2 = mongoose.model("Order2", orderSchema);

export default Order2;

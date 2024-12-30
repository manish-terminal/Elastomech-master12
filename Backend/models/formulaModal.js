import mongoose from "mongoose";

const formulaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lotMultiplier: { type: String, required: true }, // Added lotMultiplier field
  ingredients: [
    {
      type: { type: String, required: true },
      name: { type: String, required: true },
      ratio: { type: Number, required: true },
      phr: { type: Number, required: false }, // Optional PHR field for chemicals
      consumption: { type: Number, required: false }, // Optional Consumption field
    },
  ],
  totalWeight: { type: Number, required: true }, // Added totalWeight field
});

const Formula = mongoose.model("Formula", formulaSchema);

export default Formula;

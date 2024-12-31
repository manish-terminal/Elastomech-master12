import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  articleName: { type: String, required: true },
  image: { type: String },
  articleNo: { type: String, required: true },
  mouldingTemp: { type: Number, required: true },
  formulations: [
    {
      formulaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Formula",
        required: true,
      },
      fillWeight: { type: Number, required: true },
    },
  ],
  mouldNo: { type: String, required: true },
  noOfCavity: { type: Number, required: true },
  cycleTime: { type: Number, required: true },
  expectedCycles: { type: Number, required: true },
  noOfLabours: { type: Number, required: true },
  hardness: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

export default Product; // ES Module export

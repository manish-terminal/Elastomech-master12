import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaSave, FaTrashAlt } from "react-icons/fa";
import "./Inventory.css";

const FormulaInventory = () => {
  const [rubberIngredients, setRubberIngredients] = useState([]);
  const [chemicals, setChemicals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formulaBin, setFormulaBin] = useState([]); // Formula bin for batch weight and materials
  const [selectedFormula, setSelectedFormula] = useState(null); // Selected formula number
  const [batchWeight, setBatchWeight] = useState(0); // Batch weight for selected formula
  const [numberOfBatches, setNumberOfBatches] = useState(1); // Number of batches
  const [orders, setOrders] = useState([]); // Orders data to show in the table

  const [shift, setShift] = useState(""); // Shift
  const [orderNo, setOrderNo] = useState(""); // Order No.
  const [machineNo, setMachineNo] = useState(""); // Machine No.
  const [operator, setOperator] = useState(""); // Operator
  const [batchNo, setBatchNo] = useState(""); // Batch No.
  const [remarks, setRemarks] = useState(""); // Remarks

  // Fetch formula bin data
  const fetchFormulaBin = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/formulas"); // Fetch formulas
      const data = await response.json();
      setFormulaBin(data);
    } catch (error) {
      console.error("Error fetching formula bin:", error);
    }
  };

  // Fetch all items from the backend
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/items");
      const data = await response.json();
      const rubber = data.filter((item) => item.category === "rubber");
      const chemical = data.filter((item) => item.category === "chemical");
      setRubberIngredients(rubber);
      setChemicals(chemical);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchFormulaBin(); // Fetch the formula bin when component mounts
  }, []);

  // Function to handle formula selection
  const handleFormulaSelect = (formulaId) => {
    const selected = formulaBin.find((formula) => formula._id === formulaId);
    if (selected) {
      setSelectedFormula(selected);
      setBatchWeight(selected.totalWeight); // Set batch weight from formula
    }
  };

  // Function to handle order submission and inventory update
  const handleOrderSubmission = () => {
    if (
      !selectedFormula ||
      !shift ||
      !orderNo ||
      !machineNo ||
      !operator ||
      !batchNo
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const orderDetails = {
      date: new Date().toLocaleDateString(),
      shift,
      orderNo,
      machineNo,
      operator,
      batchNo,
      batchWeight,
      numberOfBatches,
      remarks,
      selectedFormulaId: selectedFormula._id, // Store the formula ID with the order
    };

    // Add order to the orders list
    setOrders((prevOrders) => [...prevOrders, orderDetails]);

    // After order submission, update the inventory
    const updatedFormulaBin = [...formulaBin];
    selectedFormula.ingredients.forEach((ingredient) => {
      const totalMaterialUsed = ingredient.consumption * numberOfBatches;

      // Update formula bin
      const formulaIndex = updatedFormulaBin.findIndex(
        (formula) => formula._id === selectedFormula._id
      );
      if (formulaIndex !== -1) {
        updatedFormulaBin[formulaIndex].totalQuantity -= totalMaterialUsed;
      }
    });

    // Update the state
    setFormulaBin(updatedFormulaBin);
  };

  if (loading) return <div>Loading...</div>;

  // Calculate the cumulative available quantity for the selected formula number
  const getCumulativeQuantity = () => {
    if (!selectedFormula) return 0;

    // Calculate the total used quantity for the selected formula
    let cumulativeQuantity = 0;

    // Add quantities used in previous orders
    orders.forEach((order) => {
      if (order.selectedFormulaId === selectedFormula._id) {
        cumulativeQuantity += order.batchWeight * order.numberOfBatches;
      }
    });

    // Add current order's batch weight * number of batches
    cumulativeQuantity += batchWeight * numberOfBatches;

    return cumulativeQuantity;
  };

  return (
    <div className="inventory-page p-6 bg-gray-100 min-h-screen">
      <motion.h2
        className="text-3xl font-bold text-gray-800 mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Formula Application and Inventory Update
      </motion.h2>

      {/* Formula Selection */}
      <div className="formula-selection mb-8 text-center">
        <label
          htmlFor="formula-select"
          className="text-lg font-medium text-gray-700"
        >
          Select Formula
        </label>
        <select
          id="formula-select"
          onChange={(e) => handleFormulaSelect(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select a formula</option>
          {formulaBin.map((formula) => (
            <option key={formula._id} value={formula._id}>
              {formula.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cumulative Quantity Display */}
      <div className="cumulative-quantity mb-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          Cumulative Available Quantity for Formula {selectedFormula?.name}:
        </p>
        <p className="text-xl font-bold text-gray-800">
          {getCumulativeQuantity()} KGS
        </p>
      </div>

      {/* User Inputs */}
      <div className="user-inputs mb-8 text-center">
        <div>
          <input
            type="text"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Shift"
          />
          <input
            type="text"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            className="ml-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Order No."
          />
        </div>
        <div className="mt-4">
          <input
            type="text"
            value={machineNo}
            onChange={(e) => setMachineNo(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Machine No."
          />
          <input
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="ml-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Operator"
          />
        </div>
        <div className="mt-4">
          <input
            type="text"
            value={batchNo}
            onChange={(e) => setBatchNo(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Batch No."
          />
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="ml-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Remarks"
          />
        </div>
        <div className="mt-4">
          <input
            type="number"
            value={batchWeight}
            readOnly
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
            placeholder="Batch Weight (kg)"
          />
          <input
            type="number"
            value={numberOfBatches}
            onChange={(e) => setNumberOfBatches(Number(e.target.value))}
            className="ml-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
            placeholder="Number of Batches"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleOrderSubmission}
          className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default FormulaInventory;

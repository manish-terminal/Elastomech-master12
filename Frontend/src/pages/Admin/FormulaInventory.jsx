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

  // Fetch orders from the backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/orders2");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchFormulaBin(); // Fetch the formula bin when component mounts
    fetchOrders(); // Fetch the orders from the backend
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
  const handleOrderSubmission = async () => {
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

    // POST request to save the order in the backend
    try {
      const response = await fetch("http://localhost:5001/api/orders2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      const newOrder = await response.json();
      if (response.ok) {
        // Add the new order to the orders list
        setOrders((prevOrders) => [...prevOrders, newOrder]);
        alert("Order submitted successfully!");

        // Update inventory (formula bin)
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
      } else {
        alert("Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Error submitting order");
    }
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
            name="shift"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Shift"
          />
          <input
            type="text"
            name="orderNo"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            className="ml-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Order No."
          />
        </div>
        <div className="mt-4">
          <input
            type="text"
            name="machineNo"
            value={machineNo}
            onChange={(e) => setMachineNo(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Machine No."
          />
          <input
            type="text"
            name="operator"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="ml-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Operator"
          />
        </div>
        <div className="mt-4">
          <input
            type="text"
            name="batchNo"
            value={batchNo}
            onChange={(e) => setBatchNo(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Batch No."
          />
          <textarea
            value={remarks}
            name="remarks"
            onChange={(e) => setRemarks(e.target.value)}
            className="ml-4 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Remarks"
          />
        </div>
        <div className="mt-4">
          <input
            type="number"
            name="batchWeight"
            value={batchWeight}
            readOnly
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none"
            placeholder="Batch Weight (kg)"
          />
          <input
            type="number"
            name="numberOfBatches"
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

      {/* Orders Table */}
      <div className="orders-table mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Order List
        </h3>
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Order No.</th>
              <th className="px-4 py-2">Shift</th>
              <th className="px-4 py-2">Batch No.</th>
              <th className="px-4 py-2">Batch Weight (kg)</th>
              <th className="px-4 py-2">Number of Batches</th>
              <th className="px-4 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{order.orderNo}</td>
                <td className="px-4 py-2">{order.shift}</td>
                <td className="px-4 py-2">{order.batchNo}</td>
                <td className="px-4 py-2">{order.batchWeight}</td>
                <td className="px-4 py-2">{order.numberOfBatches}</td>
                <td className="px-4 py-2">{order.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormulaInventory;

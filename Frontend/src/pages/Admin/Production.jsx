import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Production = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();

        const formattedOrders = data.map((order) => ({
          id: order._id,
          orderId: order.orderId,
          customerName: order.customerName,
          itemName: order.itemName,
          weightPerProduct: order.weightPerProduct,
          quantity: order.quantity,
          rubberIngredients: order.rubberIngredients.map((ingredient) => ({
            name: ingredient.name,
            ratio: ingredient.ratio,
            weight: ingredient.weight,
          })),
          chemicalIngredients: order.chemicalIngredients.map((ingredient) => ({
            name: ingredient.name,
            ratio: ingredient.ratio,
            weight: ingredient.weight,
          })),
          deliveryDate: new Date(order.deliveryDate).toLocaleDateString(),
          remarks: order.remarks,
          manufactured: order.manufactured || 0,
          rejected: order.rejected || 0,
          dispatchReady: order.manufactured === order.quantity, // Track if the order is ready for dispatch
        }));

        setOrders(formattedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle input changes for manufactured or rejected quantities
  const handleInputChange = (id, field, value) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? {
            ...order,
            [field]: Math.min(Number(value), order.quantity), // Prevent exceeding ordered quantity
          }
          : order
      )
    );
  };

  // Handle save of updated quantities
  const handleSave = async (id) => {
    const order = orders.find((order) => order.id === id);
    if (!order) return;

    // Validate if manufactured exceeds ordered quantity
    if (order.manufactured > order.quantity) {
      alert("Manufactured quantity cannot exceed ordered quantity.");
      return;
    }

    const updatedOrder = {
      manufactured: order.manufactured,
      rejected: order.rejected,
    };

    try {
      const response = await fetch(`http://localhost:5001/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to save order quantities");
      }

      const updatedOrderData = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id
            ? {
              ...order,
              manufactured: updatedOrderData.manufactured,
              rejected: updatedOrderData.rejected,
              dispatchReady: updatedOrderData.manufactured === updatedOrderData.quantity, // Ensure dispatchReady is updated
            }
            : order
        )
      );

      alert("Order quantities saved successfully!");
    } catch (error) {
      console.error("Error saving order quantities:", error);
      alert("Error saving order quantities.");
    }
  };


  const handleMoveToDispatch = async (order) => {
    const dispatchData = {
      orderId: order.orderId,
      itemName: order.itemName,
      action: "Move to Dispatch",
      status: "Pending",
      priority: "Normal",
    };

    try {
      const response = await fetch("http://localhost:5001/api/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dispatchData),
      });

      if (!response.ok) {
        throw new Error("Failed to move to dispatch");
      }

      const savedDispatch = await response.json();
      alert("Order moved to dispatch successfully!");
    } catch (error) {
      console.error("Error moving to dispatch:", error);
      alert("Error moving to dispatch.");
    }
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-center text-2xl font-bold text-green-600 mb-6">
        Production Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-lg">Loading orders...</p>
      ) : (
        <table className="w-full border-collapse shadow-lg">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="px-4 py-2 border">Order ID</th>
              <th className="px-4 py-2 border">Order Name</th>
              <th className="px-4 py-2 border">Ordered Quantity</th>
              <th className="px-4 py-2 border">Manufactured</th>
              <th className="px-4 py-2 border">Rejected</th>
              <th className="px-4 py-2 border">Rubber Ingredients</th>
              <th className="px-4 py-2 border">Chemical Ingredients</th>
              <th className="px-4 py-2 border">Delivery Date</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="bg-white border-b">
                <td className="px-4 py-2 border">{order.orderId}</td>
                <td className="px-4 py-2 border">{order.itemName}</td>
                <td className="px-4 py-2 border">{order.quantity}</td>
                <td className="px-4 py-2 border">
                  <input
                    type="number"
                    value={order.manufactured}
                    onChange={(e) =>
                      handleInputChange(order.id, "manufactured", e.target.value)
                    }
                    className="w-24 px-2 py-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <input
                    type="number"
                    value={order.rejected}
                    onChange={(e) =>
                      handleInputChange(order.id, "rejected", e.target.value)
                    }
                    className="w-24 px-2 py-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <ul className="list-disc pl-5">
                    {order.rubberIngredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.name} (Ratio: {ingredient.ratio}, Weight:{" "}
                        {ingredient.weight.toFixed(2)} kg)
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 border">
                  <ul className="list-disc pl-5">
                    {order.chemicalIngredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.name} (Ratio: {ingredient.ratio}, Weight:{" "}
                        {ingredient.weight.toFixed(2)} kg)
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 border">{order.deliveryDate}</td>
                <td className="px-4 py-2 border">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleSave(order.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>

                    {/* Always show "Move to Dispatch" if manufactured == quantity */}
                    {order.dispatchReady && (
                      <button
                        onClick={() => handleMoveToDispatch(order)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Move to Dispatch
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Production;

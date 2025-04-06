import React, { useEffect, useState } from "react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState(null); // Track which customer to delete

  // Fetch all customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:4001/user/users");
        if (!response.ok) {
          throw new Error("Failed to fetch customer data");
        }
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle editing a customer's name
  const handleEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:4001/user/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editedName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      const updatedCustomer = await response.json();

      // Update the customer in the state
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === id ? updatedCustomer : customer
        )
      );

      // Reset editing state
      setEditingCustomerId(null);
      setEditedName("");
    } catch (error) {
      console.error("Error updating customer:", error);
      setError("Failed to update customer");
    }
  };

  // Handle confirming delete action
  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:4001/user/users/${customerToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      // Remove the customer from the state
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer._id !== customerToDelete)
      );

      // Reset delete state
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError("Failed to delete customer");
    }
  };

  if (loading) {
    return <p className="text-center text-white">Loading customers...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customers</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-4 px-6 text-left">Name</th>
              <th className="py-4 px-6 text-left">Email</th>
              <th className="py-4 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr
                key={customer._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6 text-blue-600">
                  {editingCustomerId === customer._id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    customer.name
                  )}
                </td>
                <td className="py-4 px-6 text-blue-600">{customer.email}</td>
                <td className="py-4 px-6 flex gap-2">
                  {editingCustomerId === customer._id ? (
                    <button
                      onClick={() => handleEdit(customer._id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCustomerId(customer._id);
                        setEditedName(customer.name);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setCustomerToDelete(customer._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this customer?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 text-white border bg-blue-500 rounded hover:bg-blue-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

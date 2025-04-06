const Orders = () => {
    const orders = [
      { id: 1, customer: "John Doe", total: 99.99, status: "Shipped" },
      { id: 2, customer: "Jane Smith", total: 149.99, status: "Processing" },
      { id: 3, customer: "Bob Johnson", total: 79.99, status: "Delivered" },
      { id: 4, customer: "Alice Brown", total: 199.99, status: "Pending" },
    ]
  
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Orders</h1>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Total</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-2 px-4 border-b">{order.id}</td>
                <td className="py-2 px-4 border-b">{order.customer}</td>
                <td className="py-2 px-4 border-b">${order.total.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{order.status}</td>
                <td className="py-2 px-4 border-b">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  export default Orders
  
  
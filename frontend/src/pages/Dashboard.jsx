const Dashboard = () => {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-600 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-3xl font-bold">573</p>
          </div>
          <div className="bg-blue-600 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-3xl font-bold">2,350</p>
          </div>
          <div className="bg-blue-600 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Customers</h2>
            <p className="text-3xl font-bold">12,234</p>
          </div>
        </div>
      </div>
    )
  }
  
  export default Dashboard
  
  
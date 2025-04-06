const AdminProducts = () => {
    const products = [
      { id: 1, name: "Premium Dog Food", price: 49.99, stock: 100 },
      { id: 2, name: "Dog Collar", price: 15.99, stock: 200 },
      { id: 3, name: "Dog Leash", price: 12.99, stock: 150 },
      { id: 4, name: "Dog Toy", price: 9.99, stock: 300 },
    ]
  
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">Products</h1>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Stock</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b">{product.category}</td>
                <td className="py-2 px-4 border-b">{product.stock}</td>
                <td className="py-2 px-4 border-b">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  export default AdminProducts
  
  
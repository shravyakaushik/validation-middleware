import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [items, setItems] = useState([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemsFetched, setItemsFetched] = useState(false); // Track if items have been fetched

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setMessage(response.data.message);
      if (response.data.session) {
        setToken(response.data.session.token);
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'An error occurred');
      } else if (error.request) {
        setMessage('No response from the server');
      } else {
        setMessage('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setItemLoading(true);
    setMessage('');
    try {
      await axios.post(
        'http://localhost:5000/items',
        { name: itemName, description: itemDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Item added successfully');
      // Clear form fields
      setItemName('');
      setItemDescription('');
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'An error occurred');
      } else if (error.request) {
        setMessage('No response from the server');
      } else {
        setMessage('Error: ' + error.message);
      }
    } finally {
      setItemLoading(false);
    }
  };

  const fetchItems = async () => {
    setItemLoading(true);
    setMessage('');
    try {
      const response = await axios.get('http://localhost:5000/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
      setItemsFetched(true); // Set flag to true after items are fetched
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'An error occurred');
      } else if (error.request) {
        setMessage('No response from the server');
      } else {
        setMessage('Error: ' + error.message);
      }
    } finally {
      setItemLoading(false);
    }
  };

  return (
    <div>
      {/* Login Form */}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p>{message}</p>
      </form>

      {/* Item Form */}
      {token && (
        <div>
          <h2>Add Item</h2>
          <form onSubmit={handleAddItem}>
            <label>
              Item Name:
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Item Description:
              <input
                type="text"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
            </label>
            <br />
            <button type="submit" disabled={itemLoading}>
              {itemLoading ? 'Adding...' : 'Add Item'}
            </button>
            <p>{message}</p>
          </form>
        </div>
      )}

      {/* Get Items Button */}
      {token && (
        <div>
          <button onClick={fetchItems} disabled={itemLoading}>
            {itemLoading ? 'Loading items...' : 'Get Items'}
          </button>
        </div>
      )}

      {/* Item List */}
      {token && itemsFetched && (
        <div>
          <h2>Items</h2>
          {itemLoading ? (
            <p>Loading items...</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>{item.name}: {item.description}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;

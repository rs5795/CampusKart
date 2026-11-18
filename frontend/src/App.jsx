
import { useEffect, useState } from 'react';
import './App.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://campuskart-oek4.onrender.com'
).replace(/\/$/, '');

const API = `${API_BASE_URL}/api/products`;

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showSellForm, setShowSellForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '1',
    condition_status: 'good'
  });

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid product data');
      }

      setProducts(data);
      setError('');

    } catch (err) {
      console.error('FETCH ERROR:', err);
      setError('Unable to load products. Please try again.');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // HANDLE FORM INPUTS
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // SELL PRODUCT
  const handleSell = async (e) => {
    e.preventDefault();
    setFormMessage('');

    if (
      !form.title.trim() ||
      !form.price ||
      !form.category_id ||
      Number(form.price) <= 0
    ) {
      setFormMessage('Please enter valid product details.');
      return;
    }

    setSubmitting(true);

    const productData = {
      seller_id: 4,
      category_id: Number(form.category_id),
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      condition_status: form.condition_status
    };

    console.log('SENDING PRODUCT:', productData);

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      console.log('POST RESPONSE:', response.status, result);

      if (!response.ok) {
        throw new Error(result.error || 'Could not list product');
      }

      setFormMessage('Product listed successfully!');

      setForm({
        title: '',
        description: '',
        price: '',
        category_id: '1',
        condition_status: 'good'
      });

      await fetchProducts();

      setShowSellForm(false);
      setFormMessage('');

      document.getElementById('products')?.scrollIntoView({
        behavior: 'smooth'
      });

    } catch (err) {
      console.error('SELL PRODUCT ERROR:', err);
      setFormMessage(err.message || 'Something went wrong.');

    } finally {
      setSubmitting(false);
    }
  };

  // SEARCH AND FILTER
  const filteredProducts = products.filter(product => {
    const query = search.toLowerCase();

    return (
      (product.title || '').toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="app">

      {/* NAVIGATION */}
      <nav className="navbar">
        <h1 className="logo">
          Campus<span>Kart.</span>
        </h1>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Marketplace</a>
          <a href="#about">About</a>
        </div>

        <button
          className="sell-btn"
          onClick={() => {
            setFormMessage('');
            setShowSellForm(true);
          }}
        >
          + Sell an Item
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">

          <p className="tagline">
            YOUR CAMPUS. YOUR MARKETPLACE.
          </p>

          <h1>
            Buy. Sell. <span>Reuse.</span>
          </h1>

          <p>
            Everything you need, right within your campus.
            Buy and sell pre-loved essentials with fellow students.
          </p>

          <a href="#products" className="explore-btn">
            Explore Marketplace →
          </a>

        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="marketplace" id="products">

        <div className="section-heading">

          <div>
            <p className="tagline">
              DISCOVER SOMETHING NEW
            </p>

            <h2>Campus Marketplace</h2>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-box"
          />

        </div>

        {loading ? (
          <p className="message">Loading products...</p>

        ) : error ? (

          <div className="message">
            <p>{error}</p>
            <button onClick={() => {
              setLoading(true);
              fetchProducts();
            }}>
              Retry
            </button>
          </div>

        ) : filteredProducts.length === 0 ? (

          <p className="message">No products found.</p>

        ) : (

          <div className="product-grid">

            {filteredProducts.map(product => (

              <div
                className="product-card"
                key={product.product_id}
              >

                <div className="product-image">

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                    />
                  ) : (
                    <span>📚</span>
                  )}

                </div>

                <div className="product-info">

                  <span className="condition">
                    {product.condition_status}
                  </span>

                  <h3>{product.title}</h3>

                  <p>{product.description}</p>

                  <div className="product-bottom">
                    <strong>₹{product.price}</strong>
                    <span>{product.status || 'Available'}</span>
                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

      {/* ABOUT */}
      <section className="about" id="about">

        <h2>Why CampusKart?</h2>

        <p>
          A student-powered marketplace that makes campus
          buying and selling affordable, convenient and sustainable.
        </p>

      </section>

      {/* FOOTER */}
      <footer>
        © 2026 CampusKart. Made for students, by students.
      </footer>

      {/* SELL PRODUCT MODAL */}
      {showSellForm && (

        <div className="sell-overlay">

          <div className="sell-modal">

            <button
              className="close-modal"
              onClick={() => setShowSellForm(false)}
              type="button"
            >
              ×
            </button>

            <h2>Sell an Item</h2>

            <p>List your product on CampusKart.</p>

            <form onSubmit={handleSell}>

              <label>Product Name *</label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter product name"
                maxLength={150}
                required
              />

              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product"
                rows="3"
              />

              <label>Price (₹) *</label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0.01"
                step="0.01"
                required
              />

              <label>Category *</label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="1">Books</option>
                <option value="2">Electronics</option>
                <option value="3">Stationery</option>
                <option value="4">Furniture</option>
                <option value="5">Other</option>
              </select>

              <label>Condition *</label>

              <select
                name="condition_status"
                value={form.condition_status}
                onChange={handleChange}
                required
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>

              {formMessage && (
                <p className="form-message">
                  {formMessage}
                </p>
              )}

              <button
                type="submit"
                className="submit-sell-btn"
                disabled={submitting}
              >
                {submitting ? 'Listing...' : 'List Product'}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;

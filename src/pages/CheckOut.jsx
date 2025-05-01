import useCartStore from '../store/cartStore'
import { useNavigate } from 'react-router-dom'

const CheckoutPage = () => {
  const { cart, clearCart } = useCartStore()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Your cart is empty.")
    // Future: send data to backend and process payment
    alert("Order placed successfully!")
    clearCart()
    navigate('/')
  }

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      {cart.map((item) => (
        <div key={item.id} className="checkout-item">
          <p>{item.title} x {item.quantity}</p>
        </div>
      ))}
      <button onClick={handleCheckout}>Place Order</button>
    </div>
  )
}

export default CheckoutPage

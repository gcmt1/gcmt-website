// import useCartStore from '../store/cartStore'
// import { Link, useNavigate } from 'react-router-dom'

// const CartPage = () => {
//   const { cart, removeFromCart, updateQuantity } = useCartStore()
//   const navigate = useNavigate()

//   const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

//   return (
//     <div className="cart-page">
//       <h2>Your Cart</h2>
//       {cart.length === 0 ? (
//         <p>Your cart is empty. <Link to="/">Go shopping</Link></p>
//       ) : (
//         <>
//           {cart.map((item) => (
//             <div key={item.id} className="cart-item">
//               <img src={item.image} alt={item.title} />
//               <div>
//                 <h4>{item.title}</h4>
//                 <p>₹{item.price}</p>
//                 <input
//                   type="number"
//                   value={item.quantity}
//                   min="1"
//                   onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
//                 />
//                 <button onClick={() => removeFromCart(item.id)}>Remove</button>
//               </div>
//             </div>
//           ))}
//           <hr />
//           <div className="cart-summary">
//             <h3>Subtotal: ₹{subtotal}</h3>
//             <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// export default CartPage

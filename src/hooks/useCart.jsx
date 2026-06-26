import toast from 'react-hot-toast'
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
const CartContext = createContext()


export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {

  const storedCart = localStorage.getItem('cart')

  return storedCart
    ? JSON.parse(storedCart)
    : []

})
  function addToCart(product) {

    toast.success(`${product.name} adicionado`)

    setCart(prev => {

      const existing = prev.find(
        item => item.id === product.id
      )

      if (existing) {

        return prev.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        )
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1
        }
      ]
    })
  }

  function removeFromCart(id) {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1
              }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

function clearCart() {
  setCart([])
}

useEffect(() => {

  localStorage.setItem(
    'cart',
    JSON.stringify(cart)
  )

}, [cart])

  const total = cart.reduce(
    (acc, item) =>
      acc + Number(item.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
  cart,
  addToCart,
  removeFromCart,
  clearCart,
  total
}}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
import ProductGrid from "@/components/product-grid"
import { CartProvider } from "@/components/cart-context"
import CartDrawer from "@/components/cart-drawer"
import SideBar from "@/components/side-bar"

export default function Home() {
  return (
    <CartProvider>
      <div className="min-vh-100 bg-light">
        <SideBar />
        <main className="container py-4">
          <h1 className="mb-4">Our Products</h1>
          <ProductGrid />
        </main>
        <CartDrawer />
      </div>
    </CartProvider>
  )
}

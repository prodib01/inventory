import ProductGrid from "@/components/product-grid"
import { CartProvider } from "@/components/cart-context"
import CartDrawer from "@/components/cart-drawer"
import { SidebarLayout } from "@/components/side-bar"

export default function Home() {
  return (
    <CartProvider>
      <SidebarLayout>
        <div className="container py-4">
          <h1 className="mb-4">Our Products</h1>
          <ProductGrid />
          <CartDrawer />
        </div>
      </SidebarLayout>
    </CartProvider>
  )
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Ingredient = {
  id: string
  ingredient_name: string
  origin: string | null
  supplier_name: string | null
  supplier_address: string | null
}

type Product = {
  id: string
  product_name: string
  image_url: string | null
  ingredients: Ingredient[]
}

type Merchant = {
  id: string
  market_name: string
  stall_name: string
  stall_no: string | null
  contact_name: string | null
  phone: string | null
  products: Product[]
}

export default async function AdminPage() {
  const { data } = await supabase
    .from('merchants')
    .select(`
      id,
      market_name,
      stall_name,
      stall_no,
      contact_name,
      phone,
      products (
        id,
        product_name,
        image_url,
        ingredients (
          id,
          ingredient_name,
          origin,
          supplier_name,
          supplier_address
        )
      )
    `)
    .order('created_at', { ascending: false })

  const merchants = (data ?? []) as unknown as Merchant[]

  return (
    <main className="container">
      <div className="stack">
        <div className="card">
          <h1 className="section-title">管理後台</h1>
          <p className="muted">這裡會顯示所有已回收的商家、商品、食材與照片。</p>
        </div>

        {merchants.length === 0 ? (
          <div className="card">目前還沒有資料。</div>
        ) : (
          merchants.map((merchant) => (
            <div className="card stack" key={merchant.id}>
              <div>
                <h2 className="sub-title">{merchant.stall_name}</h2>
                <p className="muted">
                  {merchant.market_name} / 攤位 {merchant.stall_no || '未填'}
                </p>
                <p className="muted">
                  聯絡人：{merchant.contact_name || '未填'} / 電話：
                  {merchant.phone || '未填'}
                </p>
              </div>

              <div className="stack">
                {merchant.products?.map((product) => (
                  <div className="card stack" key={product.id}>
                    <div>
                      <strong>{product.product_name}</strong>
                    </div>

                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        style={{
                          width: '200px',
                          marginTop: '10px',
                          borderRadius: '8px',
                        }}
                      />
                    )}

                    <ul className="list">
                      {product.ingredients?.map((ingredient) => (
                        <li key={ingredient.id}>
                          {ingredient.ingredient_name}｜品牌：
                          {ingredient.origin || '未填'}｜供應商：
                          {ingredient.supplier_name || '未填'}｜地址：
                          {ingredient.supplier_address || '未填'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
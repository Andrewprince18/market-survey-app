'use client'

import { useState } from 'react'
import imageCompression from "browser-image-compression"

type Ingredient = {
  ingredient_name: string
  origin: string
  supplier_name: string
  supplier_address: string
}

type Product = {
  product_name: string
  image_url: string | null
  image?: File
  ingredients: Ingredient[]
}

const emptyIngredient = (): Ingredient => ({
  ingredient_name: '',
  origin: '',
  supplier_name: '',
  supplier_address: '',
})

const emptyProduct = (): Product => ({
  product_name: '',
  image_url: null,
  image: undefined,
  ingredients: [emptyIngredient()],
})

export default function HomePage() {
  const [marketName, setMarketName] = useState('')
  const [stallName, setStallName] = useState('')
  const [stallNo, setStallNo] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [products, setProducts] = useState<Product[]>([emptyProduct()])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const updateProduct = (
    index: number,
    key: keyof Product,
    value: string | File | Ingredient[] | null | undefined
  ) => {
    setProducts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value } as Product
      return next
    })
  }

  const updateIngredient = (
    productIndex: number,
    ingredientIndex: number,
    key: keyof Ingredient,
    value: string
  ) => {
    setProducts((prev) => {
      const next = [...prev]
      next[productIndex].ingredients[ingredientIndex] = {
        ...next[productIndex].ingredients[ingredientIndex],
        [key]: value,
      }
      return [...next]
    })
  }

  const addProduct = () => setProducts((prev) => [...prev, emptyProduct()])

  const addIngredient = (productIndex: number) => {
    setProducts((prev) => {
      const next = [...prev]
      next[productIndex].ingredients.push(emptyIngredient())
      return [...next]
    })
  }

  const removeProduct = (productIndex: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== productIndex))
  }

  const removeIngredient = (productIndex: number, ingredientIndex: number) => {
    setProducts((prev) => {
      const next = [...prev]
      next[productIndex].ingredients = next[productIndex].ingredients.filter(
        (_, i) => i !== ingredientIndex
      )
      return [...next]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('market_name', marketName)
      formData.append('stall_name', stallName)
      formData.append('stall_no', stallNo)
      formData.append('contact_name', contactName)
      formData.append('phone', phone)

      formData.append(
        'products',
        JSON.stringify(
          products.map((product) => ({
            product_name: product.product_name,
            ingredients: product.ingredients,
          }))
        )
      )

      products.forEach((product, index) => {
        if (product.image) {
          formData.append(`product_image_${index}`, product.image)
        }
      })

      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error ?? '送出失敗')
        setLoading(false)
        return
      }

      setMessage('送出成功，感謝填寫。')
      setMarketName('')
      setStallName('')
      setStallNo('')
      setContactName('')
      setPhone('')
      setProducts([emptyProduct()])
      setLoading(false)
    } catch {
      setMessage('送出失敗')
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <div className="stack">
        <div className="card">
          <h1 className="section-title">傳統市場商品與食材來源調查</h1>
          <p className="muted">
            請填寫商家資訊、商品名稱，以及每項商品使用的食材來源與供應商資訊。
          </p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <section className="card stack">
            <h2 className="sub-title">商家基本資料</h2>
            <div className="grid2">
              <input
                className="input"
                placeholder="市場名稱"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="攤位名稱"
                value={stallName}
                onChange={(e) => setStallName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="攤位編號"
                value={stallNo}
                onChange={(e) => setStallNo(e.target.value)}
              />
              <input
                className="input"
                placeholder="聯絡人姓名"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <input
                className="input"
                placeholder="聯絡電話"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </section>

          <section className="stack">
            <div className="row">
              <h2 className="sub-title" style={{ margin: 0 }}>
                商品資料
              </h2>
              <button
                type="button"
                className="button secondary"
                onClick={addProduct}
              >
                + 新增商品
              </button>
            </div>

            {products.map((product, productIndex) => (
              <div className="card stack" key={productIndex}>
                <div className="row">
                  <h3 className="sub-title" style={{ margin: 0 }}>
                    商品 {productIndex + 1}
                  </h3>
                  {products.length > 1 && (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => removeProduct(productIndex)}
                    >
                      刪除此商品
                    </button>
                  )}
                </div>

                <div className="grid2">
                  <input
                    className="input"
                    placeholder="商品或餐點名稱"
                    value={product.product_name}
                    onChange={(e) =>
                      updateProduct(
                        productIndex,
                        'product_name',
                        e.target.value
                      )
                    }
                    required
                  />

                  <label className="button secondary">
                    上傳商品照片
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.currentTarget.files?.[0]
                        if (!file) return

                        try {
                          const compressedBlob = await imageCompression(file, {
                            maxSizeMB: 0.8,
                            maxWidthOrHeight: 1280,
                            useWebWorker: true,
                          })

                          const compressedFile = new File(
                            [compressedBlob],
                            file.name,
                            { type: compressedBlob.type || file.type }
                          )

                          updateProduct(productIndex, "image", compressedFile)

                        } catch (error) {
                          console.error("圖片壓縮失敗", error)
                          alert("圖片處理失敗，請重新選擇照片")
                        }
                      }}
                    />
                  </label>
                </div>

                {product.image && (
                  <img
                    src={URL.createObjectURL(product.image)}
                    alt="商品預覽"
                    style={{
                      width: '200px',
                      marginTop: '10px',
                      borderRadius: '8px',
                    }}
                  />
                )}

                <div className="stack">
                  <div className="row">
                    <h4 className="sub-title" style={{ margin: 0 }}>
                      食材資料
                    </h4>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => addIngredient(productIndex)}
                    >
                      + 新增食材
                    </button>
                  </div>

                  {product.ingredients.map((ingredient, ingredientIndex) => (
                    <div className="card stack" key={ingredientIndex}>
                      <div className="grid2">
                        <input
                          className="input"
                          placeholder="食材名稱"
                          value={ingredient.ingredient_name}
                          onChange={(e) =>
                            updateIngredient(
                              productIndex,
                              ingredientIndex,
                              'ingredient_name',
                              e.target.value
                            )
                          }
                        />
                        <input
                          className="input"
                          placeholder="品牌"
                          value={ingredient.origin}
                          onChange={(e) =>
                            updateIngredient(
                              productIndex,
                              ingredientIndex,
                              'origin',
                              e.target.value
                            )
                          }
                        />
                        <input
                          className="input"
                          placeholder="供應商名稱"
                          value={ingredient.supplier_name}
                          onChange={(e) =>
                            updateIngredient(
                              productIndex,
                              ingredientIndex,
                              'supplier_name',
                              e.target.value
                            )
                          }
                        />
                        <input
                          className="input"
                          placeholder="供應商地址"
                          value={ingredient.supplier_address}
                          onChange={(e) =>
                            updateIngredient(
                              productIndex,
                              ingredientIndex,
                              'supplier_address',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {product.ingredients.length > 1 && (
                        <div>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() =>
                              removeIngredient(productIndex, ingredientIndex)
                            }
                          >
                            刪除此食材
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <div className="row">
            <button disabled={loading} className="button" type="submit">
              {loading ? '送出中...' : '送出表單'}
            </button>
            {message ? <p className="muted">{message}</p> : null}
          </div>
        </form>
      </div>
    </main>
  )
}
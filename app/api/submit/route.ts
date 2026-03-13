import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Ingredient = {
  ingredient_name: string
  origin?: string
  supplier_name?: string
  supplier_address?: string
}

type Product = {
  product_name: string
  ingredients: Ingredient[]
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const market_name = String(formData.get('market_name') ?? '')
    const stall_name = String(formData.get('stall_name') ?? '')
    const stall_no = String(formData.get('stall_no') ?? '')
    const contact_name = String(formData.get('contact_name') ?? '')
    const phone = String(formData.get('phone') ?? '')
    const productsRaw = String(formData.get('products') ?? '[]')
    const products = JSON.parse(productsRaw) as Product[]

    if (!market_name || !stall_name) {
      return Response.json(
        { error: '市場名稱與攤位名稱為必填' },
        { status: 400 }
      )
    }

    if (!Array.isArray(products) || products.length === 0) {
      return Response.json({ error: '至少需要一項商品' }, { status: 400 })
    }

    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .insert({
        market_name,
        stall_name,
        stall_no: stall_no || null,
        contact_name: contact_name || null,
        phone: phone || null,
      })
      .select()
      .single()

    if (merchantError) {
      return Response.json({ error: merchantError.message }, { status: 500 })
    }

    for (let index = 0; index < products.length; index++) {
      const product = products[index]

      if (!product.product_name?.trim()) continue

      let image_url: string | null = null
      const imageFile = formData.get(`product_image_${index}`)

      if (imageFile instanceof File && imageFile.size > 0) {
        const ext = imageFile.name.split('.').pop() || 'jpg'
        const filePath = `${merchant.id}/${Date.now()}-${index}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, {
            upsert: false,
            contentType: imageFile.type,
          })

        if (uploadError) {
          return Response.json({ error: uploadError.message }, { status: 500 })
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        image_url = publicUrlData.publicUrl
      }

      const { data: productRow, error: productError } = await supabase
        .from('products')
        .insert({
          merchant_id: merchant.id,
          product_name: product.product_name,
          image_url,
        })
        .select()
        .single()

      if (productError) {
        return Response.json({ error: productError.message }, { status: 500 })
      }

      const ingredientRows = (product.ingredients || [])
        .filter((item) => item.ingredient_name?.trim())
        .map((item) => ({
          product_id: productRow.id,
          ingredient_name: item.ingredient_name,
          origin: item.origin ?? null,
          supplier_name: item.supplier_name ?? null,
          supplier_address: item.supplier_address ?? null,
        }))

      if (ingredientRows.length > 0) {
        const { error: ingredientError } = await supabase
          .from('ingredients')
          .insert(ingredientRows)

        if (ingredientError) {
          return Response.json(
            { error: ingredientError.message },
            { status: 500 }
          )
        }
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: '資料送出失敗' }, { status: 500 })
  }
}
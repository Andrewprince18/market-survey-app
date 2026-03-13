import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (!process.env.ADMIN_PASSWORD) {
      return Response.json({ error: '伺服器未設定管理密碼' }, { status: 500 })
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: '密碼錯誤' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'ok', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: '登入失敗' }, { status: 500 })
  }
}
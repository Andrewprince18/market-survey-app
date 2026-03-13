'use client'

import { useState } from 'react'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error ?? '登入失敗')
      setLoading(false)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <main className="container">
      <div className="stack" style={{ maxWidth: '420px', margin: '80px auto' }}>
        <div className="card">
          <h1 className="section-title">管理後台登入</h1>
          <p className="muted">請輸入管理密碼</p>

          <form onSubmit={handleLogin} className="stack" style={{ marginTop: '16px' }}>
            <input
              type="password"
              className="input"
              placeholder="管理密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="button" disabled={loading}>
              {loading ? '登入中...' : '登入'}
            </button>

            {message ? <p className="muted">{message}</p> : null}
          </form>
        </div>
      </div>
    </main>
  )
}
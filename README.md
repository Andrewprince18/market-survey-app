# 傳統市場商品調查網站

這是一個用 **Next.js + Supabase** 做的簡易資料收集網站，適合讓商家自行填寫：

- 商家基本資料
- 多個商品
- 每個商品可新增多個食材
- 食材產地、供應商、供應商地址
- 管理後台查看回收資料

## 1. 安裝

先安裝 Node.js 18+，然後在終端機執行：

```bash
npm install
```

## 2. 建立 Supabase 專案

到 Supabase 建立新專案，打開 SQL Editor，把 `supabase/schema.sql` 的內容貼上執行。

## 3. 設定環境變數

複製 `.env.example` 成 `.env.local`：

```bash
cp .env.example .env.local
```

然後把三個值換成你自己的：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4. 啟動

```bash
npm run dev
```

打開：

- 商家填寫頁：`http://localhost:3000`
- 管理後台：`http://localhost:3000/admin`

## 5. 注意

目前 `/admin` 沒有做登入保護，建議你正式上線前至少加一層密碼或登入機制。

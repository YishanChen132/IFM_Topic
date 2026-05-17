# 目前進度
目前後端什麼都沒有，先用 Mock Data 頂著，前端已經可以跑起來！

# 專案架構說明
frontend/：專案的核心，存放所有的 React + Vite 前端程式碼。
backend/：(施工中) 目前僅存放 Mock Data 供前端測試使用。
server.mjs：正式環境用的伺服器，已設定好支援 React Router，重新整理網頁也不會斷掉。

## 準備工作

在開始之前，請確認你的電腦有：
- **Node.js**: v20 或更高版本
- **npm**: v10 或更高版本


## 🏃 啟動步驟
### 1. 安裝必要套件
拿到程式碼後，第一步請先安裝依賴：
```bash
npm install


2. 啟動成品 (Production Mode)
如果你只是想看看目前的成品，執行這個指令：
```bash
npm start
啟動後，請打開瀏覽器前往： http://localhost:4173


如果你不想在電腦裝一堆 Node.js 環境，只要你有安裝 Docker，可以直接一鍵搞定：
```bash
docker compose up --build




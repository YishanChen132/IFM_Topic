# IFM Workspace

## 安裝

以下將會引導你如何安裝此專案到你的電腦上。

Node.js 版本建議為：`20` 以上  
npm 版本建議為：`10` 以上

### 取得專案

```bash
git clone git@github.com:YishanChen132/IFM_Topic.git
```

### 移動到專案內

```bash
cd IFM_Topic
```

### 安裝套件

```bash
npm install
```

### 環境變數設定

目前此專案沒有必填的 `.env.example` 與 `.env` 設定檔。  
專案目前使用前端 mock 資料，安裝完成後可直接執行。

### 運行專案

```bash
npm start
```

### 開啟專案

在瀏覽器網址列輸入以下即可看到畫面：

```bash
http://localhost:4173/
```

## 環境變數說明

目前此專案沒有必填環境變數。

可選參數如下：

```bash
HOST=127.0.0.1 # 伺服器綁定位置，預設為 127.0.0.1
PORT=4173      # 專案啟動埠號，預設為 4173
```

如果需要讓區網其他裝置連線，可使用：

```bash
HOST=0.0.0.0 npm start
```

## 資料夾說明

- `frontend/src/pages` - 頁面元件放置處
- `frontend/src/components` - 共用元件放置處
- `frontend/src/features` - 功能模組放置處
- `frontend/src/router` - 路由設定放置處
- `frontend/src/services` - 資料服務與存取邏輯放置處
- `frontend/src/store` - 狀態管理放置處
- `frontend/src/mocks` - mock 資料放置處
- `frontend/src/types` - TypeScript 型別定義放置處
- `frontend/tests` - 測試檔案放置處
- `backend` - 預留後端目錄，目前未接入執行流程

## 專案技術

- Node.js `20+`
- npm `10+`
- React `19.2.0`
- React DOM `19.2.0`
- React Router DOM `7.9.4`
- TypeScript `5.9.2`
- Vite `7.1.9`
- Vitest `3.2.4`
- ESLint `9.17.0`
- Docker / Docker Compose

## 第三方服務

目前此專案未串接第三方服務。

## CI/CD 說明

目前此專案內尚未提供 CI/CD 設定檔，因此發起 PR 或 merge 分支時，不會自動執行建置、測試或部署流程。

如果你之後要補上 CI/CD，建議至少加入以下流程：

- 建立 Node.js 環境
- 安裝相依套件
- 執行 `npm run build`
- 執行 `npm run test`
- 執行 `npm run type-check`

## 其他常用指令

### 開發模式

```bash
npm run dev
```

### 執行測試

```bash
npm run test
```

### 型別檢查

```bash
npm run type-check
```

### 建置正式版

```bash
npm run build
```

### Docker 啟動

```bash
docker compose up --build
```

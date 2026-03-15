# Al-Menassa - المنصة

## تشغيل محلي (Local)

### المتطلبات
- Node.js + npm
- Docker + Docker Compose

### 1) قاعدة البيانات (Postgres + PostGIS)
- شغّل قاعدة البيانات:

```bash
docker compose up -d
```

### 2) إعداد المتغيرات (Environment)
- انسخ ملف المتغيرات:

```bash
cp .env.example .env
```

### 3) Prisma
```bash
npx prisma migrate dev
```

### 4) تشغيل التطبيق
```bash
npm run dev
```

يفتح على:
- http://localhost:3000

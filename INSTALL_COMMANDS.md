# คำสั่งติดตั้ง Dependencies

## วิธีที่ 1: ติดตั้งทั้งหมดพร้อมกัน
```bash
npm install @radix-ui/react-dialog@^1.1.4 @radix-ui/react-label@^2.1.2 @radix-ui/react-progress@^1.1.1 @radix-ui/react-select@^2.1.5 @radix-ui/react-slot@^1.1.1 @radix-ui/react-switch@^1.1.3
```

## วิธีที่ 2: ติดตั้งทีละตัว (ถ้าวิธีที่ 1 ไม่ได้ผล)
```bash
npm install @radix-ui/react-dialog@^1.1.4
npm install @radix-ui/react-label@^2.1.2
npm install @radix-ui/react-progress@^1.1.1
npm install @radix-ui/react-select@^2.1.5
npm install @radix-ui/react-slot@^1.1.1
npm install @radix-ui/react-switch@^1.1.3
```

## วิธีที่ 3: ลบ node_modules และติดตั้งใหม่ทั้งหมด
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

## หลังจากติดตั้งเสร็จ
```bash
# ลบ cache
rmdir /s /q .next

# รัน dev server
npm run dev
```

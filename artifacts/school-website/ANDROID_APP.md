# เตรียมเว็บโรงเรียนเป็นแอป Android

เว็บนี้ตั้งค่าเป็น PWA แล้ว: มี manifest, ไอคอน, โหมด standalone, เมนูแอปบนมือถือ และแคชเฉพาะ app shell เพื่อเปิดหน้าเว็บที่เคยโหลดได้เมื่อออฟไลน์ ข้อมูลจาก API และกล่องข้อความแอดมินจะไม่ถูกแคช

## สร้าง APK

1. เผยแพร่เว็บและ API ก่อน เพื่อให้ได้ URL HTTPS ที่ใช้งานจริง
2. ตรวจว่า URL เปิดหน้าเว็บได้ และเปิด `/manifest.webmanifest` ได้
3. นำ URL เว็บที่เผยแพร่เข้า PWABuilder แล้วเลือกสร้าง Android package
4. ตั้งชื่อแอปและ application ID ก่อน build จากนั้นเซ็น APK/AAB ด้วย keystore ที่เก็บไว้อย่างปลอดภัย
5. ทดสอบติดตั้งบน Android และตรวจว่าฟอร์มติดต่อกับหน้าแอดมินเรียก API ของ production ได้

การแก้ชื่อที่แสดงทำได้ใน `public/manifest.webmanifest`; ชื่อ package สำหรับ Android ต้องตั้งในขั้นตอนสร้าง Android package ด้วย
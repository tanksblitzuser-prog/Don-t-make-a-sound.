# FRIENDS ESCAPE — onlayn multiplayer

Bu papka o‘yinning **onlayn** versiyasi: `public/index.html` (o‘yin) + `server.js` (Node.js + Socket.IO).
Do‘stlaringiz havola orqali sizning lobbyingizga kiradi, ekranda ularning personajlari ko‘rinadi, chat va ovozli aloqa ishlaydi.

## 1. GitHub'ga yuklash
1. github.com'da yangi repo oching (masalan `friends-escape`).
2. Shu papkadagi hamma fayllarni (`server.js`, `package.json`, `render.yaml`, `public/` papkasi) repoga yuklang
   (`Add file → Upload files`, yoki `git push`).

## 2. Render'ga joylash (muhim: *Static Site* emas, *Web Service*)
1. render.com → **New → Web Service** → GitHub repongizni tanlang.
2. Sozlamalar: **Runtime: Node**, **Build Command:** `npm install`, **Start Command:** `npm start`
   (repoda `render.yaml` bor, Blueprint orqali ham bo‘ladi).
3. Deploy tugagach manzil chiqadi: `https://friends-escape.onrender.com`.

> Bepul rejada server 15 daqiqa harakatsiz tursa uxlaydi, birinchi kirishda 30–60 soniya kutish kerak.

## 3. Do‘stlarni taklif qilish
1. Saytni oching. Yuqorida **Onlayn** yozuvi va 5 belgili **xona kodi** ko‘rinadi.
2. **Nusxalash** tugmasi taklif havolasini nusxalaydi (`https://.../#K7Q2M`). Do‘stlarga yuboring.
3. Do‘st havolani ochsa, avtomatik sizning lobbyingizga kiradi (4 kishigacha). Boshqa kod bilan kirish uchun **KOD → Kirish**.
4. Faqat **host** (xonani ochgan kishi) rejimni tanlaydi va **O‘YINNI BOSHLASH** ni bosadi. Hamma bir xil xaritada boshlaydi.

## Qanday ishlaydi
- Xarita **bir xil seed** bilan yaratiladi, shuning uchun hamma o‘yinchida plitalar, siniq plitalar bir xil joyda.
- Ilon (maxluq) **hostning** brauzerida hisoblanadi va boshqalarga uzatiladi. Har kim chiqargan tovush (suvga tushish, tosh, ovoz) ilonga yetib boradi.
- Ovozli aloqa: WebRTC (brauzerlar o‘rtasida to‘g‘ridan-to‘g‘ri), Google STUN serveri orqali. Ba’zi qattiq tarmoqlarda (NAT) TURN server kerak bo‘lishi mumkin.
- Mikrofon: **V** bir marta bossangiz yoqiladi, yana bosganda o‘chadi.

## Mahalliy sinash
```
npm install
npm start
```
So‘ng `http://localhost:3000` ni ikki xil brauzer oynasida oching.

## Cheklovlar
- Toshlar va energetiklar har bir o‘yinchida alohida (sinxronlanmaydi); plita sinishi va ilon sinxron.
- Qo‘shilish o‘yin boshlanishidan oldin; o‘yin ketayotganda xonaga kirib bo‘lmaydi.

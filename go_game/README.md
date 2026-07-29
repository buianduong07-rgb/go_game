# Trò Chơi Cổ Phong — Cờ Vây 圍棋, Đầu Hồ 投壺 & Lục Bác 六博

Bộ 3 trò chơi cổ truyền viết bằng **HTML + CSS + JavaScript thuần** — không cần Python,
không cần cài thư viện, không cần venv/pip. Chạy được ngay lập tức bằng cách mở file
trong trình duyệt.

## Có gì trong bộ game

**Giao diện chung:**
- Màn hình chọn game (Cờ Vây / Đầu Hồ / Lục Bác) làm trang chủ
- Background hoạt hình phong cách cổ trang nhiều màu sắc: mây ngũ sắc trôi, núi non
  nhiều tầng (tím — xanh ngọc — xanh lục) ẩn hiện, tre đung đưa, đèn lồng phát sáng
- **Chế độ Sáng / Tối** — bấm biểu tượng 🌙/☀️ ở góc trên bên phải, ghi nhớ lựa chọn
- **Song ngữ Việt / English** — bấm nút VI / EN ở góc trên bên phải, toàn bộ giao diện
  (menu, hướng dẫn, HUD trong game) đổi ngôn ngữ ngay lập tức
- **Âm thanh** tổng hợp trực tiếp bằng Web Audio API (không cần file âm thanh ngoài,
  không lo bản quyền) cho tiếng đặt quân, bắt quân, ném tên, gieo xúc xắc, thắng cuộc...
  có nút bật/tắt 🔊/🔇
- **Đồng hồ đếm giờ mỗi lượt** — chọn 15s / 30s / 60s / không giới hạn khi thiết lập
  ván chơi; hết giờ sẽ tự động xử lý (bỏ lượt / ném luôn / gieo xúc xắc hộ)
- Toàn bộ nút bấm có hiệu ứng "nổi lên" khi rê chuột/chạm, các hàng nút được căn đều
  bằng lưới (grid)

**Cờ Vây:**
- Bàn cờ vẽ bằng Canvas: nền gỗ, quân cờ đen/trắng có đổ bóng 3D, điểm sao (hoshi)
- 3 kích thước bàn: 9×9 (cho người mới), 13×13, 19×19 (chuẩn thi đấu)
- Luật chơi đầy đủ: bắt quân theo khí, cấm nước tự sát, luật Ko, tính điểm lãnh thổ
- Chế độ **2 người** chơi chung 1 máy, và chế độ **1 người** đấu với máy (3 mức)
- Bỏ lượt (Pass), Đi lại (Undo), Đầu hàng (Resign), tự tính điểm và báo thắng thua

**Đầu Hồ (ném tên vào bình cổ Trung Hoa):**
- Cảnh ném tên minh họa: bình gốm, người ném, mũi tên bay có hoạt cảnh trúng/trượt
- Cơ chế "thanh lực" — bấm đúng lúc thanh chỉ báo vào vùng vàng ở giữa để ném trúng
- Chọn số mũi tên mỗi lượt: 5 / 8 / 12
- Chế độ **2 người** và **1 người** đấu máy (3 mức)

**Lục Bác (gieo xúc xắc đua quân — 六博):**
- Mỗi người 6 quân đua quanh vòng chung, gieo xúc xắc rồi chọn quân để đi
- Đi trúng ô đối phương sẽ bắt quân đó về vạch xuất phát
- Về đích đủ cả 6 quân trước sẽ thắng
- Chế độ **2 người** và **1 người** đấu máy (3 mức)
- *Lưu ý trung thực:* luật Lục Bác cổ đã thất truyền theo thời gian; đây là bản diễn
  giải hiện đại đơn giản hoá lấy cảm hứng từ tên gọi, không phải phục dựng lịch sử
  chính xác — điều này được ghi rõ ngay trong phần hướng dẫn chơi của game.

Cả 3 game đều có màn hình **Hướng dẫn chơi** riêng giải thích luật cho người mới.

## Cấu trúc file

```
go_game/
├── index.html   # toan bo giao dien (trang chu + 3 game)
├── style.css    # thiet ke, font, background hoat hinh, sang/toi, hieu ung nut
├── i18n.js      # tu dien Viet/Anh
├── settings.js  # sang/toi + ngon ngu + am thanh (luu bang localStorage)
├── sound.js     # am thanh tong hop bang Web Audio API
├── common.js    # dieu huong man hinh + modal ket qua + dong ho dem gio dung chung
├── go.js        # logic rieng game Co Vay
├── touhu.js     # logic rieng game Dau Ho
└── lucbac.js    # logic rieng game Luc Bac
```

## 1. Chạy thử ngay (không cần cài gì cả)

Cách đơn giản nhất: vào thư mục `go_game`, **double-click vào file `index.html`** —
trình duyệt (Chrome/Edge) sẽ tự mở và game chạy ngay.

**Cách chuẩn hơn (khuyên dùng) — dùng VS Code:**
1. Mở VS Code → File → Open Folder → chọn thư mục `go_game`.
2. Vào tab Extensions → cài extension **"Live Server"** (của Ritwick Dey).
3. Chuột phải vào file `index.html` trong VS Code → chọn **"Open with Live Server"**.
4. Trình duyệt tự mở game tại địa chỉ dạng `http://127.0.0.1:5500`.

Không có bước cài Python, pip, hay venv nào cả — mở lên là chơi được.

## 2. Đưa code lên GitHub

```bash
cd go_game
git init
git add .
git commit -m "Init game co vay"
git branch -M main
git remote add origin https://github.com/<ten-ban>/go-game.git
git push -u origin main
```

## 3. Đóng gói thành app thật cho Android & iOS (dùng Capacitor)

Capacitor là công cụ bọc website thành app native, đơn giản hơn nhiều so với
Buildozer/Kivy — không cần build môi trường Python phức tạp.

```bash
# Cai Node.js truoc (https://nodejs.org, ban LTS), roi trong thu muc go_game:
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init "Vây Kỳ" "com.yourcompany.vaykycogo"
npx cap add android
npx cap add ios
```

Việc này tạo ra 2 thư mục con `android/` và `ios/` — đó là project native thật,
mở trực tiếp bằng Android Studio / Xcode để build và nộp lên store.

### Build Android (.aab để nộp Google Play)
```bash
npx cap open android
```
Android Studio sẽ mở ra → Build → Generate Signed Bundle/APK → chọn **Android App
Bundle** → tạo keystore ký tên → build ra file `.aab`.

### Build iOS (.ipa để nộp App Store) — **bắt buộc có máy Mac + Xcode**
```bash
npx cap open ios
```
Xcode mở ra → đăng nhập Apple ID có Apple Developer Program ($99/năm) → chọn team ký →
Product → Archive → Distribute App → App Store Connect.

*(Đây là yêu cầu của Apple, không có cách nào build/nộp iOS mà không cần máy Mac,
dù dùng công nghệ gì đi nữa.)*

## 4. Nộp lên store

- **Google Play Console**: https://play.google.com/console (phí $25 một lần) → tạo
  app mới → điền mô tả, ảnh chụp màn hình, icon 512×512 → tải file `.aab` lên.
- **App Store Connect**: https://appstoreconnect.apple.com (phí $99/năm) → tạo app
  mới → điền metadata → dùng Xcode Archive để nộp bản build.

## Những thứ nên chuẩn bị thêm trước khi nộp thật sự

- Icon app (1024×1024) và ảnh chụp màn hình đúng kích thước store yêu cầu.
- Âm thanh đặt quân, nhạc nền (có thể thêm bằng thẻ `<audio>` trong HTML).
- Chính sách quyền riêng tư (privacy policy URL) — cả 2 store đều bắt buộc.
- Test kỹ trên nhiều kích thước màn hình điện thoại thật trước khi nộp.

## Gợi ý mở rộng
- Thêm chức năng chơi online qua mạng (cần thêm server, ví dụ Firebase/WebSocket).
- Ghi lại và phát lại ván cờ (đã có sẵn `moveLog` trong `app.js`, chỉ cần thêm UI).
- AI mạnh hơn (thuật toán Monte Carlo Tree Search) — AI hiện tại chỉ ở mức cơ bản,
  phù hợp luyện tập, không phải AI thi đấu chuyên nghiệp.

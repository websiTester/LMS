# Xử lý thời gian (Datetime) trong Python

> Hướng dẫn sử dụng thư viện chuẩn `datetime` để thao tác ngày, giờ, tính toán khoảng thời gian và xử lý múi giờ trong Python.

---

## Datetime cơ bản

### Khái niệm
Module `datetime` trong Python cung cấp các lớp (classes) để thao tác với ngày và giờ, bao gồm:
- `date`: Chỉ quản lý ngày, tháng, năm.
- `time`: Chỉ quản lý giờ, phút, giây, micro giây.
- `datetime`: Kết hợp cả ngày và giờ.
- `timedelta`: Khoảng thời gian (dùng để cộng/trừ thời gian).

### Ví dụ code
```python
from datetime import datetime, date, timedelta, timezone

# 1. Lấy thời gian hiện tại
now = datetime.now()
today = date.today()

# 2. Tạo ngày/giờ cụ thể
custom_date = datetime(2025, 12, 31, 23, 59, 59)

# 3. Tính toán thời gian (timedelta)
next_week = now + timedelta(days=7)
three_hours_ago = now - timedelta(hours=3)

# 4. Lấy thời gian theo chuẩn UTC (Rất quan trọng khi lưu vào DB)
now_utc = datetime.now(timezone.utc)
```

### Common pitfall
- **Không dùng múi giờ (Naive vs Aware datetime):** Khi lưu vào Database như PostgreSQL, nếu lưu `datetime.now()` (thời gian local - naive), DB có thể hiểu nhầm hoặc sai múi giờ khi server deploy ở máy chủ nước ngoài. Luôn luôn ưu tiên dùng `datetime.now(timezone.utc)` (thời gian có gắn múi giờ UTC - aware) khi làm việc với Database và Backend.

### Khi nào dùng
Dùng ở mọi nơi trong Backend (FastAPI) cần thao tác thời gian: tính thời gian hết hạn của JWT token, tạo trường `created_at` / `updated_at` trong Database, hẹn giờ gửi email, v.v.

---

## Format và Parse chuỗi thời gian

### Khái niệm
- **Format (strftime):** Chuyển từ đối tượng `datetime` sang chuỗi (String) để trả qua API (JSON) hoặc in ra log. Hàm dễ nhớ: *string format time*.
- **Parse (strptime):** Chuyển từ chuỗi (từ Client gửi lên qua request) thành đối tượng `datetime` để Python có thể tính toán được. Hàm dễ nhớ: *string parse time*.

### Ví dụ code
```python
from datetime import datetime

# 1. Format (Datetime -> Chuỗi)
now = datetime.now()
formatted = now.strftime("%d/%m/%Y %H:%M:%S")
print(formatted)  # Kết quả: 02/06/2026 11:28:55

# 2. Parse (Chuỗi -> Datetime)
date_string = "31-12-2025"
parsed_date = datetime.strptime(date_string, "%d-%m-%Y")
print(parsed_date) # Kết quả: 2025-12-31 00:00:00
```

---

## 🔗 References
- [Python Official Docs: datetime](https://docs.python.org/3/library/datetime.html)
- Related notes: [[datetime-format]] (Cách frontend React hiển thị giờ)

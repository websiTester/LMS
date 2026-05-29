---
tags: [jwt, claims, rfc7519, payload]
related: [tao-va-giai-ma-token]
module_refs: [M2]
---

# JWT Claims (Các Trường Dữ Liệu Trong Payload)

> Giải thích các trường dữ liệu chuẩn (Registered Claims) và tùy chỉnh (Custom Claims) trong JWT Payload theo đặc tả RFC 7519.

---

## Phân loại Claims

### Khái niệm
JWT payload chứa các cặp key-value gọi là **Claims** (tuyên bố). Có 2 loại claims:

1. **Registered Claims**: Các trường chuẩn được quy định bởi đặc tả JWT (RFC 7519). Thư viện `python-jose` tự động xử lý một số trường này (ví dụ: tự động kiểm tra `exp` khi decode, nếu hết hạn sẽ raise `ExpiredSignatureError`).
2. **Custom Claims**: Các trường tùy chỉnh do lập trình viên tự thêm (ví dụ: `"type": "access"`).

---

## Các Registered Claims Phổ Biến

| Claim | Viết tắt của | Ý nghĩa | Ví dụ |
|---|---|---|---|
| `sub` | Subject | Chủ thể token — xác định token này thuộc về ai | `"sub": 42` (user id) |
| `exp` | Expiration | Thời điểm hết hạn (python-jose tự kiểm tra) | `"exp": 1748200200` |
| `iat` | Issued At | Thời điểm token được tạo | `"iat": 1748198400` |
| `iss` | Issuer | Ai phát hành token | `"iss": "lms-api"` |
| `aud` | Audience | Token dành cho service nào | `"aud": "lms-web"` |
| `jti` | JWT ID | ID duy nhất của token (chống replay attack) | `"jti": "abc-123"` |

---

## Giá Trị Của `sub`

### Khái niệm
Theo chuẩn JWT (RFC 7519), giá trị của `sub` **phải là string**. Thư viện `python-jose` enforce quy tắc này khi decode — nếu `sub` là kiểu khác (ví dụ: integer), sẽ raise `JWTError: Subject must be a string`.

### Ví dụ code
```python
# ❌ SAI — sub là integer → decode sẽ crash
create_access_token({"sub": user.id})        # user.id = 42 (int)
# → JWTError: Subject must be a string

# ✅ ĐÚNG — sub phải là string
create_access_token({"sub": str(user.id)})   # "42" (string)
create_access_token({"sub": "huy@example.com"})
create_access_token({"sub": "550e8400-e29b-41d4-a716-446655440000"})
```

Khi đọc lại `sub` để query database, cần convert ngược về kiểu phù hợp:
```python
# Trong get_current_user dependency
user_id = payload.get("sub")       # → "42" (string)
user = await db.get(User, int(user_id))  # ← convert về int vì primary key là integer
```

### Common pitfall
- **Truyền integer vào `sub`**: `create_access_token({"sub": user.id})` khi `user.id` là `int` → encode thành công (không lỗi) nhưng **decode sẽ crash** với `JWTError: Subject must be a string`. Lỗi khó debug vì encode không báo gì, chỉ fail khi decode ở request sau.
- **Quên convert ngược**: Sau khi sửa sang `str(user.id)`, phải dùng `int(payload.get("sub"))` khi query DB, vì `db.get(User, "42")` với string sẽ không match primary key integer.

### Khi nào dùng
- **Best practice**: Luôn dùng `str(user.id)` khi tạo token. Khi cần thêm thông tin (role, email...), server sẽ query từ database dựa trên `user_id`.
- Không nên nhét quá nhiều dữ liệu vào payload vì JWT được gửi kèm **mỗi request** → payload càng lớn, bandwidth càng tốn.


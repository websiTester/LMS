# Bảo Mật JWT Auth Trong FastAPI — Mục lục

> Hướng dẫn thiết lập hệ thống xác thực (Authentication) và phân quyền (Authorization) bằng JWT (JSON Web Token) trong FastAPI, sử dụng httpOnly cookie, Dependency Injection và kiến trúc domain-driven theo roadmap dự án.

## Nội dung

- [[kien-truc]] — Kiến trúc phân tầng JWT Auth (`core/` vs `auth/`), cấu hình biến môi trường
- [[tao-va-giai-ma-token]] — Hàm tạo/giải mã JWT (`security.py`), hash password, chi tiết `create_access_token`, cấu trúc JWT 3 phần
- [[jwt-claims]] — Các trường dữ liệu trong JWT Payload (Registered Claims: `sub`, `exp`, `iat`...)
- [[xac-thuc-va-phan-quyen]] — Dependency `get_current_user`, bảo vệ endpoints, phân quyền theo role (`require_role`)
- [[luong-thuc-thi]] — Luồng thực thi dependency trong endpoint thực tế, vai trò `response_model`
- [[login-endpoint]] — Bảo mật hàm xác thực login (chống User Enumeration), tham số `response: Response`, set cookie
- [[test-va-cors]] — Test JWT trên Swagger UI (`withCredentials` vs Bearer header), cấu hình CORS khi dùng cookie

## 🔗 References
- [FastAPI Security - OAuth2 with JWT](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [JWT.io](https://jwt.io)
- [RFC 7519 - JWT Registered Claims](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1)
- [python-jose docs](https://python-jose.readthedocs.io/)
- [passlib docs](https://passlib.readthedocs.io/)
- Module liên quan: M2 (Auth email), M3 (Google OAuth), M14 (Admin RBAC)
- Related notes: [[dependency-injection]], [[pydantic-schemas]]

---
tags: [docker, docker-compose, postgresql, networking]
related: [sqlalchemy, bien-moi-truong-python]
module_refs: [M0, M1]
---

# Docker

> Note về Docker + docker-compose: chạy service local, expose port ra host, kết nối từ tool bên ngoài (DBeaver, app FastAPI).

---

## Port mapping trong docker-compose

### Khái niệm

Cú pháp `ports` trong `docker-compose.yml`:

```yaml
ports:
  - "HOST_IP:HOST_PORT:CONTAINER_PORT"
```

- `CONTAINER_PORT` — port mà service **bên trong container** đang lắng nghe (cố định theo image, vd Postgres luôn 5432).
- `HOST_PORT` — port trên **máy host** (Windows/Mac/Linux) được forward vào container. Tự chọn, miễn không trùng port khác.
- `HOST_IP` (optional) — IP của host được phép connect. `127.0.0.1` = chỉ localhost (an toàn, không expose ra LAN). Không ghi = bind tất cả interface (`0.0.0.0`).

### Ví dụ code

```yaml
# docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg17
    container_name: lms_db
    ports:
      - "127.0.0.1:5430:5432"   # host 5430 → container 5432
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: lms_db
```

Sau khi `docker compose up -d`, từ host muốn connect Postgres → dùng port **5430** (host port), KHÔNG phải 5432.

### Common pitfall

- **Lẫn host port với container port** → connect fail. Postgres image mặc định nghe 5432 *trong container*, nhưng ra ngoài host map sang port khác (vd 5430) để tránh conflict với Postgres đã cài sẵn trên máy.
- **`.env` ghi port khác `docker-compose.yml`** → backend không connect được DB. Phải đồng bộ 2 file. Vd nếu compose mapping `5430:5432` thì `DATABASE_URL` trong `.env` phải dùng `:5430`.
- **Bỏ `127.0.0.1:` prefix** → service expose ra LAN, máy khác trong mạng có thể connect → rủi ro bảo mật ở local dev.

### Khi nào dùng

Mọi service stateful chạy trong Docker mà cần tool host truy cập (DBeaver, Redis Insight, MongoDB Compass, debugger…).

---

## Kết nối PostgreSQL trong Docker từ DBeaver

### Khái niệm

DBeaver chạy trên host → connect vào Postgres trong container thông qua **host port** đã mapping.

### Cấu hình DBeaver

| Field | Giá trị | Ghi chú |
|---|---|---|
| Host | `localhost` hoặc `127.0.0.1` | Postgres trong container, nhưng host port forward về localhost |
| Port | `HOST_PORT` trong `docker-compose.yml` | **KHÔNG phải 5432** nếu mapping khác |
| Database | giá trị `POSTGRES_DB` | từ env compose |
| Username | giá trị `POSTGRES_USER` | từ env compose |
| Password | giá trị `POSTGRES_PASSWORD` | từ env compose |

JDBC URL tương đương:
```
jdbc:postgresql://localhost:<HOST_PORT>/<DB_NAME>
```

### Check trước khi connect

```powershell
docker ps --filter "name=lms_db"
```

Cột `PORTS` phải hiện `127.0.0.1:<HOST_PORT>->5432/tcp` và `STATUS` là `Up`. Nếu container đang restart hoặc không thấy → check `docker logs lms_db`.

### Common pitfall

- Quên start container → `Connection refused`. Fix: `docker compose up -d`.
- Mapping port `127.0.0.1:5430:5432` nhưng DBeaver điền 5432 → fail.
- Sai password trong `.env` nhưng container đã chạy với password cũ → Postgres giữ password từ lần init đầu (lưu trong volume). Phải `docker compose down -v` để xoá volume rồi up lại (CẢNH BÁO: mất data).

### Khi nào dùng

Mỗi khi cần inspect schema, chạy query thủ công, debug data trong DB local. DBeaver Community free, đủ dùng cho dev.

---

## App FastAPI connect Postgres trong Docker

### Khái niệm

2 trường hợp khác nhau:

1. **FastAPI chạy trên host** (vd `uvicorn` local) → dùng **host port** (giống DBeaver).
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5430/lms_db
   ```

2. **FastAPI chạy trong cùng docker-compose** với Postgres → dùng **service name** + **container port** (5432), KHÔNG qua host port.
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/lms_db
   ```
   Ở đây `postgres` là `services.postgres` key trong compose file — Docker tự resolve DNS.

### Common pitfall

- Trong container connect bằng `localhost` → fail. `localhost` trong container trỏ về chính container đó, KHÔNG phải host machine.
- Đổi từ dev (chạy host) sang prod (chạy container) mà quên đổi `DATABASE_URL` host portion.

---

## 🔗 References

- [Docker compose ports docs](https://docs.docker.com/compose/compose-file/05-services/#ports)
- [Postgres image](https://hub.docker.com/_/postgres)
- Module liên quan: M0 (setup infra), M1 (auth — cần DB connection)
- Related notes: [[sqlalchemy]], [[bien-moi-truong-python]]

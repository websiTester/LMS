---
tags: [fastapi, pydantic, validation, errors, custom-messages]
related: [pydantic-v2, unified-error-response, responses-va-errors]
module_refs: [M1, M2]
---

# Custom Error Messages trong Pydantic & FastAPI

> Hướng dẫn các phương pháp tùy biến thông điệp lỗi (custom validation error messages) khi xác thực dữ liệu ở Backend FastAPI bằng Pydantic v2, từ cách đơn giản ở cấp độ Schema đến cấu hình dịch lỗi toàn cục.

---

## Tùy biến thông điệp qua Validators (`ValueError` & `PydanticCustomError`)

### Khái niệm
Khi sử dụng các decorator `@field_validator` hoặc `@model_validator`, bạn có thể kiểm tra logic phức tạp và ném ra lỗi tùy chỉnh. 
- **`ValueError`:** Cách truyền thống. Tuy nhiên, Pydantic v2 sẽ tự động thêm tiền tố `"Value error, "` vào trước thông điệp của bạn.
- **`PydanticCustomError`:** Cách chuẩn của Pydantic v2 (nhập từ thư viện `pydantic_core`). Cách này cho phép định nghĩa chính xác mã lỗi (`error type`), thông điệp sạch sẽ không kèm tiền tố, và truyền tham số động.

### Ví dụ code
```python
from pydantic import BaseModel, field_validator, model_validator
from pydantic_core import PydanticCustomError

class RegisterSchema(BaseModel):
    username: str
    password: str
    confirm_password: str

    # 1. Custom lỗi cho từng field bằng PydanticCustomError (Không bị dính chữ "Value error, ")
    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3:
            raise PydanticCustomError(
                "username_too_short",
                "Tên tài khoản phải từ {min_len} ký tự trở lên",
                {"min_len": 3}
            )
        return v

    # 2. Custom lỗi chéo giữa các field bằng ValueError (Sẽ có tiền tố "Value error, ")
    @model_validator(mode="after")
    def validate_passwords(self) -> "RegisterSchema":
        if self.password != self.confirm_password:
            raise ValueError("Mật khẩu và xác nhận mật khẩu không khớp")
        return self
```

### Common pitfall
- **Không import đúng `PydanticCustomError`**: Đối tượng này nằm trong gói `pydantic_core`, không phải `pydantic`. Nếu import nhầm sẽ bị lỗi `ImportError`.
- **Quên trả về giá trị (return value)**: Trong `@field_validator`, bạn phải luôn `return v` ở cuối nếu validation thành công, nếu không giá trị của field đó sẽ bị gán thành `None`. Trong `@model_validator(mode="after")`, bạn phải luôn `return self`.

### Khi nào dùng
Dùng khi bạn cần viết các logic kiểm tra dữ liệu đặc thù (như kiểm tra mật khẩu mạnh, so sánh hai trường, định dạng số điện thoại...) và muốn ném ra thông điệp tiếng Việt cụ thể ngay tại schema đó.

---

## Custom thông điệp mặc định của Pydantic qua `Annotated` và `AfterValidator`

### Khái niệm
Mặc định, khi các ràng buộc của Pydantic như `Field(min_length=6)` bị vi phạm, Pydantic sẽ sinh ra thông điệp tiếng Anh mặc định (ví dụ: `String should have at least 6 characters`). Bạn có thể sử dụng `Annotated` kết hợp với `AfterValidator` để bọc lại trường đó và tùy biến lỗi dịch sang tiếng Việt.

### Ví dụ code
```python
from typing import Annotated
from pydantic import BaseModel, Field
from pydantic.functional_validators import AfterValidator
from pydantic_core import PydanticCustomError

# Hàm validate độ dài mật khẩu và trả ra lỗi custom
def validate_password_length(v: str) -> str:
    if len(v) < 6:
        raise PydanticCustomError(
            "password_too_short",
            "Mật khẩu của bạn quá ngắn, yêu cầu tối thiểu {min_len} ký tự",
            {"min_len": 6}
        )
    return v

# Tạo kiểu dữ liệu tái sử dụng được (Reusable Type)
PasswordType = Annotated[str, AfterValidator(validate_password_length)]

class LoginRequest(BaseModel):
    email: str
    password: PasswordType  # Sử dụng kiểu dữ liệu đã được custom thông điệp lỗi
```

### Common pitfall
- Việc viết hàm validator riêng cho từng loại ràng buộc (`min_length`, `email`, `pattern`) có thể làm code schema bị dài dòng nếu lạm dụng cho toàn bộ các trường đơn giản.

### Khi nào dùng
Dùng để tạo ra các Custom Type tái sử dụng trong toàn bộ hệ thống (ví dụ: `PhoneNumberType`, `VietnameseNameType`, `StrongPasswordType`) với thông báo lỗi tiếng Việt nhất quán.

---

## Dịch thông báo lỗi tự động toàn cục (Global Exception Handler Translation)

### Khái niệm
Để tránh việc phải viết custom message cho từng schema đơn lẻ, cách tối ưu nhất trong thực tế là **dịch tự động các mã lỗi mặc định của Pydantic** (như `missing`, `string_too_short`, `value_error.email`) tại exception handler toàn cục của FastAPI (`RequestValidationError`).

### Ví dụ code
```python
# core/error_handlers.py
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Từ điển ánh xạ mã lỗi mặc định của Pydantic sang thông điệp Tiếng Việt
PYDANTIC_ERROR_TRANSLATIONS = {
    "missing": "Trường này là bắt buộc không được bỏ trống.",
    "string_too_short": "Độ dài ký tự quá ngắn, tối thiểu phải là {limit_value} ký tự.",
    "string_too_long": "Độ dài ký tự quá dài, tối đa chỉ được {limit_value} ký tự.",
    "value_error.email": "Địa chỉ email không đúng định dạng.",
    "int_parsing": "Giá trị nhập vào phải là một số nguyên hợp lệ.",
    "greater_than_equal": "Giá trị phải lớn hơn hoặc bằng {limit_value}.",
    "less_than_equal": "Giá trị phải nhỏ hơn hoặc bằng {limit_value}.",
}

def register_error_handlers(app: FastAPI):
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for err in exc.errors():
            # 1. Trích xuất mã lỗi (ví dụ: 'string_too_short')
            error_type = err["type"]
            ctx = err.get("ctx", {})
            
            # 2. Tìm thông điệp dịch, format tham số động nếu có (ví dụ: limit_value)
            raw_msg = PYDANTIC_ERROR_TRANSLATIONS.get(error_type, err["msg"])
            try:
                formatted_msg = raw_msg.format(**ctx)
            except KeyError:
                formatted_msg = raw_msg
            
            # 3. Lấy ra đường dẫn field bị lỗi (loại bỏ tiền tố 'body')
            loc = [str(x) for x in err["loc"][1:]]
            field = ".".join(loc) if loc else "_root_"
            
            errors.append({
                "field": field,
                "message": formatted_msg,
                "type": error_type
            })
            
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "code": "VALIDATION_ERROR",
                "message": "Dữ liệu đầu vào không hợp lệ",
                "errors": errors
            }
        )
```

### Common pitfall
- **Không format tham số động**: Một số lỗi của Pydantic truyền tham số qua trường `ctx` (như `limit_value` cho biết độ dài yêu cầu). Nếu trong chuỗi dịch của bạn chứa `{limit_value}` nhưng quên chạy `.format(**ctx)`, code sẽ báo lỗi hoặc hiển thị chuỗi thô.
- **Thay đổi định dạng response chuẩn**: Hãy đảm bảo định dạng response lỗi của `RequestValidationError` trả về đồng nhất với cấu trúc lỗi chung của dự án để Frontend dễ dàng phân tích và hiển thị lỗi.

### Khi nào dùng
Đây là **chuẩn doanh nghiệp thực tế** bắt buộc phải cấu hình cho dự án. Nó giúp xử lý 90% lỗi xác thực thông thường (nhập thiếu, sai định dạng, quá ngắn, quá dài) một cách tự động và đồng bộ mà không cần can thiệp viết code thừa cho từng schema đơn lẻ.

---

## Truyền tham số vào validator trong `Annotated`

### Khái niệm
Để truyền thêm tham số cấu hình (ví dụ: số ký tự tối thiểu, giá trị lớn nhất...) vào hàm validation sử dụng trong `AfterValidator` hay `BeforeValidator`, bạn không thể truyền trực tiếp vì các validator này yêu cầu hàm nhận vào đúng 1 đối số duy nhất là giá trị cần validate.

Giải pháp chuẩn là sử dụng **Closure (Hàm bao)** trong Python (hoặc `functools.partial`). Bạn viết một hàm đóng vai trò là "nhà máy" (Factory) nhận các tham số cấu hình và trả về chính xác hàm validator cần thiết.

### Ví dụ code
```python
from typing import Annotated
from pydantic import BaseModel
from pydantic.functional_validators import AfterValidator
from pydantic_core import PydanticCustomError

# 1. Hàm Factory nhận tham số cấu hình và trả về hàm validator con
def min_length(limit: int):
    def validator(v: str) -> str:
        if len(v) < limit:
            raise PydanticCustomError(
                "string_too_short",
                "Độ dài tối thiểu phải là {limit_value} ký tự.",
                {"limit_value": limit} # Truyền ngữ cảnh lỗi
            )
        return v
    return validator

# 2. Định cấu hình kiểu dữ liệu với tham số mong muốn
ShortUsername = Annotated[str, AfterValidator(min_length(3))]
LongPassword = Annotated[str, AfterValidator(min_length(8))]

class AccountSchema(BaseModel):
    username: ShortUsername
    password: LongPassword
```

### Common pitfall
- **Nhầm lẫn thứ tự gọi hàm**: Đảm bảo bạn gọi hàm factory để sinh ra validator, ví dụ: `AfterValidator(min_length(8))` (có dấu ngoặc đơn gọi hàm), thay vì `AfterValidator(min_length)` (gây lỗi cấu hình Pydantic).

### Khi nào dùng
Dùng khi bạn muốn viết một hàm validation tổng quát (ví dụ: kiểm tra độ dài, kiểm tra regex, kiểm tra hạn mức giá trị) nhưng muốn cấu hình các con số/luật khác nhau cho từng trường dữ liệu khác nhau.

---

## Custom message khi dùng các ràng buộc trực tiếp của `Field`

### Khái niệm
Trực tiếp sử dụng `Field(min_length=6, max_length=100)` **không** hỗ trợ tham số truyền trực tiếp custom message kiểu `Field(min_length=6, message="Mật khẩu quá ngắn")` như Zod hay Django Forms. Tuy nhiên, bạn có thể custom message bằng 3 cách sau:

---

### Cách 1: Sử dụng Global Exception Handler (Recommend)
Đây là cách tối ưu nhất. Khi vi phạm ràng buộc `min_length=6`, Pydantic tự động sinh lỗi có kiểu là `string_too_short` kèm theo `ctx = {"limit_value": 6}`. 
Bạn chỉ cần dịch mã lỗi này ở Exception Handler toàn cục của FastAPI:
```python
PYDANTIC_ERROR_TRANSLATIONS = {
    "string_too_short": "Độ dài ký tự quá ngắn, tối thiểu phải là {limit_value} ký tự.",
    "string_too_long": "Độ dài ký tự quá dài, tối đa chỉ được {limit_value} ký tự."
}
```
*Kết quả:* Khi client gửi mật khẩu quá ngắn, API tự động trả về: `"Độ dài ký tự quá ngắn, tối thiểu phải là 6 ký tự."`

---

### Cách 2: Kết hợp `Field` và `@field_validator`
Dùng `Field` để định nghĩa tài liệu OpenAPI hiển thị trên Swagger UI (`/docs`), nhưng dùng `@field_validator` để tùy biến thông điệp lỗi:
```python
from pydantic import BaseModel, Field, field_validator
from pydantic_core import PydanticCustomError

class PasswordSchema(BaseModel):
    # Field định nghĩa metadata hiển thị trên Swagger UI
    password: str = Field(min_length=6, max_length=100)

    @field_validator("password")
    @classmethod
    def custom_password_error(cls, v: str) -> str:
        if len(v) < 6:
            raise PydanticCustomError("password_too_short", "Mật khẩu của bạn quá ngắn, yêu cầu ít nhất 6 ký tự.")
        return v
```

---

### Cách 3: Sử dụng `wrap_validator` của Pydantic (Advanced)
`wrap_validator` cho phép bạn can thiệp trực tiếp vào quá trình validate mặc định của Pydantic, bắt lấy exception mặc định và thay thế bằng lỗi tự chọn:
```python
from typing import Annotated
from pydantic import BaseModel, Field
from pydantic.functional_validators import wrap_validator
from pydantic_core import PydanticCustomError, ValidationError

def custom_error_wrapper(v, handler):
    try:
        return handler(v) # Chạy validate mặc định (min_length=6, max_length=100)
    except ValidationError as exc:
        for error in exc.errors():
            # Nếu vi phạm min_length
            if error["type"] == "string_too_short":
                raise PydanticCustomError("password_too_short", "Mật khẩu của bạn quá ngắn.")
        raise exc

# Định nghĩa type kết hợp wrap validator
CustomPassword = Annotated[str, Field(min_length=6, max_length=100), wrap_validator(custom_error_wrapper)]
```

### Khi nào dùng
- **Cách 1 (Global Translation):** Dùng làm nền tảng cho 90% trường hợp của toàn bộ dự án.
- **Cách 2 & 3:** Dùng khi có một trường cụ thể yêu cầu thông báo lỗi cực kỳ riêng biệt, không muốn dùng chung định dạng với phần còn lại của hệ thống.

---

## 🔗 References
- [Pydantic v2 Validators](https://docs.pydantic.dev/latest/concepts/validators/)
- [FastAPI Request Validation Error Handling](https://fastapi.tiangolo.com/tutorial/handling-errors/#use-the-requestvalidationerror-body)
- Module liên quan: M1 (Setup Project & Exception Handlers), M2 (Xác thực đăng ký/đăng nhập)
- Related notes: [[pydantic-v2]], [[unified-error-response]]


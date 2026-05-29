import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const AlertMessage = () => {

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Lỗi kết nối!</AlertTitle>
      <AlertDescription>
        Không thể tải danh sách người dùng. Vui lòng kiểm tra mạng hoặc thử lại sau.
      </AlertDescription>
    </Alert>
  )
}

 
export default AlertMessage;
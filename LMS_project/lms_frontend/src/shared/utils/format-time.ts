export function formatTime(time: string | Date): string {
    if (!time) return 'N/A';
    return new Date(time).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
}
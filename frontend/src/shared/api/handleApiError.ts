import axios from 'axios'

interface FastApiValidationError {
  msg: string
}

interface FastApiErrorResponse {
  detail?: string | FastApiValidationError[]
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<FastApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item.msg).join('. ')
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error'
}
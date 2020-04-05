interface ApiResponse<T> {
  code: number;
  payload: T;
  message: string;
}
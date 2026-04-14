export class ResponseDto<T> {
  data: T;
  message?: string;
  success: boolean;
}

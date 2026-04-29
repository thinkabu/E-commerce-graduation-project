import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FormattedResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, FormattedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<FormattedResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data ?? null,
        message: 'Thành công',
      })),
    );
  }
}

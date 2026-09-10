import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected network error occurred.';
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
      } else {
        // Backend returned unsuccessful response code
        errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
      console.error('[Syncora API Error]', errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};

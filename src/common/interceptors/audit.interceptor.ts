import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AUDIT_ENTITY_KEY = 'audit_entity';

export const AuditAction = (action: string, entity: string) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_ACTION_KEY, action, descriptor.value);
    Reflect.defineMetadata(AUDIT_ENTITY_KEY, entity, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        // Audit logging is handled directly in services for critical operations
        // to have access to before/after data
      }),
    );
  }
}

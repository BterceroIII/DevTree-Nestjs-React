import { Injectable } from '@nestjs/common';

@Injectable()
export class NormalizeHandle {
  normalizeHandle(handle: string | undefined): string {
    if (!handle) {
      return handle; 
    }
    return handle
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '') 
      .replace(/\-\-+/g, '-'); 
  }
}

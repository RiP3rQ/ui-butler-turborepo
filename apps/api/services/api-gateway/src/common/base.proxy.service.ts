import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export class BaseProxyService {
  constructor(protected client: ClientProxy) {}

  protected async send(pattern: string, data: any) {
    try {
      return await firstValueFrom(this.client.send(pattern, data));
    } catch (err) {
      throw err;
    }
  }

  protected async emit(pattern: string, data: any) {
    try {
      return await firstValueFrom(this.client.emit(pattern, data));
    } catch (err) {
      throw err;
    }
  }
}

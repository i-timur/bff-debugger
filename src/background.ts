import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BackgroundModule } from './background.module';
import { WebSocketService } from './app/services/websocket.service';

platformBrowserDynamic()
  .bootstrapModule(BackgroundModule)
  .then((moduleRef) => {
    const wsService = moduleRef.injector.get(WebSocketService);
    // The service is now initialized and listening for messages
  })
  .catch((err) => console.error('Error bootstrapping background module:', err));

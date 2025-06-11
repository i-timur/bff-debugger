import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

console.log('Starting application bootstrap...');

bootstrapApplication(AppComponent, {
  providers: [provideAnimations(), provideHttpClient()],
})
  .then(() => console.log('Application bootstrapped successfully'))
  .catch((err) => console.error('Error bootstrapping application:', err));

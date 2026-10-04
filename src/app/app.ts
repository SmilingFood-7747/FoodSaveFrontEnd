import { Component } from '@angular/core';
import { Layout } from './shared/presentation/components/layout/layout';
import { Content } from './shared/presentation/components/content/content';

@Component({
  selector: 'app-root',
  imports: [Layout, Content],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

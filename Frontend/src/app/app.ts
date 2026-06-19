import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Service } from './Services/service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Frontend');
  service=inject(Service);
  isLoggedIn:WritableSignal<boolean>=signal(false);
  router=inject(Router);
  constructor(){
    if(localStorage.getItem("email")!=null){
      this.isLoggedIn.set(true);
    }
  }
  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

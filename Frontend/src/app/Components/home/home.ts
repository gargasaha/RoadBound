import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../Services/service';
import { QRCodeComponent } from 'angularx-qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';

@Component({
  selector: 'app-home',
  imports: [QRCodeComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  router=inject(Router); 
  apiService=inject(Service);
  communities:WritableSignal<any[]>=signal([]);
  qrState:WritableSignal<boolean>=signal(false);
  qr:WritableSignal<any>=signal('');
  joinState:WritableSignal<boolean>=signal(false);
  scannedData:WritableSignal<any>=signal('');
  constructor(){
    if(localStorage.getItem("email")==null){
      this.router.navigate(['/login']);
    }
    this.apiService.getCommunityList().subscribe((x:any)=>{
      this.communities.set(x);
      console.log(this.communities());
    })
  }
  setQr(id:any){
    this.qrState.set(true);
    this.qr.set(id);
    console.log(this.qr());
  }
  showJoin(){
    this.joinState.set(true);
  }
  stopJoin(){
    this.joinState.set(false);
  }
  startScanner(){
    const scanner = new Html5QrcodeScanner(
    'reader',
    { fps: 10, qrbox: 250 },
    false
  );

  scanner.render(
    (decodedText) => {
      this.scannedData.set(decodedText);
      scanner.clear(); // stop scanning
    },
    () => {}
  );
  }
}


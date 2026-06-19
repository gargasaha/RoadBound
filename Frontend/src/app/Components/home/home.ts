import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../Services/service';
import { QRCodeComponent } from 'angularx-qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [QRCodeComponent,FormsModule],
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
  id="";
  constructor(){
    if(localStorage.getItem("email")==null){
      this.router.navigate(['/login']);
    }
    this.apiService.getCommunityList().subscribe((x:any)=>{
      this.communities.set(x);
      // console.log(this.communities());
    })
  }
  setQr(id:any){
    this.qrState.set(true);
    this.qr.set(id);
    // console.log(this.qr());
  }
  storeId(){
    this.scannedData.set(this.id);
    // console.log(this.scannedData());
  }
  showJoin(){
    this.joinState.set(true);
  }
  stopJoin(){
    this.joinState.set(false);
  }
  copyToClipboard(qr:any){
    navigator.clipboard.writeText(qr).then(() => {
      console.log('QR code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
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
      this.id=decodedText;
      scanner.clear();
    },
    () => {}
  );
  }
  joinCommunity(){
    console.log(this.scannedData());
  }
  openCommunity(id:any){
    alert(id);
  }
}


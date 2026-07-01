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
  searchKeywordS:WritableSignal<string>=signal('');
  searchKeyword="";
  searchTimeout: any;
  user:WritableSignal<string>=signal('');
  constructor(){
    if(localStorage.getItem("email")==null){
      this.router.navigate(['/login']);
    }
    this.apiService.getCommunityList().subscribe((x:any)=>{
      this.communities.set(x);
    })
  }
  setSearchKeyword() {
    if(this.searchKeyword==''){
      this.apiService.getCommunityList().subscribe((x:any)=>{
        this.communities.set(x);
      })
    }
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchKeywordS.set(this.searchKeyword);
      this.apiService.searchCommunityList(this.searchKeywordS()).subscribe((x:any)=>{
        this.communities.set(x);
      })
    }, 2000);
  }
  setQr(id:any){
    this.qrState.set(true);
    this.qr.set(id);
  }
  storeId(){
    this.scannedData.set(this.id);
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
    this.apiService.joinCommunity({'communityId':this.scannedData(),'riderEmail':localStorage.getItem('email')}).subscribe((x:any)=>{
      if(x.message=='Rider Joined community'){
        this.joinState.set(false);
        this.apiService.getCommunityList().subscribe((x:any)=>{
          this.communities.set(x);
        })
      }
      else if(x.message=='Rider already in community'){
        alert('Rider already in community');
      }
      else if(x.message=='Community does not exists'){
        alert('Community does not exists');
      }
    })
  }
  openCommunity(id:any){
    localStorage.setItem('communityId',id);
    this.router.navigate(['/communityHome']);
  }
}


import { Component, inject, signal, WritableSignal } from '@angular/core';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';
import { Service } from '../../Services/service';
import { NgClass } from '@angular/common';
import {
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-community-home',
  imports: [FormsModule, NgClass],
  templateUrl: './community-home.html',
  styleUrl: './community-home.scss',
})
export class CommunityHome {
  @ViewChild('chatContainer')
  chatContainer!: ElementRef<HTMLDivElement>;
  rootModule = inject(App);
  router=inject(Router);
  isRiding: WritableSignal<boolean> = signal(false);
  message: WritableSignal<string> = signal('')
  apiService = inject(Service);
  messages: WritableSignal<any[]> = signal([]);
  riderId: WritableSignal<any> = signal('');
  i1:any='';
  i2:any='';
  attachmentState:WritableSignal<boolean>=signal(false);
  attachmentType:WritableSignal<string>=signal('');
  attachmentData:WritableSignal<any>=signal('');
  buttonLoadingState:WritableSignal<boolean>=signal(false);
  isLoading:WritableSignal<boolean>=signal(false);
  messageCount:WritableSignal<number>=signal(0);
  isLoadingSymbolForChat:WritableSignal<boolean>=signal(false);
  isRideLive:WritableSignal<boolean>=signal(false);
  private communityId = localStorage.getItem('communityId');
  private riderIdValue = localStorage.getItem('riderId');
  constructor() {
    this.isLoadingSymbolForChat.set(true);
    if(localStorage.getItem("email")==null){
      this.router.navigate(['/login']);
    }
    if (this.communityId != null) {
      this.rootModule.showCommunityInfo();
    }
    this.riderId.set(this.riderIdValue);
    void this.initMessageCount().then(() => {
      setTimeout(() => this.scrollToBottom(), 0);
    });
    this.i1=setInterval(()=>{
      this.getMessage(this.messageCount())
      .then(()=>this.isLoadingSymbolForChat.set(false));
    }, 4000);
    this.apiService.checkRideStatus(localStorage.getItem('communityId')).subscribe((x:any)=>{
      if(x.message==true){
        this.isRideLive.set(true);
      }
      else{
        this.isRideLive.set(false);
      }
    })
  }
  async initMessageCount(): Promise<void>{
    const result:any = await firstValueFrom(this.apiService.initMessageCount(this.communityId));
    this.messages.set(result.messages);
    this.messageCount.set(result.count);
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }
  ngOnDestroy(){
    clearInterval(this.i1);
    clearInterval(this.i2);
  }
  startRide():void{
    this.router.navigate(['/ride']);
  }
  addAttachment(file:any){
    // this.buttonLoadingState.set(true);
    const data=file.target.files[0];
    if (!data || data.size > 10 * 1024 * 1024) {
      alert('File size is more than 10mb');
      return;
    }
    if(data.type=='image/png' || data.type=='image/jpg' || data.type=='image/jpeg'){
      this.attachmentState.set(true);
      this.attachmentType.set('image');
      this.compressImage(data).then((compressed) => {
        this.attachmentData.set(compressed);
      });
    } 
    else if(data.type=='video/mp4' || data.type=='video/avi' || data.type=='video/mov' || data.type=='video/mkv'){
      this.attachmentState.set(true);
      this.attachmentType.set('video');
      this.compressVideo(data).then((compressed) => {
        this.attachmentData.set(compressed);
      });
    }

  }
  removeAttachment(){
    this.attachmentState.set(false);
    this.attachmentType.set('');
    this.attachmentData.set('');
  }

  async getMessage(count:any): Promise<void> {
    const result: any = await firstValueFrom(this.apiService.getMessage(count));
    if(result.type==1){
      this.messages.set(Array.isArray(result.messages) ? result.messages : []);
      this.messageCount.set(result.count);
      this.i2=setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
  }
  async sendImage(){
    this.buttonLoadingState.set(true);
    await firstValueFrom(this.apiService.saveMessage({ communityId: this.communityId, riderId: this.riderIdValue, messageType: 2, message: this.attachmentData() }));
    this.message.set('');
    void this.getMessage(this.messageCount());
    this.buttonLoadingState.set(false);
    this.attachmentState.set(false);
  }
  async sendVideo(){
    this.buttonLoadingState.set(true);
    await firstValueFrom(this.apiService.saveMessage({ communityId: this.communityId, riderId: this.riderIdValue, messageType: 3, message: this.attachmentData() }));
    this.message.set('');
    void this.getMessage(this.messageCount());
    this.buttonLoadingState.set(false);
    this.attachmentState.set(false);
  }
  async sendMessage() {
    this.isLoading.set(true);
    await firstValueFrom(this.apiService.saveMessage({ communityId: this.communityId, riderId: this.riderIdValue, messageType: 1, message: this.message() }));
    this.isLoading.set(false);
    this.message.set('');
    void this.getMessage(this.messageCount());
  }
  scrollToBottom() {
    if (!this.chatContainer) return;

    const el = this.chatContainer.nativeElement;

    el.scroll({
      top: el.scrollHeight,
      behavior: 'smooth'
    });
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1280;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private compressVideo(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}

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
  constructor() {
    if(localStorage.getItem("email")==null){
      this.router.navigate(['/login']);
    }
    this.getMessage();
    if (localStorage.getItem('communityId') != null) {
      this.rootModule.showCommunityInfo();
    }
    this.riderId.set(localStorage.getItem('riderId'));
    this.i1=setInterval(()=>{
      this.getMessage();
    }, 2000);
  }
  ngOnDestroy(){
    clearInterval(this.i1);
    clearInterval(this.i2);
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

  getMessage() {
    this.apiService.getMessage().subscribe((x: any) => {
      this.messages.set(x);
      this.i2=setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    })
  }
  sendImage(){
    this.buttonLoadingState.set(true);
    this.apiService.saveMessage({ communityId: localStorage.getItem('communityId'), riderId: localStorage.getItem('riderId'), messageType: 2, message: this.attachmentData() })
      .subscribe((x: any) => {
        this.message.set('');
        this.getMessage();
        this.buttonLoadingState.set(false);
        this.attachmentState.set(false);
      })
  }
  sendVideo(){
    this.buttonLoadingState.set(true);
    this.apiService.saveMessage({ communityId: localStorage.getItem('communityId'), riderId: localStorage.getItem('riderId'), messageType: 3, message: this.attachmentData() })
      .subscribe((x: any) => {
        this.message.set('');
        this.getMessage();
        this.buttonLoadingState.set(false);
        this.attachmentState.set(false);
      })
  }
  sendMessage() {
    this.apiService.saveMessage({ communityId: localStorage.getItem('communityId'), riderId: localStorage.getItem('riderId'), messageType: 1, message: this.message() })
      .subscribe((x: any) => {
        this.message.set('');
        this.getMessage();
      })
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

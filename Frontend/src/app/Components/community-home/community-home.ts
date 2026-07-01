import { Component, inject, signal, WritableSignal } from '@angular/core';
import { App } from '../../app';
import { FormsModule } from '@angular/forms';
import { Service } from '../../Services/service';
import { NgClass } from '@angular/common';
import {
  ViewChild,
  ElementRef
} from '@angular/core';
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
  constructor() {
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
    const data=file.target.files[0];
    if(data.type=='image/png' || data.type=='image/jpg' || data.type=='image/jpeg'){
      this.attachmentState.set(true);
      this.attachmentType.set('image');
      const reader = new FileReader();
      reader.onload = () => {
        this.attachmentData.set(reader.result as string);
        console.log(this.attachmentData())
      };
      reader.readAsDataURL(data);
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
}

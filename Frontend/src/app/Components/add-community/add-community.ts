import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../Services/service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-community',
  imports: [ReactiveFormsModule],
  templateUrl: './add-community.html',
  styleUrl: './add-community.scss',
})
export class AddCommunity {
  frm1=new FormGroup({
    communityName:new FormControl("",[Validators.required]),
    communityImage:new FormControl("",[Validators.required]),
    communityBio:new FormControl("",[Validators.required])
  })
  imagePreview:WritableSignal<string>=signal('');
  btnState:WritableSignal<boolean>=signal(false);
  message:WritableSignal<string>=signal('')
  apiService=inject(Service);
  routes=inject(Router);
  frmSubmit(){
    this.btnState.set(true);
    if(!this.frm1.valid){
      alert("All field is needed");
    }
    this.apiService.saveCommunity(this.frm1.getRawValue()).subscribe((x)=>{
      console.log(x);
      if(x.message=="Community saved"){
        this.btnState.set(false);
        this.routes.navigate((['/']));
      }
      this.btnState.set(false);
    })
  }
  onImageSelected(event:any){
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      alert('Only JPG, JPEG, and PNG formats are allowed');
      event.target.value = '';
      return;
    }

    const maxSize = 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('File size must not exceed 1MB');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string | null;
      if (result) {
        this.imagePreview.set(result);
        this.frm1.get('communityImage')?.patchValue(result);
      }
    };

    reader.readAsDataURL(file);

    event.target.value = '';
  }
}

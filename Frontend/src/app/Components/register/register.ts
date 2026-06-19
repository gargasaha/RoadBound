import { Component, WritableSignal, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { Service } from '../../Services/service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule,NgClass],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  imageBase64: WritableSignal<string> = signal('');
  isAgeFalse:WritableSignal<boolean>=signal(false);
  isGenderFalse:WritableSignal<boolean>=signal(false);
  isNationFalse:WritableSignal<boolean>=signal(false);
  httpService=inject(Service);
  router=inject(Router);
  Submitting:WritableSignal<boolean>=signal(false);
  frm1 = new FormGroup({
    riderName: new FormControl("",[Validators.required]),
    riderPassword: new FormControl("",[Validators.required]),
    riderEmail: new FormControl("",[Validators.required]),
    riderPhone: new FormControl("",[Validators.required]),
    riderAge: new FormControl("Your age",[Validators.required]),
    riderGender: new FormControl("Select gender",[Validators.required]),
    riderNationality: new FormControl("Nationality",[Validators.required]),
    profileImage: new FormControl("",[Validators.required])
  })
  frm1Submit():void{
    // console.log(this.frm1.getRawValue());
    this.Submitting.set(true);
    let state=true;
    if(this.frm1.value.riderAge=="Your age" || this.frm1.value.riderGender=="Select gender" || this.frm1.value.riderNationality=="Nationality"){
      if(this.frm1.value.riderAge=="Your age"){
        this.isAgeFalse.set(true);
      }
      else{
        this.isAgeFalse.set(false);
      }
      
      if(this.frm1.value.riderGender=="Select gender"){
        this.isGenderFalse.set(true);
      }
      else{
        this.isGenderFalse.set(false);
      }

      if(this.frm1.value.riderNationality=="Nationality"){
        this.isNationFalse.set(true);
      }
      else{
        this.isNationFalse.set(false);
      }
      state=false;
      this.Submitting.set(false);
      
    }
    if(this.frm1.value.riderName=="" || this.frm1.value.riderPassword=="" || this.frm1.value.riderEmail=="" || this.frm1.value.riderPhone==""){
        alert("All fields are mandatory");
        state=false;
        this.Submitting.set(false);
    }
    if(this.imageBase64()==''){
      alert("Select profile image");
      state=false;
      this.Submitting.set(false);
    }
    if(!state){
      this.Submitting.set(false);
      return;
    }
    this.httpService.saveRider(this.frm1.getRawValue()).subscribe((x:any)=>{
      this.Submitting.set(false);
      if(x.message=="Email already exists"){
        alert(x.message);
      }
      else{
        localStorage.clear();
        localStorage.setItem("email",this.frm1.value.riderEmail as string);
        this.httpService.email.set(this.frm1.value.riderEmail as string);
        this.frm1.reset();
        this.router.navigate(['/'])
      }
    })
  }

  selectImage(event: any) {
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

    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      alert('File size must not exceed 1MB');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imageBase64.set(e.target.result);
      this.frm1.get("profileImage")?.patchValue(this.imageBase64())
    };

    reader.readAsDataURL(file);

    event.target.value = '';
  }
}

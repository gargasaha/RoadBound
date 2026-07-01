import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../Services/service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  apiService=inject(Service);
  router=inject(Router);
  btnState:WritableSignal<boolean>=signal(false);
  message:WritableSignal<string>=signal('');
  frm1=new FormGroup({
    riderEmail:new FormControl("",[Validators.required]),
    riderPassword:new FormControl("",[Validators.required])
  });
  ngOnInit(){
    
  }
  frmSubmit(){
    if(!this.frm1.valid){
      alert("All fields are required");
      return;
    }
    else{
      this.btnState.set(true);
      this.apiService.checkRider(this.frm1.getRawValue()).subscribe((x)=>{
        if(x.message=="Logged in successfully"){
          localStorage.setItem("email",this.frm1.value.riderEmail as string);
          localStorage.setItem("riderId",x.riderId);
          this.apiService.email.set(this.frm1.value.riderEmail as string);
          this.frm1.reset();
          this.btnState.set(false);
          this.router.navigate(['/']);
        } 
        else{
          this.message.set(x.message);
          this.btnState.set(false);
        }
      })
    }
  }
}

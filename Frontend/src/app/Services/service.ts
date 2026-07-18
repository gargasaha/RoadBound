import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable,catchError,throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Service {
  private backendDefaultUrl="https://5qdzkd13-3000.inc1.devtunnels.ms/api";
  http=inject(HttpClient);
  email:WritableSignal<string>=signal('');
  saveRider(data:any):Observable<any>{
    return this.http.post(this.backendDefaultUrl+"/saveRider",data)
    .pipe(
      catchError((error)=>{
        return throwError(()=>
          error
        )
      })
    )
  }
  checkRideStatus(data:any):Observable<any>{
    return this.http.get(this.backendDefaultUrl+"/checkRideStatus/"+data)
    .pipe(
      catchError((error)=>{
        return throwError(()=>error)
      })
    );
  }
  checkRider(data:any):Observable<any>{
    return this.http.post(this.backendDefaultUrl+"/checkRider",data)
    .pipe(
      catchError((error)=>{
        return throwError(()=>error)
      })
    )
  }
  saveCommunity(data:any):Observable<any>{
    return this.http.post(this.backendDefaultUrl+"/saveCommunity",{data:data,email:localStorage.getItem("email")})
    .pipe(
      catchError((error)=>{
        return throwError(()=>error)
      })
    )
  }
  searchCommunityList(keyword:string):Observable<any>{
    return this.http.get(this.backendDefaultUrl+"/searchCommunityList/"+localStorage.getItem('email')+'/'+keyword)
    .pipe(
      catchError((error)=>{
        return throwError(()=>error);
      })
    )
  }
  getCommunityList():Observable<any>{
    return this.http.get(this.backendDefaultUrl+"/getCommunityList/"+localStorage.getItem("email"))
    .pipe(
      catchError((error)=>{
        return throwError(()=>error)
      })
    )
  }
  joinCommunity(data:any):Observable<any>{
    return this.http.post(this.backendDefaultUrl+"/joinCommunity",data)
    .pipe(
      catchError((error)=>{
        return throwError(()=>error)
      })
    );
  }
  getCommunity(communityId:any):Observable<any>{
    return this.http.get(this.backendDefaultUrl+"/getCommunity/"+communityId)
    .pipe(
      catchError((error)=>{
        return throwError(()=>{error})
      })
    );
  }
  initMessageCount(communityId:any):Observable<any>{
    return this.http.get(this.backendDefaultUrl+"/initMessageCount/"+communityId)
    .pipe(
      catchError((error)=>{
        return throwError(()=>{error})
      })
    );
  }
  saveMessage(data:any):Observable<any>{
    return this.http.post(this.backendDefaultUrl+"/saveMessage",data)
    .pipe(
      catchError((error)=>{
        return throwError(()=>error)
      })
    );
  }
  getMessage(count:any):Observable<any>{
    return this.http.get(this.backendDefaultUrl+"/getMessage/"+localStorage.getItem('communityId')+"/"+count)
    .pipe(
      catchError((error)=>{
        return throwError(()=>error);
      })
    );
  }
}

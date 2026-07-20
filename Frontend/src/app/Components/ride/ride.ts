import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Service } from '../../Services/service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as L from 'leaflet';
import { interval } from 'rxjs';

@Component({
  selector: 'app-ride',
  imports: [ReactiveFormsModule,FormsModule],
  templateUrl: './ride.html',
  styleUrls: ['./ride.scss'],
})
export class Ride {
  map!: L.Map;
  marker!: L.Marker;
  apiService = inject(Service);
  router = inject(Router);
  sanitizer = inject(DomSanitizer);
  isNewRide: WritableSignal<boolean> = signal(true);
  isMapOpen: WritableSignal<boolean> = signal(false);
  currUrl: WritableSignal<SafeResourceUrl> = signal(this.sanitizer.bypassSecurityTrustResourceUrl('about:blank'));
  nm:WritableSignal<string>=signal("");
  frm1 = new FormGroup({
    rideStartTime: new FormControl<Date>(new Date(), Validators.required),
    rideEndTime: new FormControl<string>("", Validators.required),
    rideStartLat: new FormControl<string>("", Validators.required),
    rideStartLon: new FormControl<string>("", Validators.required),
    rideEndLat: new FormControl<string>("", Validators.required),
    rideEndLon: new FormControl<string>("", Validators.required),
    tripName: new FormControl<string>("", Validators.required)
  })
  
  ngOnInit(){
    this.apiService.isNewRide(localStorage.getItem("communityId")).subscribe((x: any) => {
      if (x.message === "Already in ride") {
        this.isNewRide.set(false);
        console.log(false);
      }
    })
  }

  private applyBounceToMarker(marker: L.Marker): void {
    const styleId = 'ride-marker-bounce-style';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        @keyframes rideMarkerBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
        .ride-marker-bounce {
          animation: rideMarkerBounce 0.6s ease-in-out infinite alternate;
          transform-origin: bottom center;
        }
      `;
      document.head.appendChild(styleEl);
    }

    requestAnimationFrame(() => {
      const markerEl = marker.getElement();
      if (markerEl) {
        markerEl.classList.add('ride-marker-bounce');
      }
    });
  }

  submitRide(): void {
  }
  selectedStartLocation:WritableSignal<string>=signal('');
  selectMyCurrentLocation(){
    navigator.geolocation.getCurrentPosition((position)=>{
      const lat=position.coords.latitude;
      const lng=position.coords.longitude;
      this.frm1.patchValue({
          rideStartLat:lat.toString(),
          rideStartLon:lng.toString()
      });
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(response => response.json())
          .then(data => {
            const areaName = data.address?.village || data.address?.town || data.address?.city || 'Unknown Area';
            const city = data.address?.city || data.address?.town || '';
            const postcode = data.address?.postcode || '';
            const state = data.address?.state || '';
            const location = `${areaName}, ${city}, ${postcode}, ${state}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
            this.selectedStartLocation.set(location);
            this.isMapOpen.set(false);
            console.log(data);
            this.marker.bindPopup(location).openPopup();
          })
          .catch(error => console.error('Geocoding error:', error));
    }
    );
  }
  selectStartLocation() { 
    this.isMapOpen.set(true);
    setTimeout(() => {
    const customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    if(this.map){
      this.map.remove();
    }

    navigator.geolocation.getCurrentPosition((position)=>{

      const lat=position.coords.latitude;
      const lng=position.coords.longitude;
      this.frm1.patchValue({
          rideStartLat:lat.toString(),
          rideStartLon:lng.toString()
      });

      this.map = L.map('map').setView([lat,lng],15);

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:'© OpenStreetMap'
        }
      ).addTo(this.map);

      L.marker([lat,lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup("You")
      .openPopup()

      this.map.on('click',(e)=>{

        const clickLat=e.latlng.lat;
        const clickLng=e.latlng.lng;
        this.frm1.patchValue({
          rideStartLat:clickLat.toString(),
          rideStartLon:clickLng.toString()
        });
        if(this.marker){
          this.map.removeLayer(this.marker);
        }

        this.marker=L.marker([clickLat,clickLng], { icon: customIcon }).addTo(this.map);


        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`)
          .then(response => response.json())
          .then(data => {
            const areaName = data.address?.village || data.address?.town || data.address?.city || 'Unknown Area';
            const city = data.address?.city || data.address?.town || '';
            const postcode = data.address?.postcode || '';
            const state = data.address?.state || '';
            const location = `${areaName}, ${city}, ${postcode}, ${state}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
            this.selectedStartLocation.set(location);
            this.isMapOpen.set(false);
            console.log(data);
            this.marker.bindPopup(location).openPopup();
          })
          .catch(error => console.error('Geocoding error:', error));

      });

    });

    this.map.on('click',(e)=>{

      const lat=e.latlng.lat;
      const lng=e.latlng.lng;

      if(this.marker){
        this.map.removeLayer(this.marker);
      }

      this.marker=L.marker([lat,lng], { icon: customIcon }).addTo(this.map);


      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
          const areaName = data.address?.village || data.address?.town || data.address?.city || 'Unknown Area';
          const city = data.address?.city || data.address?.town || '';
          const postcode = data.address?.postcode || '';
          const state = data.address?.state || '';
          const location = `${areaName}, ${city}, ${postcode}, ${state}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
          console.log(data);
          this.marker.bindPopup(location).openPopup();
        })
        .catch(error => console.error('Geocoding error:', error));

    });

  });

  }
}

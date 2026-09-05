import { Component, ElementRef, inject, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';
import { Service } from '../../Services/service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as L from 'leaflet';
import { interval } from 'rxjs';

@Component({
  selector: 'app-ride',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './ride.html',
  styleUrls: ['./ride.scss'],
})
export class Ride {
  @ViewChild("mp") mp!: ElementRef;
  map!: L.Map;
  marker!: L.Marker;
  apiService = inject(Service);
  router = inject(Router);
  sanitizer = inject(DomSanitizer);
  isNewRide: WritableSignal<boolean> = signal(true);
  isMapOpen: WritableSignal<boolean> = signal(false);
  currUrl: WritableSignal<SafeResourceUrl> = signal(this.sanitizer.bypassSecurityTrustResourceUrl('about:blank'));
  nm: WritableSignal<string> = signal("");
  isSubmitting: WritableSignal<boolean> = signal(false);
  isDirection: WritableSignal<boolean> = signal(false);
  frm1 = new FormGroup({
    rideCommunityId: new FormControl<string>(localStorage.getItem('communityId') ?? "", Validators.required),
    rideStartTime: new FormControl<string>("", Validators.required),
    rideEndTime: new FormControl<string>("", Validators.required),
    rideStartLat: new FormControl<string>("", Validators.required),
    rideStartLon: new FormControl<string>("", Validators.required),
    rideEndLat: new FormControl<string>("", Validators.required),
    rideEndLon: new FormControl<string>("", Validators.required),
    tripName: new FormControl<string>("", Validators.required)
  })
  constructor() {
    this.apiService.isNewRide(localStorage.getItem("communityId")).subscribe((x: any) => {
      if (x.message === "Already in ride") {
        this.isNewRide.set(false);
        console.log(false);
      }
    })
  }
  ngOnInit() {

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
    if (this.frm1.value.rideStartLat == '' || this.frm1.value.rideEndLat == '' || this.frm1.value.rideStartLon == '' || this.frm1.value.rideEndLon == '' || this.frm1.value.tripName == '') {
      console.log(this.frm1.getRawValue());
      alert('All fields are required');
      return;
    }
    this.isSubmitting.set(true);
    this.apiService.startRide(this.frm1.getRawValue()).subscribe((x: any) => {
      this.isSubmitting.set(false);
      this.apiService.isRidingToHideNavBar.set(true);
      this.isNewRide.set(false);
      console.log(x);
    })
  }
  selectedStartLocation: WritableSignal<string> = signal('');
  selectedEndLocation: WritableSignal<string> = signal('');
  selectMyCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      this.frm1.patchValue({
        rideStartLat: lat.toString(),
        rideStartLon: lng.toString()
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
      if (this.map) {
        this.map.remove();
      }

      navigator.geolocation.getCurrentPosition((position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.frm1.patchValue({
          rideStartLat: lat.toString(),
          rideStartLon: lng.toString()
        });

        this.map = L.map('map').setView([lat, lng], 15);

        L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '© OpenStreetMap'
          }
        ).addTo(this.map);

        L.marker([lat, lng], { icon: customIcon })
          .addTo(this.map)
          .bindPopup("You")
          .openPopup()

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(response => response.json())
          .then(data => {
            const areaName = data.address?.village || data.address?.town || data.address?.city || 'Unknown Area';
            const city = data.address?.city || data.address?.town || '';
            const postcode = data.address?.postcode || '';
            const state = data.address?.state || '';
            const location = `${areaName}, ${city}, ${postcode}, ${state}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
            this.selectedStartLocation.set(location);
          })
          .catch(error => console.error('Geocoding error:', error));

        this.map.on('click', (e) => {

          const clickLat = e.latlng.lat;
          const clickLng = e.latlng.lng;
          this.frm1.patchValue({
            rideStartLat: clickLat.toString(),
            rideStartLon: clickLng.toString()
          });
          if (this.marker) {
            this.map.removeLayer(this.marker);
          }

          this.marker = L.marker([clickLat, clickLng], { icon: customIcon }).addTo(this.map);


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

            })
            .catch(error => console.error('Geocoding error:', error));

        });
      });

    });

  }
  private showRoute(): void {

    const startLat = Number(this.frm1.value.rideStartLat);
    const startLng = Number(this.frm1.value.rideStartLon);

    const endLat = Number(this.frm1.value.rideEndLat);
    const endLng = Number(this.frm1.value.rideEndLon);

    if (
      !startLat || !startLng ||
      !endLat || !endLng
    ) {
      console.error('Invalid coordinates');
      return;
    }

    // Create map
    this.map = L.map(this.mp.nativeElement).setView(
      [startLat, startLng],
      13
    );

    // OpenStreetMap
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);

    // Start marker
    L.marker([startLat, startLng])
      .addTo(this.map)
      .bindPopup('Start Location');

    // End marker
    L.marker([endLat, endLng])
      .addTo(this.map)
      .bindPopup('End Location');

    // OSRM route
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startLng},${startLat};${endLng},${endLat}` +
      `?overview=full&geometries=geojson`;

    fetch(url)
      .then(response => response.json())
      .then(data => {

        if (!data.routes || data.routes.length === 0) {
          console.error('No route found');
          return;
        }

        const route = data.routes[0];

        // Convert OSRM coordinates [lng, lat]
        // to Leaflet [lat, lng]
        const coordinates = route.geometry.coordinates.map(
          (coordinate: [number, number]) => [
            coordinate[1],
            coordinate[0]
          ] as [number, number]
        );

        // Draw actual road route
        const routeLine = L.polyline(
          coordinates,
          {
            weight: 6
          }
        ).addTo(this.map);

        // Zoom to route
        this.map.fitBounds(routeLine.getBounds());

        // Distance
        const distanceKm = route.distance / 1000;

        // Duration
        const durationMinutes = route.duration / 60;

        console.log('Distance:', distanceKm.toFixed(2), 'km');
        console.log('Duration:', durationMinutes.toFixed(0), 'minutes');
      })
      .catch(error => {
        console.error('Route error:', error);
      });
  }
  selectEndLocation() {
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
      if (this.map) {
        this.map.remove();
      }

      navigator.geolocation.getCurrentPosition((position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.frm1.patchValue({
          rideEndLat: lat.toString(),
          rideEndLon: lng.toString()
        });

        this.map = L.map('map').setView([lat, lng], 15);

        L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '© OpenStreetMap'
          }
        ).addTo(this.map);

        L.marker([lat, lng], { icon: customIcon })
          .addTo(this.map)
          .bindPopup("You")
          .openPopup()

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(response => response.json())
          .then(data => {
            const areaName = data.address?.village || data.address?.town || data.address?.city || 'Unknown Area';
            const city = data.address?.city || data.address?.town || '';
            const postcode = data.address?.postcode || '';
            const state = data.address?.state || '';
            const location = `${areaName}, ${city}, ${postcode}, ${state}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
            this.selectedEndLocation.set(location);
          })
          .catch(error => console.error('Geocoding error:', error));

        this.map.on('click', (e) => {

          const clickLat = e.latlng.lat;
          const clickLng = e.latlng.lng;
          this.frm1.patchValue({
            rideEndLat: clickLat.toString(),
            rideEndLon: clickLng.toString()
          });
          if (this.marker) {
            this.map.removeLayer(this.marker);
          }

          this.marker = L.marker([clickLat, clickLng], { icon: customIcon }).addTo(this.map);


          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`)
            .then(response => response.json())
            .then(data => {
              const areaName = data.address?.village || data.address?.town || data.address?.city || 'Unknown Area';
              const city = data.address?.city || data.address?.town || '';
              const postcode = data.address?.postcode || '';
              const state = data.address?.state || '';
              const location = `${areaName}, ${city}, ${postcode}, ${state}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
              this.selectedEndLocation.set(location);
              this.isMapOpen.set(false);
              console.log(data);
              this.marker.bindPopup(location).openPopup();
              this.isDirection.set(true);
              setTimeout(() => {
                this.showRoute();
              });
            })
            .catch(error => console.error('Geocoding error:', error));

        });
      });

    });

  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private animationTimeline: gsap.core.Timeline | null = null;

  ngOnInit() {
    this.initBackgroundAnimation();
  }

  ngOnDestroy() {
    if (this.animationTimeline) {
      this.animationTimeline.kill();
    }
  }

  private initBackgroundAnimation() {
    // Colores aleatorios para las estrellas y líneas
    const starColors = [
      '#00ffc3', // Verde neón
      '#ff6b6b', // Rojo
      '#4ecdc4', // Turquesa
      '#45b7d1', // Azul
      '#feca57', // Amarillo
      '#ff9ff3', // Rosa
      '#54a0ff', // Azul claro
      '#5f27cd', // Púrpura
      '#00d2d3', // Cian
      '#ff9f43', // Naranja
      '#10ac84', // Verde esmeralda
      '#ee5253'  // Rojo coral
    ];

    // Crear timeline de GSAP
    this.animationTimeline = gsap.timeline({ repeat: -1 });

    // Animar el cambio de colores aleatoriamente
    starColors.forEach((color, index) => {
      this.animationTimeline!.add(() => {
        this.updateConstellationColors(color);
      }, index * 2); // 2 segundos entre cada cambio
    });
  }

  private updateConstellationColors(targetColor: string) {
    // Calcular el hue-rotate basado en el color objetivo
    const hueValue = this.getHueFromColor(targetColor);
    
    // Aplicar el filtro al elemento hero
    const heroElement = document.querySelector('.hero');
    if (heroElement && heroElement instanceof HTMLElement) {
      gsap.to(heroElement, {
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: function() {
          heroElement.style.setProperty('--hue-rotate', `${hueValue}deg`);
        }
      });
    }
  }

  private getHueFromColor(hexColor: string): number {
    // Convertir hex a RGB
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    if (!result) return 0;
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max === min) {
      h = 0; // achromatic
    } else {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return h * 360;
  }
}

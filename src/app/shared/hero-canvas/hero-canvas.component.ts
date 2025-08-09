import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

interface CanvasButton {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  type: 'primary' | 'secondary';
  action: string;
  opacity?: number;
}

interface HeartbeatParticle {
  x: number;
  y: number;
  baseSize: number;
  opacity: number;
  phase: number;
  speed: number;
}

interface MouseMeteor {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  trail: Array<{x: number, y: number, opacity: number}>;
  maxTrailLength: number;
}





@Component({
  selector: 'app-hero-canvas',
  standalone: true,
  template: `
    <canvas 
      #heroCanvas
      class="hero-canvas"
      (click)="onCanvasClick($event)"
      (mousemove)="onCanvasMouseMove($event)">
    </canvas>
  `,
  styles: [`
    .hero-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      cursor: default;
    }
  `]
})
export class HeroCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() buttonClick = new EventEmitter<string>();
  @Output() emailCopy = new EventEmitter<void>();

  private themeService = inject(ThemeService);

  constructor(private cdr: ChangeDetectorRef) {}
  
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private animationTime = 0;
  private buttons: CanvasButton[] = [];
  private hoveredButton: CanvasButton | null = null;
  private tudaiLink: { x: number; y: number; width: number; height: number } | null = null;
  private heartbeatParticles: HeartbeatParticle[] = [];
  private mouseMeteor: MouseMeteor = { x: 0, y: 0, targetX: 0, targetY: 0, trail: [], maxTrailLength: 25 };
  private textAnimationStartTime = 0;
  private textAnimationDuration = 2000; // 2 segundos
  
  // Propiedades para la animación de transición de tema
  private isTransitioning = false;
  private transitionStartTime = 0;
  private transitionDuration = 1500; // 1.5 segundos
  private previousThemeColors: any = null;
  private currentThemeColors: any = null;
  private transitionParticles: Array<{x: number, y: number, vx: number, vy: number, life: number, maxLife: number}> = [];
  
  canvasWidth = 1200;
  canvasHeight = 800;

  // Obtener colores según el tema actual
  private getThemeColors() {
    const isDark = this.themeService.getCurrentTheme() === 'dark';
    
    if (isDark) {
      return {
        background: '#0F0F0F',
        darkColor: { r: 15, g: 15, b: 15 },      // Negro
        aquaColor: { r: 0, g: 255, b: 195 }     // Verde aqua
      };
    } else {
      return {
        background: 'rgb(70, 70, 70)',
        darkColor: { r: 255, g: 255, b: 255 },  // Blanco
        aquaColor: { r: 0, g: 255, b: 195 }     // Verde aqua (mismo)
      };
    }
  }

  // Iniciar transición de tema con efectos especiales
  private startThemeTransition() {
    this.previousThemeColors = this.currentThemeColors || this.getThemeColors();
    this.currentThemeColors = this.getThemeColors();
    
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
    
    // Crear explosión de partículas
    this.createTransitionParticles();
    
    console.log('Theme transition started!');
  }

  // Crear partículas para la transición
  private createTransitionParticles() {
    this.transitionParticles = [];
    const particleCount = 50;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 4;
      
      this.transitionParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0
      });
    }
  }

  // Interpolar entre dos colores
  private lerpColor(color1: {r: number, g: number, b: number}, color2: {r: number, g: number, b: number}, t: number) {
    return {
      r: Math.floor(color1.r + (color2.r - color1.r) * t),
      g: Math.floor(color1.g + (color2.g - color1.g) * t),
      b: Math.floor(color1.b + (color2.b - color1.b) * t)
    };
  }

  // Función de easing cúbica
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Dibujar efecto de onda expansiva durante la transición
  private drawTransitionWave(progress: number) {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const maxRadius = Math.max(this.canvasWidth, this.canvasHeight);
    
    // Fondo del tema anterior
    if (this.previousThemeColors) {
      this.ctx.fillStyle = this.previousThemeColors.background;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    // Onda expansiva del nuevo tema
    if (this.currentThemeColors) {
      const waveRadius = maxRadius * this.easeInOutCubic(progress);
      
      // Crear gradiente radial para la onda
      const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, waveRadius);
      gradient.addColorStop(0, this.currentThemeColors.background);
      gradient.addColorStop(0.7, this.currentThemeColors.background);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Borde brillante de la onda
      this.ctx.strokeStyle = `rgba(0, 255, 195, ${0.8 * (1 - progress)})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, waveRadius * 0.9, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  // Dibujar partículas de transición
  private drawTransitionParticles() {
    if (!this.isTransitioning || this.transitionParticles.length === 0) return;
    
    this.ctx.save();
    
    this.transitionParticles.forEach((particle, index) => {
      // Actualizar posición
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;
      
      // Dibujar partícula
      if (particle.life > 0) {
        const alpha = particle.life;
        const size = 3 * particle.life;
        
        this.ctx.fillStyle = `rgba(0, 255, 195, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Estela de la partícula
        this.ctx.strokeStyle = `rgba(0, 255, 195, ${alpha * 0.5})`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
        this.ctx.stroke();
      }
      
      // Eliminar partículas muertas
      if (particle.life <= 0) {
        this.transitionParticles.splice(index, 1);
      }
    });
    
    this.ctx.restore();
  }



  ngAfterViewInit() {
    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.initCanvas();
      this.initHeartbeatParticles();
      this.initMouseMeteor();
      this.textAnimationStartTime = Date.now();
      this.startAnimation();
      
      // Escuchar cambios de tema para activar transición animada
      this.themeService.currentTheme$.subscribe((newTheme) => {
        if (this.currentThemeColors) { // Solo si ya tenemos colores previos
          this.startThemeTransition();
        } else {
          this.currentThemeColors = this.getThemeColors();
        }
      });
    }, 0);
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Ajustar el tamaño del canvas al contenedor
    this.resizeCanvas();
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Escuchar movimiento del mouse
    this.canvasRef.nativeElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    const newWidth = rect.width || 1200;
    const newHeight = rect.height || 800;
    
    // Solo actualizar si las dimensiones han cambiado
    if (this.canvasWidth !== newWidth || this.canvasHeight !== newHeight) {
      this.canvasWidth = newWidth;
      this.canvasHeight = newHeight;
      
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;
      
      // Forzar detección de cambios de manera segura
      this.cdr.detectChanges();
    }
    
    // Reinicializar partículas cuando cambie el tamaño
    this.heartbeatParticles = [];
    this.initHeartbeatParticles();
  }

  private drawAnimatedBackground() {
    // Manejar transición de tema si está activa
    let themeColors = this.getThemeColors();
    let transitionProgress = 0;
    
    if (this.isTransitioning) {
      const elapsed = Date.now() - this.transitionStartTime;
      transitionProgress = Math.min(elapsed / this.transitionDuration, 1);
      
      // Función de easing para suavizar la transición
      const easedProgress = this.easeInOutCubic(transitionProgress);
      
      // Interpolar colores entre tema anterior y nuevo
      if (this.previousThemeColors && this.currentThemeColors) {
        const prevDark = this.previousThemeColors.darkColor;
        const currDark = this.currentThemeColors.darkColor;
        const prevAqua = this.previousThemeColors.aquaColor;
        const currAqua = this.currentThemeColors.aquaColor;
        
        themeColors = {
          background: easedProgress < 0.5 ? this.previousThemeColors.background : this.currentThemeColors.background,
          darkColor: this.lerpColor(prevDark, currDark, easedProgress),
          aquaColor: this.lerpColor(prevAqua, currAqua, easedProgress)
        };
      }
      
      // Finalizar transición
      if (transitionProgress >= 1) {
        this.isTransitioning = false;
        this.previousThemeColors = null;
        console.log('Theme transition completed!');
      }
    }
    
    // Limpiar canvas con color de fondo (con efecto de transición)
    if (this.isTransitioning && transitionProgress < 0.8) {
      // Efecto de onda expansiva durante la transición
      this.drawTransitionWave(transitionProgress);
    } else {
      this.ctx.fillStyle = themeColors.background;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    // Crear gradiente que cambia entre los colores del tema
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const maxRadius = Math.max(this.canvasWidth, this.canvasHeight) / 2;
    
    // Colores del tema actual (interpolados si está en transición)
    const darkColor = themeColors.darkColor;
    const aquaColor = themeColors.aquaColor;
    
    // Intensidad que oscila para efecto de respiración (0 = oscuro, 1 = aqua)
    const breatheIntensity = (Math.sin(this.animationTime * 0.6) + 1) / 2; // 0 a 1
    
    // Interpolar entre oscuro y aqua
    const r = Math.floor(darkColor.r + (aquaColor.r - darkColor.r) * breatheIntensity);
    const g = Math.floor(darkColor.g + (aquaColor.g - darkColor.g) * breatheIntensity);
    const b = Math.floor(darkColor.b + (aquaColor.b - darkColor.b) * breatheIntensity);
    
    // Crear múltiples gradientes concéntricos que oscilan entre oscuro y aqua
    for (let i = 0; i < 3; i++) {
      const gradient = this.ctx.createRadialGradient(
        centerX + Math.sin(this.animationTime * (0.3 + i * 0.1)) * 40,
        centerY + Math.cos(this.animationTime * (0.2 + i * 0.1)) * 30,
        0,
        centerX,
        centerY,
        maxRadius * (0.8 + i * 0.1)
      );
      
      const baseOpacity = 0.15 + i * 0.05;
      const innerOpacity = baseOpacity * (0.8 + breatheIntensity * 0.4);
      const midOpacity = baseOpacity * (0.5 + breatheIntensity * 0.3);
      const outerOpacity = baseOpacity * (0.2 + breatheIntensity * 0.2);
      
      // Gradiente del centro (más intenso) hacia afuera (más sutil)
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${innerOpacity})`);
      gradient.addColorStop(0.5, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)}, ${midOpacity})`);
      gradient.addColorStop(0.8, `rgba(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)}, ${outerOpacity})`);
      gradient.addColorStop(1, 'rgba(15, 15, 15, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }

  private initHeartbeatParticles() {
    // Crear partículas que pulsen con el fondo
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
      this.heartbeatParticles.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        baseSize: Math.random() * 3 + 1, // Tamaño base entre 1 y 4
        opacity: Math.random() * 0.6 + 0.2, // Opacidad entre 0.2 y 0.8
        phase: Math.random() * Math.PI * 2, // Fase aleatoria para variación
        speed: Math.random() * 0.5 + 0.5 // Velocidad de movimiento
      });
    }
  }

  private drawHeartbeatParticles() {
    // Usar la misma intensidad de respiración que el fondo
    const breatheIntensity = (Math.sin(this.animationTime * 0.6) + 1) / 2; // 0 a 1
    
    this.heartbeatParticles.forEach((particle, index) => {
      // Actualizar posición lentamente
      particle.x += Math.sin(this.animationTime * particle.speed + particle.phase) * 0.2;
      particle.y += Math.cos(this.animationTime * particle.speed + particle.phase) * 0.15;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvasWidth;
      if (particle.x > this.canvasWidth) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvasHeight;
      if (particle.y > this.canvasHeight) particle.y = 0;
      
      // Calcular tamaño y opacidad sincronizados con el fondo
      const heartbeatPulse = Math.sin(this.animationTime * 0.6 + particle.phase) * 0.5 + 0.5; // 0 a 1
      const currentSize = particle.baseSize * (0.5 + heartbeatPulse * 1.5); // Pulsa entre 50% y 200% del tamaño base
      const currentOpacity = particle.opacity * breatheIntensity * (0.3 + heartbeatPulse * 0.7);
      
      // Dibujar partícula con glow
      this.ctx.save();
      this.ctx.globalAlpha = currentOpacity;
      
      // Glow exterior
      this.ctx.shadowColor = '#00FFC3';
      this.ctx.shadowBlur = currentSize * 3;
      this.ctx.fillStyle = '#00FFC3';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Núcleo más brillante
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = currentOpacity * 1.5;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, currentSize * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private initMouseMeteor() {
    // Inicializar el meteorito en el centro
    this.mouseMeteor.x = this.canvasWidth / 2;
    this.mouseMeteor.y = this.canvasHeight / 2;
    this.mouseMeteor.targetX = this.mouseMeteor.x;
    this.mouseMeteor.targetY = this.mouseMeteor.y;
    this.mouseMeteor.trail = [];
  }

  private onMouseMove(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouseMeteor.targetX = event.clientX - rect.left;
    this.mouseMeteor.targetY = event.clientY - rect.top;
  }

  private updateAndDrawMouseMeteor() {
    // Suavizar el movimiento hacia el target (más lento)
    const smoothing = 0.12;
    this.mouseMeteor.x += (this.mouseMeteor.targetX - this.mouseMeteor.x) * smoothing;
    this.mouseMeteor.y += (this.mouseMeteor.targetY - this.mouseMeteor.y) * smoothing;
    
    // Agregar posición actual al rastro
    this.mouseMeteor.trail.push({
      x: this.mouseMeteor.x,
      y: this.mouseMeteor.y,
      opacity: 1.0
    });
    
    // Limitar la longitud del rastro
    if (this.mouseMeteor.trail.length > this.mouseMeteor.maxTrailLength) {
      this.mouseMeteor.trail.shift();
    }
    
    // Actualizar opacidad del rastro (fade out más gradual)
    this.mouseMeteor.trail.forEach((point, index) => {
      const fadeProgress = (index + 1) / this.mouseMeteor.trail.length;
      point.opacity = Math.pow(fadeProgress, 0.7); // Curva más suave
    });
    
    // Obtener el color sincronizado con el fondo
    const breatheIntensity = (Math.sin(this.animationTime * 0.6) + 1) / 2; // 0 a 1
    const themeColors = this.getThemeColors();
    const darkColor = themeColors.darkColor;
    const aquaColor = themeColors.aquaColor;
    
    const r = Math.floor(darkColor.r + (aquaColor.r - darkColor.r) * breatheIntensity);
    const g = Math.floor(darkColor.g + (aquaColor.g - darkColor.g) * breatheIntensity);
    const b = Math.floor(darkColor.b + (aquaColor.b - darkColor.b) * breatheIntensity);
    
    // Dibujar la estela del meteorito orgánica
    this.ctx.save();
    
    // Dibujar cada punto del rastro con tamaño y opacidad decreciente
    this.mouseMeteor.trail.forEach((point, index) => {
      const trailOpacity = point.opacity * 0.8; // Más opaco
      const trailSize = (index + 1) / this.mouseMeteor.trail.length * 16; // Tamaño de 1 a 16 (más grande)
      
      // Glow más intenso para cada punto del rastro
      this.ctx.globalAlpha = trailOpacity * 0.4;
      this.ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      this.ctx.shadowBlur = 30;
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailOpacity})`;
      
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Segunda capa de glow
      this.ctx.globalAlpha = trailOpacity * 0.2;
      this.ctx.shadowBlur = 50;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, trailSize * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Dibujar la cabeza del meteorito (más grande y brillante)
    if (this.mouseMeteor.trail.length > 0) {
      const head = this.mouseMeteor.trail[this.mouseMeteor.trail.length - 1];
      
      // Glow exterior
      this.ctx.globalAlpha = 0.3;
      this.ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      this.ctx.shadowBlur = 40; // Más grande
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
      this.ctx.beginPath();
      this.ctx.arc(head.x, head.y, 18, 0, Math.PI * 2); // Más grande
      this.ctx.fill();
      
      // Glow medio
      this.ctx.globalAlpha = 0.6;
      this.ctx.shadowBlur = 25;
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
      this.ctx.beginPath();
      this.ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Núcleo brillante
      this.ctx.globalAlpha = 1;
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`;
      this.ctx.beginPath();
      this.ctx.arc(head.x, head.y, 6, 0, Math.PI * 2); // Más grande
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }



  private startAnimation() {
    this.animate();
  }

  private animate() {
    this.animationTime += 0.016; // ~60fps
    this.clearCanvas();
    this.drawAnimatedBackground();
    this.drawHeartbeatParticles();
    this.updateAndDrawMouseMeteor();
    this.drawTransitionParticles(); // Efecto de partículas durante transición
    this.drawHeroContent();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }



  private drawHeroContent() {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    
    // Dibujar contenido centrado (texto principal)
    this.drawHeroText(centerX, centerY);
    
    // Dibujar botones centrados
    this.drawButtons(centerX, centerY + 150);
  }

  private drawHeroText(x: number, y: number) {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Calcular progreso de la animación de entrada
    const currentTime = Date.now();
    const elapsed = currentTime - this.textAnimationStartTime;
    const progress = Math.min(elapsed / this.textAnimationDuration, 1);
    
    // Función de easing suave (ease-out)
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const animProgress = easeOut(progress);
    
    // Saludo "Hola, soy" - con animación de entrada
    this.ctx.font = '24px Arial, sans-serif';
    this.ctx.fillStyle = '#888';
    
    // Efecto de fade-in y slide desde la izquierda
    const greetingDelay = 0;
    const greetingProgress = Math.max(0, Math.min((progress - greetingDelay) / 0.3, 1));
    const greetingEased = easeOut(greetingProgress);
    const greetingX = x - (1 - greetingEased) * 50;
    const greetingOpacity = greetingEased;
    
    this.ctx.save();
    this.ctx.globalAlpha = greetingOpacity;
    this.ctx.fillText('Hola, soy', greetingX, y - 80);
    this.ctx.restore();
    
    // Nombre principal - con animación de entrada
    this.ctx.font = 'bold 56px Arial, sans-serif';
    this.ctx.fillStyle = '#fff';
    this.ctx.shadowColor = 'rgba(0, 255, 195, 0.5)';
    this.ctx.shadowBlur = 20;
    
    // Efecto de fade-in y scale desde pequeño
    const nameDelay = 0.2;
    const nameProgress = Math.max(0, Math.min((progress - nameDelay) / 0.4, 1));
    const nameEased = easeOut(nameProgress);
    const nameScale = 0.5 + (nameEased * 0.5);
    const nameOpacity = nameEased;
    
    this.ctx.save();
    this.ctx.globalAlpha = nameOpacity;
    this.ctx.scale(nameScale, nameScale);
    this.ctx.fillText('Juan Encabo', x / nameScale, (y - 30) / nameScale);
    this.ctx.restore();
    
    // Descripción con animaciones de entrada
    this.ctx.font = '18px Arial, sans-serif';
    this.ctx.shadowBlur = 0;
    
    // Línea 1: Estudiante de la Tecnicatura Universitaria
    const line1Delay = 0.5;
    const line1Progress = Math.max(0, Math.min((progress - line1Delay) / 0.4, 1));
    const line1Eased = easeOut(line1Progress);
    const line1Y = y + 20 + (1 - line1Eased) * 20; // Slide desde abajo
    const line1Opacity = line1Eased;
    
    this.ctx.save();
    this.ctx.globalAlpha = line1Opacity;
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText('Estudiante de la Tecnicatura Universitaria', x, line1Y);
    this.ctx.restore();
    
    // Línea 2: en Desarrollo de Aplicaciones Informáticas (TUDAI) en Unicen.
    const line2Delay = 0.7;
    const line2Progress = Math.max(0, Math.min((progress - line2Delay) / 0.4, 1));
    const line2Eased = easeOut(line2Progress);
    const line2Y = y + 42 + (1 - line2Eased) * 20; // Slide desde abajo
    const line2Opacity = line2Eased;
    
    const beforeTudai = 'en Desarrollo de Aplicaciones Informáticas ';
    const tudaiText = '(TUDAI)';
    const afterTudai = ' en Unicen.';
    
    // Medir anchos para posicionamiento
    const beforeWidth = this.ctx.measureText(beforeTudai).width;
    const tudaiWidth = this.ctx.measureText(tudaiText).width;
    const totalWidth = beforeWidth + tudaiWidth + this.ctx.measureText(afterTudai).width;
    
    // Calcular posición inicial para centrar toda la línea
    const startX = x - totalWidth / 2;
    
    this.ctx.save();
    this.ctx.globalAlpha = line2Opacity;
    
    // Texto antes de TUDAI
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText(beforeTudai, startX + beforeWidth / 2, line2Y);
    
    // TUDAI como enlace
    const tudaiX = startX + beforeWidth + tudaiWidth / 2;
    this.ctx.fillStyle = '#00ffc3';
    this.ctx.fillText(tudaiText, tudaiX, line2Y);
    
    // Texto después de TUDAI
    const afterX = startX + beforeWidth + tudaiWidth + this.ctx.measureText(afterTudai).width / 2;
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText(afterTudai, afterX, line2Y);
    
    this.ctx.restore();
    
    // Guardar posición del enlace TUDAI para detección de clicks
    this.tudaiLink = {
      x: tudaiX - tudaiWidth / 2,
      y: line2Y - 12,
      width: tudaiWidth,
      height: 24
    };
    
    // Línea 4: Apasionado por crear aplicaciones web
    const line4Delay = 0.9;
    const line4Progress = Math.max(0, Math.min((progress - line4Delay) / 0.4, 1));
    const line4Eased = easeOut(line4Progress);
    const line4Y = y + 86 + (1 - line4Eased) * 20; // Slide desde abajo
    const line4Opacity = line4Eased;
    
    this.ctx.save();
    this.ctx.globalAlpha = line4Opacity;
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText('Apasionado por crear aplicaciones web', x, line4Y);
    this.ctx.restore();
    
    // Línea 5: modernas y experiencias de usuario excepcionales.
    const line5Delay = 1.1;
    const line5Progress = Math.max(0, Math.min((progress - line5Delay) / 0.4, 1));
    const line5Eased = easeOut(line5Progress);
    const line5Y = y + 108 + (1 - line5Eased) * 20; // Slide desde abajo
    const line5Opacity = line5Eased;
    
    this.ctx.save();
    this.ctx.globalAlpha = line5Opacity;
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText('modernas y experiencias de usuario excepcionales.', x, line5Y);
    this.ctx.restore();
  }





  private drawButtons(x: number, y: number) {
    this.buttons = []; // Reset buttons array
    
    // Calcular progreso de la animación de entrada para botones
    const currentTime = Date.now();
    const elapsed = currentTime - this.textAnimationStartTime;
    const progress = Math.min(elapsed / this.textAnimationDuration, 1);
    
    // Función de easing suave (ease-out)
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    
    // Animación de entrada para botones
    const buttonsDelay = 1.3;
    const buttonsProgress = Math.max(0, Math.min((progress - buttonsDelay) / 0.5, 1));
    const buttonsEased = easeOut(buttonsProgress);
    const buttonsOffsetY = (1 - buttonsEased) * 30; // Slide desde abajo
    const buttonsOpacity = buttonsEased;
    
    const button1 = {
      x: x - 110,
      y: y + buttonsOffsetY,
      width: 120,
      height: 40,
      text: 'Ver Proyectos',
      type: 'primary' as const,
      action: 'projects',
      opacity: buttonsOpacity
    };
    
    const button2 = {
      x: x + 20,
      y: y + buttonsOffsetY,
      width: 100,
      height: 40,
      text: 'Contactar',
      type: 'secondary' as const,
      action: 'contact',
      opacity: buttonsOpacity
    };
    
    this.buttons.push(button1, button2);
    
    this.buttons.forEach(button => {
      this.drawButton(button);
    });
  }

  private drawButton(button: CanvasButton) {
    const isHovered = this.hoveredButton === button;
    const animOffset = isHovered ? Math.sin(this.animationTime * 8) * 2 : 0;
    
    // Aplicar opacidad de la animación de entrada
    this.ctx.save();
    this.ctx.globalAlpha = button.opacity || 1;
    
    // Sombra del botón
    this.ctx.shadowColor = button.type === 'primary' ? 'rgba(0, 255, 195, 0.3)' : 'rgba(0, 255, 195, 0.2)';
    this.ctx.shadowBlur = isHovered ? 15 : 8;
    
    // Fondo del botón
    if (button.type === 'primary') {
      const gradient = this.ctx.createLinearGradient(button.x, button.y, button.x + button.width, button.y + button.height);
      gradient.addColorStop(0, '#00ffc3');
      gradient.addColorStop(1, '#00d4aa');
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = isHovered ? 'rgba(0, 255, 195, 0.1)' : 'rgba(255, 255, 255, 0.05)';
    }
    
    // Dibujar rectángulo del botón con bordes redondeados
    this.drawRoundedRect(button.x, button.y - animOffset, button.width, button.height, 20);
    this.ctx.fill();
    
    // Borde del botón
    this.ctx.strokeStyle = isHovered ? 'rgba(0, 255, 195, 0.5)' : 'rgba(0, 255, 195, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // Texto del botón
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = button.type === 'primary' ? '#000' : '#00ffc3';
    this.ctx.font = '16px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 - animOffset);
    
    this.ctx.restore();
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  onCanvasClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Verificar click en enlace TUDAI
    if (this.tudaiLink && 
        x >= this.tudaiLink.x && x <= this.tudaiLink.x + this.tudaiLink.width &&
        y >= this.tudaiLink.y && y <= this.tudaiLink.y + this.tudaiLink.height) {
      window.open('https://exa.unicen.edu.ar/tudai/', '_blank');
      return;
    }
    
    // Verificar click en botones
    const clickedButton = this.buttons.find(button => 
      x >= button.x && x <= button.x + button.width &&
      y >= button.y && y <= button.y + button.height
    );
    
    if (clickedButton) {
      this.buttonClick.emit(clickedButton.action);
    }
  }

  onCanvasMouseMove(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Verificar hover en enlace TUDAI
    const isHoveringTudai = this.tudaiLink && 
      x >= this.tudaiLink.x && x <= this.tudaiLink.x + this.tudaiLink.width &&
      y >= this.tudaiLink.y && y <= this.tudaiLink.y + this.tudaiLink.height;
    
    // Verificar hover en botones
    const hoveredButton = this.buttons.find(button => 
      x >= button.x && x <= button.x + button.width &&
      y >= button.y && y <= button.y + button.height
    );
    
    if (hoveredButton !== this.hoveredButton) {
      this.hoveredButton = hoveredButton || null;
    }
    
    // Cambiar cursor
    const shouldShowPointer = this.hoveredButton || isHoveringTudai;
    this.canvasRef.nativeElement.style.cursor = shouldShowPointer ? 'pointer' : 'default';
  }
}

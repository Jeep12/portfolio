import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Subject {
  name: string;
  concepts: string[];
  credits?: number;
}

interface Semester {
  number: 1 | 2;
  name: string;
  subjects: Subject[];
}

interface AcademicYear {
  year: number;
  displayYear: string;
  semesters: Semester[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  academicTimeline: AcademicYear[] = [
    {
      year: 1,
      displayYear: 'Primer Año ',
      semesters: [
        {
          number: 1,
          name: '1er Cuatrimestre',
          subjects: [
            {
              name: 'Programación I',
              concepts: [
                'Algoritmos y lógica de programación',
                'Tipos de datos y operadores en Java',
                'Estructuras de control y funciones',
                'Arreglos y colecciones básicas',
                'Metodologías de resolución de problemas',
                'Entornos de desarrollo y debugging'
              ]
            },
            {
              name: 'Web I',
              concepts: [
                'HTML5 y CSS3 básicos',
                'Layouts, tablas y formularios',
                'JavaScript: DOM y eventos',
                'Herencia, cascada y selectores CSS',
                'Diseño responsive y media queries',
                'Semántica web',
                'Formularios con JavaScript',
                'JSON y manipulación de datos'
              ]
            },

          ]
        },
        {
          number: 2,
          name: '2do Cuatrimestre',
          subjects: [
            {
              name: 'Web II',
              concepts: [
                'Arquitectura web y comunicación cliente-servidor',
                'JavaScript avanzado y DOM',
                'Programación Server Side con PHP',
                'APIs REST y consumo de servicios',
                'Autenticación JWT y seguridad web',
                'Aplicaciones web dinámicas'
              ]
            },
            {
              name: 'Tecnología de la Información en las Organizaciones',
              concepts: [
                'Sistemas de información organizacionales',
                'Flujos de datos y procesos',
                'Control de versiones con Git',
                'Software libre vs. licenciado',
                'CRM y ERP básico',
                'Licencias de software (GPL, MIT, Apache)'
              ]
            },

            {
              name: 'Taller Matematico Computacional',
              concepts: [
                'Lógica: fundamentos y aplicaciones',
                'Conjuntos y operaciones básicas',
                'Funciones: definición y propiedades',
                'Conteo: principios y técnicas',
                'Probabilidades: conceptos básicos',
                'Estadística: análisis y visualización de datos'
              ],
            }
          ]
        }
      ]
    },
    {
      year: 2,
      displayYear: 'Segundo Año (2024)',
      semesters: [
        {
          number: 1,
          name: '3er Cuatrimestre',
          subjects: [
            {
              name: 'Programación II',
              concepts: [
                'POO: Objetos, clases, herencia y polimorfismo',
                'Interfaces y clases abstractas',
                'Manejo de excepciones',
                'Patrones de diseño: Strategy, Observer, Decorator, Composite',
                'Buenas prácticas y refactoring',
                'Asociación, agregación y composición'
              ]
            },
            {
              name: 'Base de Datos I',
              concepts: [
                'Modelo relacional y álgebra relacional',
                'SQL: DDL, DML y consultas complejas',
                'Normalización y diseño de BD',
                'Integridad referencial y constraints',
                'Índices y optimización básica',
                'Transacciones y concurrencia'
              ]
            },
            {
              name: 'Metodologías de Desarrollo',
              concepts: [
                'Ciclo de vida del software (SDLC)',
                'Metodologías ágiles: Scrum y Kanban',
                'Testing: unitario, integración y aceptación',
                'Documentación técnica y de usuario',
                'Gestión de requisitos',
                'Control de calidad y métricas'
              ]
            },
            {
              name: 'Programación Web I',
              concepts: [
                'HTML5 semántico y accesibilidad',
                'CSS3: Grid, Flexbox y animaciones',
                'JavaScript ES6+ y manipulación del DOM',
                'Responsive design y mobile first',
                'Bootstrap y frameworks CSS',
                'Debugging y herramientas de desarrollo'
              ]
            }
          ]
        },
        {
          number: 2,
          name: '4to Cuatrimestre',
          subjects: [
            {
              name: 'Programación Avanzada',
              concepts: ['Spring Framework', 'Spring Boot', 'APIs REST', 'Microservicios', 'Inyección de dependencias']
            },
            {
              name: 'Base de Datos II',
              concepts: ['MySQL', 'Triggers', 'Procedures', 'Optimización', 'Transacciones', 'JPA/Hibernate']
            },
            {
              name: 'Programación Web II',
              concepts: ['Angular', 'TypeScript', 'Components', 'Services', 'Routing', 'HTTP Client', 'RxJS']
            },
            {
              name: 'Redes y Comunicaciones',
              concepts: ['Protocolos TCP/IP', 'HTTP/HTTPS', 'APIs', 'Seguridad web', 'Autenticación']
            }
          ]
        }
      ]
    },
    {
      year: 3,
      displayYear: 'Tercer Año (2025)',
      semesters: [
        {
          number: 1,
          name: '5to Cuatrimestre',
          subjects: [
            {
              name: 'Desarrollo de Aplicaciones',
              concepts: ['Arquitectura MVC', 'Patrones de diseño', 'Clean Code', 'SOLID', 'Testing unitario']
            },
            {
              name: 'Seguridad Informática',
              concepts: ['Criptografía', 'Autenticación', 'Autorización', 'JWT', 'OWASP', 'Vulnerabilidades web']
            },
            {
              name: 'Gestión de Proyectos',
              concepts: ['Project Management', 'Agile', 'Kanban', 'Estimación', 'Riesgos', 'Calidad de software']
            },
            {
              name: 'Interfaces de Usuario',
              concepts: ['UX/UI Design', 'Usabilidad', 'Accesibilidad', 'Design Systems', 'Prototipado']
            }
          ]
        },
        {
          number: 2,
          name: '6to Cuatrimestre',
          subjects: [
            {
              name: 'Proyecto Final',
              concepts: ['Desarrollo integral', 'Full Stack', 'Deploy', 'DevOps básico', 'Documentación técnica']
            },
            {
              name: 'Práctica Profesional',
              concepts: ['Experiencia laboral', 'Trabajo en equipo', 'Metodologías reales', 'Soft skills']
            },
            {
              name: 'Tecnologías Emergentes',
              concepts: ['Cloud Computing', 'Docker', 'CI/CD', 'Microservicios', 'APIs GraphQL']
            },
            {
              name: 'Ética Profesional',
              concepts: ['Responsabilidad profesional', 'Propiedad intelectual', 'Privacidad', 'Código de ética']
            }
          ]
        }
      ]
    }
  ];

  expandedSemesters: Set<string> = new Set();

  toggleSemester(yearIndex: number, semesterIndex: number): void {
    const key = `${yearIndex}-${semesterIndex}`;
    if (this.expandedSemesters.has(key)) {
      this.expandedSemesters.delete(key);
    } else {
      this.expandedSemesters.add(key);
    }
  }

  isSemesterExpanded(yearIndex: number, semesterIndex: number): boolean {
    return this.expandedSemesters.has(`${yearIndex}-${semesterIndex}`);
  }
}

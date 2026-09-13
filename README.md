# Client Portal — ualvarez.

Un portal web privado, liviano y seguro, diseñado para darles a los clientes un espacio exclusivo donde consultar el estado de sus servicios en tiempo real. 

Construido desde cero priorizando una arquitectura limpia, validaciones del lado del cliente y una experiencia de usuario (UX) ágil y fluida.

**[Probar Demo en Vivo](ualvarez-portal.netlify.app)**

---

## Lo destacado del proyecto

- **Autenticación en la nube:** Gestión completa de usuarios (registro, login y logout) impulsada por Supabase Auth.
- **Metadata en el registro:** Captura y almacenamiento del nombre/empresa del cliente para personalización en tiempo real.
- **Rutas protegidas & Guards:** Seguridad en el frontend mediante scripts que verifican la sesión e impiden el acceso no autorizado al Dashboard.
- **UI/UX moderna & Microinteracciones:**
  - Alternancia dinámica entre Iniciar Sesión y Crear Cuenta en la misma interfaz.
  - Validaciones de formulario instantáneas (correo válido, coincidencia de contraseñas y longitud).
  - Transiciones y animaciones suaves con CSS puro (`fadeInUp`, efectos hover y feedback visual).
  - Identidad gráfica vectorial (SVG) e iconografía con Google Material Symbols.
- **Enfoque desacoplado:** Separación total entre la interfaz (HTML/CSS/JS) y el Backend-as-a-Service (BaaS).

---

## Stack Tecnológico

- **Frontend:** Vanilla JavaScript (ES6+), HTML5 semántico, CSS3 (Variables, Flexbox y Grid).
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL & motor de autenticación).
- **Recursos UI:** Google Material Symbols & SVG vectorial.
- **Deploy:** [Netlify](https://www.netlify.com/) con CI/CD automático desde GitHub.

---

## Estructura del Código

```text
portal-clientes/
├── assets/
│   ├── css/
│   │   └── styles.css        # Estilos globales, diseño responsive y animaciones
│   ├── img/
│   │   └── logo.svg          # Isotipo / Marca vectorial (ualvarez.)
│   └── js/
│       ├── config.js         # Inicialización del cliente de Supabase
│       ├── auth.js           # Lógica de login, registro y validaciones
│       └── dashboard.js      # Control de sesión privada y logout
├── index.html                # Formulario principal de acceso
├── dashboard.html            # Panel privado del cliente
└── README.md                 # Documentación del proyecto

## Base de Datos y Seguridad (Supabase / PostgreSQL)

El proyecto utiliza **PostgreSQL** alojado en Supabase con políticas de **Row Level Security (RLS)** para garantizar que cada cliente autenticado acceda exclusivamente a sus propios datos.

### Esquema de la Tabla `services`

```sql
-- 1. Crear la tabla de servicios
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  icon TEXT DEFAULT 'language'
);

-- 2. Habilitar seguridad a nivel de fila (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 3. Política de lectura exclusiva por usuario
CREATE POLICY "Los usuarios solo ven sus propios servicios" 
ON services 
FOR SELECT 
USING (auth.uid() = user_id);



Autor
Creado por Pablo Uriel Alvarez
Ingeniería en Sistemas de Información
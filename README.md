# PP-Source

**PP-Source** es un dashboard personal de finanzas e productividad, diseñado para visualizar y gestionar tus ingresos, gastos y hábitos de forma sencilla y elegante.

## Stack
- **Frontend**: React + Vite
- **Estilos**: TailwindCSS
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Estado**: React Context (localStorage persistence)
- **Notificaciones**: Sonner (toast)

## Funcionalidades

### Dashboard de Finanzas
- **Gastos Anuales**: Gastos que ocurren una vez al año (impuestos, suscripciones, seguros)
- **Ingresos Fijos**: Ingresos mensuales recurrentes (salario, freelance)
- **Gastos Fijos Mensuales**: Gastos recurrentes cada mes (arriendo, internet, servicios)
- **Gastos Variables Mensuales**: Gastos que varían cada mes (transporte, comida)

#### Lógica de Negocio
- Cada sección tiene un **toggle de edición** (lápiz) que permite agregar, editar o eliminar items
- Cada item tiene un **status bulb** con 3 estados:
  - `0` (gris) = No pagado / Pendiente
  - `1` (verde) = Pagado / Completado
  - `2` (rojo) = Error / Sobrepaso
- Los **totales de las stat cards** solo cuentan items con `status: 1` (pagados)
- Los **totales en el footer** de cada sección también solo cuentan status=1
- Los datos se guardan por **año > mes**, permitiendo gestionar finanzas de cualquier mes

### Productividad (Fitness)
- Tracking de hábitos con metas mensuales
- Visualización de racha y progreso

### Analytics
- Gráficos de barras: últimos 6 meses de ingresos vs gastos
- Gráfico de pie: descomposición de gastos (fijos vs variables)
- Comparativa mensual

### Perfil
- Nombre y avatar personalizables
- Gestión de cuentas (Nequi, DaviBank, Efectivo)
- Configuración de alertas de pagos

## Estructura de Datos

```
db = {
  months: ["ENE", "FEB", ...],
  2026: {
    annual: [{ id, name, date, amount, status }],
    months: {
      0: { fixedIncome: [], monthlyExpenses: [], variableExpenses: [] },
      1: { fixedIncome: [], monthlyExpenses: [], variableExpenses: [] },
      ...
    }
  }
}
```

## Conceptos Importantes

- **Status de items**: Solo se cuentan para totales si `status === 1`
- **Date Picker**: Selector de mes/año flotante que cambia el contexto de visualización
- **Glassmorphism UI**: Estética de cristal con backdrop-blur y gradientes

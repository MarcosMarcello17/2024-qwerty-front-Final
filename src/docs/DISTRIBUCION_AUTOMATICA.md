# Distribución Automática de Ingresos

## 📄 Descripción

La funcionalidad de distribución automática permite distribuir los ingresos de dinero de manera proporcional según los presupuestos activos del mes. Esto ayuda a mantener un control automático del dinero según las categorías presupuestadas.

## 🚀 Funcionamiento

### ¿Cómo funciona?

1. **Detección de Ingresos**: El sistema detecta transacciones de la categoría "Ingreso de Dinero"
2. **Análisis de Presupuestos**: Busca presupuestos activos para el mes de la transacción
3. **Cálculo Proporcional**: Distribuye el monto según el porcentaje que representa cada categoría en el presupuesto total
4. **Creación Automática**: Genera transacciones de gasto automáticamente para cada categoría

### Ejemplo Práctico

**Situación**: Recibes $100 de ingreso y tienes un presupuesto mensual de:
- Antojos: $200 (20% del total)
- Impuestos y Servicios: $800 (80% del total)

**Distribución automática**:
- Se crearán $20 para "Antojos" 
- Se crearán $80 para "Impuestos y Servicios"

## 🔧 Casos de Uso

### 1. Ingresos de Pagos de Otros Usuarios
Cuando recibes un pago de otro usuario (a través de `PaymentsPage`), se crea automáticamente una transacción de "Ingreso de Dinero", pero **SIN distribución automática**. Puedes distribuir manualmente después.

### 2. Ingresos Manuales Nuevos
Al crear una nueva transacción de "Ingreso de Dinero" en el modal, tienes la opción de activar la distribución automática inmediatamente.

### 3. Ingresos Existentes
Para cualquier transacción de "Ingreso de Dinero" ya existente, puedes usar el botón de distribución automática en la tabla de transacciones.

## 🎯 Puntos de Acceso

### 1. Modal de Nueva Transacción (`ModalForm.jsx`)
- **Ubicación**: Al crear/editar transacciones
- **Condición**: Solo aparece si la categoría es "Ingreso de Dinero" y hay presupuestos activos
- **Funcionalidad**: Permite distribución inmediata al crear el ingreso

### 2. Tabla de Transacciones (`TransactionsPage.jsx`)
- **Ubicación**: Botón con ícono de gráfico en cada fila de "Ingreso de Dinero"
- **Condición**: Disponible para todas las transacciones de ingreso existentes
- **Funcionalidad**: Distribuye el ingreso existente sin modificar la transacción original

## 🔄 Flujo Técnico

### Backend
1. **AutomationService.java**: Servicio principal con la lógica de distribución
2. **AutomationController.java**: API REST con endpoints:
   - `POST /api/automation/distribuir` - Ejecuta la distribución
   - `GET /api/automation/puede-distribuir` - Verifica disponibilidad
   - `POST /api/automation/previsualizar` - Muestra preview
3. **TransaccionesController.java**: Endpoint `/con-distribucion` para transacciones nuevas

### Frontend
1. **automaticDistributionAPI.js**: Funciones originales del sistema
2. **distributeIncomeAPI.js**: Nuevas funciones simplificadas
3. **AutomaticDistribution.jsx**: Componente modal para preview y confirmación

## 📋 APIs Disponibles

### `distributeIncomeAutomatically(amount, date, description)`
Distribuye un ingreso automáticamente.
```javascript
const result = await distributeIncomeAutomatically(100, "2024-07-20", "Pago recibido");
```

### `canDistributeForDate(date)`
Verifica si se puede distribuir para una fecha específica.
```javascript
const canDistribute = await canDistributeForDate("2024-07-20");
```

### `getDistributionPreview(amount, date, description)`
Obtiene una previsualización de la distribución.
```javascript
const preview = await getDistributionPreview(100, "2024-07-20", "Pago recibido");
```

## ⚠️ Requisitos

1. **Presupuestos Activos**: Debe haber al menos un presupuesto activo para el mes
2. **Categorías Válidas**: Las categorías del presupuesto deben existir
3. **Autenticación**: Usuario debe estar autenticado

## 🎨 UI/UX

### Indicadores Visuales
- **Botón de Distribución**: Ícono de gráfico en la tabla de transacciones
- **Modal de Confirmación**: Preview detallado antes de ejecutar
- **Mensajes de Estado**: Confirmación exitosa o errores

### Experiencia del Usuario
1. **Opcional**: La distribución nunca es obligatoria
2. **Transparente**: Siempre muestra preview antes de ejecutar
3. **Reversible**: Las transacciones creadas se pueden editar/eliminar individualmente

## 🔮 Casos Especiales

### Sin Presupuestos Activos
- El botón de distribución no aparece
- La API retorna error informativo

### Presupuestos Parciales
- Solo distribuye entre las categorías presupuestadas
- Mantiene proporcionalidad entre categorías existentes

### Múltiples Presupuestos
- Considera todos los presupuestos activos del mes
- Suma los montos por categoría si aparece en varios presupuestos

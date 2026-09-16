import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { BackButtonComponent } from '../../shared/back-button/back-button.component';

interface SeccionAyuda {
  id: string;
  icono: string;
  titulo: string;
  palabrasClave: string[];
  parrafos: string[];
  items?: string[];
}

const SECCIONES: SeccionAyuda[] = [
  {
    id: 'navegacion',
    icono: 'menu',
    titulo: 'Navegación general',
    palabrasClave: ['sidebar', 'menu', 'volver', 'atras', 'paginacion', 'paginas', 'navegar'],
    parrafos: [
      'El menú de la izquierda (sidebar) permite moverte entre las secciones del sistema: Resumen, Estadísticas, Lotes, Animales, Alimentos y Ventas. Si tu usuario es administrador, además ves "Configuración".',
      'Casi todas las páginas tienen un botón "Volver" arriba a la izquierda, que te lleva a la pantalla anterior (respeta los filtros o búsquedas que hayas hecho antes de entrar).',
      'Las tablas largas (por ejemplo el listado de Animales) se muestran paginadas: al pie de la tabla podés cambiar de página o elegir cuántas filas ver por página (10, 25 o 50).'
    ]
  },
  {
    id: 'resumen',
    icono: 'dashboard',
    titulo: 'Resumen general',
    palabrasClave: ['dashboard', 'inicio', 'home', 'kpi', 'tarjetas', 'cards'],
    parrafos: [
      'Es la pantalla de inicio. Muestra tarjetas (cards) con los números clave del sistema: animales activos, lotes activos, animales vendidos, ingreso total por ventas, caravanas provisorias a revisar y alimentos con stock bajo.',
      'Cada tarjeta es clickeable: te lleva directo a la sección de detalle correspondiente (por ejemplo, tocar "Animales activos" te lleva al listado de Animales).'
    ]
  },
  {
    id: 'estadisticas',
    icono: 'bar_chart',
    titulo: 'Estadísticas',
    palabrasClave: [
      'graficos',
      'charts',
      'ica',
      'indice de conversion',
      'gdp',
      'ganancia diaria',
      'adpv',
      'semaforo',
      'curva',
      'curva teorica',
      'peso teorico',
      'comparacion',
      'desvio',
      'rezagado',
      'banda de tolerancia'
    ],
    parrafos: [
      'Arriba de todo están los gráficos generales: composición del rodeo (activos/vendidos/bajas), cantidad de animales por lote, peso promedio actual por lote, stock de alimentos vs. stock mínimo, e ingresos por mes según las ventas cargadas. Tocando cualquier gráfico chico se abre en grande para verlo con más detalle.',
      'Todo lo que sigue (ICA, tablero semáforo y comparador de peso) compara "teórico" contra "real". Lo teórico sale siempre de la curva que arma el sistema a partir del plan de alimentación del lote: parte del peso inicial (el promedio del primer pesaje cargado de cada animal, o el valor de planificación si todavía no hay pesajes) y, para cada etapa del plan, va sumando día por día la ganancia diaria esperada (ADPV) y calculando la ración (% de consumo sobre el peso vivo) y su costo. Por eso un lote sin plan de alimentación cargado, o sin fecha de inicio, no tiene curva teórica ni comparaciones — solo los gráficos generales.',
      'El ICA (índice de conversión alimenticia) es cuántos kilos de alimento hicieron falta por cada kilo de peso ganado (consumo acumulado ÷ kilos ganados): cuanto más bajo, más eficiente. El gráfico muestra el ICA teórico (con el consumo y la ganancia que predice el plan) al lado del ICA real (con el alimento efectivamente consumido —cargado en Alimentos— y el peso realmente ganado según los pesajes). El costo por kilo ganado se calcula igual pero con costo en pesos en vez de kilos de alimento, y se ve en el "Resumen económico" de cada lote.',
      'El "Tablero semáforo" compara, lote por lote, la ganancia diaria de peso real contra la esperada por el plan (GDP: kilos ganados ÷ días transcurridos o planificados). El color de la barra real indica qué tan cerca está del plan: verde si llega al 95% o más de lo esperado, amarillo entre 80% y 95%, y rojo por debajo del 80% (el lote se está quedando atrás del plan de alimentación y conviene revisarlo).',
      'El comparador "Peso real vs. plan" toma un lote y ubica cada pesaje cargado en el eje de "días desde el inicio del lote", para poder cruzarlo contra el peso teórico de ese mismo día. La curva teórica se dibuja con una banda de tolerancia de ±5% alrededor: mientras el peso real (promedio del lote) se mantenga dentro de la banda, va según lo esperado.',
      'Debajo del gráfico, el cruce se repite animal por animal usando el último pesaje de cada uno: se calcula el desvío porcentual entre su peso real y el teórico esperado para ese día. Hasta -3% se considera "en línea con el plan", entre -3% y -8% es un "desvío leve" a vigilar, y por debajo de -8% es un "desvío crítico" — esos animales quedan listados como rezagados para revisarlos (puede ser un problema sanitario, de alimentación puntual, u otra causa a chequear en campo).'
    ]
  },
  {
    id: 'lotes',
    icono: 'grid_view',
    titulo: 'Lotes',
    palabrasClave: [
      'lote',
      'nuevo lote',
      'plan de alimentacion',
      'etapa',
      'racion',
      'curva teorica',
      'ica',
      'adpv',
      'resumen economico',
      'costo'
    ],
    parrafos: [
      'Un lote agrupa animales que se manejan juntos (mismo color de caravana, misma fecha de inicio de destete).',
      'Desde el listado de Lotes podés crear un lote nuevo, editar uno existente o eliminarlo (solo si no tiene animales ni pesajes cargados).',
      'Al entrar al detalle de un lote hay tres pestañas:'
    ],
    items: [
      'Animales: la lista de animales que pertenecen a ese lote.',
      'Plan de alimentación: las etapas de alimentación del lote (qué alimento, entre qué día y qué día, % de consumo sobre el peso vivo, ganancia diaria esperada y costo del alimento). Con esos datos el sistema calcula automáticamente la curva teórica día por día (peso esperado, ración y costo acumulado), sin necesidad de cargarla a mano.',
      'Resumen económico: compara lo teórico contra lo real — peso, consumo de alimento, costo total, ICA y costo por kilo ganado.'
    ]
  },
  {
    id: 'animales',
    icono: 'pets',
    titulo: 'Animales',
    palabrasClave: [
      'caravana',
      'caravana provisoria',
      'ficha',
      'pesaje',
      'peso',
      'baja',
      'reactivar',
      'filtro',
      's/c',
      'fecha de nacimiento',
      'nacimiento',
      'edad'
    ],
    parrafos: [
      'El listado de Animales se puede filtrar por caravana, lote o estado (activo / vendido / baja). Desde ahí también se da de alta un animal nuevo.',
      'Los animales marcados con ⚠ tienen "caravana provisoria": vienen de la planilla original sin caravana individual asignada (por ejemplo "S/C - H"). Conviene revisarlos en campo y ponerles la caravana definitiva editando la ficha del animal.',
      'Al entrar a la ficha de un animal (tocando su caravana) ves sus datos generales (sexo, estado, peso actual, fecha de destete y fecha de nacimiento con la edad calculada automáticamente), madre/padre, características y observaciones, y podés:'
    ],
    items: [
      'Registrar un pesaje nuevo (fecha, peso y observaciones opcionales) — queda en el historial de pesajes con la variación respecto al pesaje anterior.',
      'Editar sus datos o eliminarlo (esto borra también su historial de pesajes).',
      'Darlo de baja (con fecha y motivo) si el animal murió o se retiró del sistema, o reactivarlo si estaba de baja por error.'
    ]
  },
  {
    id: 'alimentos',
    icono: 'grass',
    titulo: 'Alimentos',
    palabrasClave: ['stock', 'stock minimo', 'stock bajo', 'movimiento', 'entrada', 'salida', 'ajuste', 'deposito', 'compra'],
    parrafos: [
      'Es el catálogo de tipos de alimento (nombre, costo de referencia por kg, kg por bolsa) junto con el stock disponible en depósito.',
      'Cuando compras alimento, registrá el movimiento como "entrada" (con cantidad, costo total y proveedor si corresponde) para que el stock quede al día. También se pueden registrar salidas o ajustes manuales.',
      'Si un alimento tiene definido un "stock mínimo" y el stock actual cae por debajo, se marca con un aviso ⚠ acá y también aparece como alerta en el Resumen general.'
    ]
  },
  {
    id: 'ventas',
    icono: 'sell',
    titulo: 'Ventas',
    palabrasClave: ['venta', 'vender', 'comprador', 'anular', 'ingreso', 'precio'],
    parrafos: [
      'Para registrar una venta elegís el animal, la fecha, el peso y precio por kg (el total se calcula solo), y opcionalmente el comprador. Al registrarla, el animal pasa automáticamente a estado "vendido".',
      'Si te equivocaste al cargar una venta, podés anularla: el animal vuelve a estado "activo" y la venta se borra del historial.'
    ]
  },
  {
    id: 'configuracion',
    icono: 'settings',
    titulo: 'Configuración',
    palabrasClave: ['color', 'colores', 'tema', 'paleta', 'fondo', 'personalizar', 'admin', 'administrador'],
    parrafos: [
      'Esta sección solo la ve el usuario administrador. Permite elegir el color principal de la aplicación (el que usan los botones, el ítem activo del menú y los chips de estado) y, por separado, el color de fondo de las pantallas.',
      'El cambio se aplica al instante y para todos los usuarios que tengan el sistema abierto, no solo para quien lo cambia: no hace falta guardar nada más ni recargar la página.'
    ]
  }
];

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    BackButtonComponent
  ],
  templateUrl: './ayuda.component.html',
  styleUrl: './ayuda.component.scss'
})
export class AyudaComponent {
  busqueda = signal('');

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  secciones = computed<SeccionAyuda[]>(() => {
    const termino = this.normalizar(this.busqueda().trim());
    if (!termino) return SECCIONES;
    return SECCIONES.filter((s) => {
      const texto = this.normalizar(
        [s.titulo, ...s.palabrasClave, ...s.parrafos, ...(s.items ?? [])].join(' ')
      );
      return texto.includes(termino);
    });
  });

  get hayBusqueda(): boolean {
    return this.busqueda().trim().length > 0;
  }
}

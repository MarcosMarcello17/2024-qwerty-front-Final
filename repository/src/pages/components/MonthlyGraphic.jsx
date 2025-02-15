import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import LoadingSpinner from "./LoadingSpinner";

function MonthlyGraphic({
  transacciones = [],
  type = "",
  payCategories = [],
  payOptions = [],
  filtroMes = "",
  filtroCategoria,
  loading = true,
  transaccionesSinFiltroCat,
}) {
  library.add(fas);

  // Estado para los datos
  const [data, setData] = useState([]);
  const [dataPay, setDataPay] = useState([]);
  const [dataLine, setDataLine] = useState([]);
  const [loadingg, setLoadingg] = useState(true);
  const [transaccionesRestantes, setTransaccionesRestantes] = useState([]);

  useEffect(() => {
    const gastos =
      filtroCategoria !== "Ingreso de Dinero"
        ? transacciones.filter(
            (transaccion) => transaccion.categoria !== "Ingreso de Dinero"
          )
        : transacciones;
  
    let transaccionesConOtros = gastos;
  
    if (
      filtroCategoria &&
      filtroCategoria !== "Todas" &&
      filtroCategoria !== "Ingreso de Dinero"
    ) {
      const transaccionesFiltradas = transaccionesSinFiltroCat
        .filter(
          (transaccion) =>
            transaccion.categoria !== "Ingreso de Dinero" &&
            transaccion.categoria !== filtroCategoria
        )
        .map((transaccion) => ({
          ...transaccion,
          categoria: "Otros",
        }));
      transaccionesConOtros = [...gastos, ...transaccionesFiltradas];
    }
  
    // Agrupar las transacciones por categoría (incluyendo "Otros")
    const sumaPorCategoria = transaccionesConOtros.reduce((acc, transaccion) => {
      const categoria = transaccion.categoria;
      acc[categoria] = (acc[categoria] || 0) + transaccion.valor;
      return acc;
    }, {});
  
    // Agrupar las transacciones por tipo de gasto
    const sumaPorTipoGasto = gastos.reduce((acc, transaccion) => {
      const tipoGasto = transaccion.tipoGasto;
      acc[tipoGasto] = (acc[tipoGasto] || 0) + transaccion.valor;
      return acc;
    }, {});
  
    const allMonths = Array.from({ length: 12 }, (_, index) =>
      new Date(2024, index).toLocaleString("default", { month: "short" })
    );
  
    const allDays = (month) => {
      const daysInMonth = new Date(2024, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, index) => index + 1);
    };
  
    let newDataLine;
  
    if (filtroMes) {
      const selectedMonth = parseInt(filtroMes, 10) - 1;
      const days = allDays(selectedMonth);
  
      const gastosPorDia = gastos.reduce((acc, transaccion) => {
        const fecha = new Date(transaccion.fecha);
        const mes = fecha.getUTCMonth(); // Usar UTC para evitar errores de zona horaria
        if (mes === selectedMonth) {
          const dia = fecha.getUTCDate(); // Obtener el día usando UTC
          acc[dia] = (acc[dia] || 0) + transaccion.valor;
        }
        return acc;
      }, {});
  
      newDataLine = days.map((day) => ({
        label: day.toString(),
        total: gastosPorDia[day] || 0,
      }));
    } else {
      const gastosPorMes = gastos.reduce((acc, transaccion) => {
        const mes = new Date(transaccion.fecha).getUTCMonth(); // Usar UTC para el mes
        acc[mes] = (acc[mes] || 0) + transaccion.valor;
        return acc;
      }, {});
  
      newDataLine = allMonths.map((month, index) => ({
        label: month,
        total: gastosPorMes[index] || 0,
      }));
    }
  
    // Actualizar estados
    setData(
      Object.entries(sumaPorCategoria).map(([categoria, monto]) => ({
        name: categoria,
        value: monto,
      }))
    );
  
    setDataPay(
      Object.entries(sumaPorTipoGasto).map(([tipoGasto, monto]) => ({
        name: tipoGasto,
        value: monto,
      }))
    );
  
    setDataLine(newDataLine);
    setLoadingg(false);
  }, [payCategories, transacciones, filtroMes, filtroCategoria]);
  

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#fe1900",
    "#a500fe",
    "#784315"
  ];

  const getCategoryIcon = (categoryName) => {
    const category = payCategories.find((cat) => cat.value === categoryName);
    return category ? category.iconPath : null;
  };

  return (
    <div className="flex flex-col justify-center items-center py-4 bg-[#000814] h-full w-full">
      {loadingg ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col md:flex-row justify-center items-center w-full">
          <div className="w-full md:w-7/12 md:h-2/6 flex justify-center items-center">
            <ResponsiveContainer width="50%" aspect={1}>
              <PieChart>
                <Pie
                  data={type === "categorias" ? data : dataPay}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(type === "categorias" ? data : dataPay).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="legend flex flex-col mt-4">
              {type === "categorias" &&
                data.map((entry, index) => {
                  const iconPath = getCategoryIcon(entry.name);
                  return (
                    <div
                      key={`legend-item-${index}`}
                      className="flex items-center mb-2 text-white"
                    >
                      {iconPath && (
                        <FontAwesomeIcon
                          icon={iconPath}
                          className="mr-2"
                          style={{ color: COLORS[index % COLORS.length] }}
                        />
                      )}
                      <span>{entry.name}</span>
                    </div>
                  );
                })}
              {type === "tipoGasto" &&
                dataPay.map((entry, index) => (
                  <div
                    key={`legend-item-${index}`}
                    className="flex items-center mb-2 text-white"
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: COLORS[index % COLORS.length],
                        marginRight: "8px",
                      }}
                    ></div>
                    <span>{entry.name}</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="w-full md:w-5/12 md:h-2/6 flex justify-center items-center mt-4 md:mt-0">
            <ResponsiveContainer width="100%" aspect={1.5}>
              <BarChart data={dataLine}>
                <XAxis dataKey="label" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Bar type="monotone" dataKey="total" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyGraphic;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const displayText = percent < 0.01 ? "<1%" : `${(percent * 100).toFixed(0)}%`;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {displayText}
    </text>
  );
};

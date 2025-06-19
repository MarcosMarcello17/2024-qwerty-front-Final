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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function PaymentMethodGraphic({
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
    const currentYear = new Date().getFullYear();
    const transaccionesDelAnio = transacciones.filter(
      (transaccion) => new Date(transaccion.fecha).getFullYear() === currentYear
    );

    const gastos =
      filtroCategoria !== "Ingreso de Dinero"
        ? transaccionesDelAnio.filter(
            (transaccion) => transaccion.categoria !== "Ingreso de Dinero"
          )
        : transaccionesDelAnio;

    // También filtrar transaccionesSinFiltroCat por año
    const transaccionesSinFiltroCatDelAnio =
      transaccionesSinFiltroCat?.filter(
        (transaccion) =>
          new Date(transaccion.fecha).getFullYear() === currentYear
      ) || [];

    let transaccionesConOtros = gastos;

    if (
      filtroCategoria &&
      filtroCategoria !== "Todas" &&
      filtroCategoria !== "Ingreso de Dinero"
    ) {
      const transaccionesFiltradas = transaccionesSinFiltroCatDelAnio
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
    const sumaPorCategoria = transaccionesConOtros.reduce(
      (acc, transaccion) => {
        const categoria = transaccion.categoria;
        acc[categoria] = (acc[categoria] || 0) + transaccion.valor;
        return acc;
      },
      {}
    );

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
    "#784315",
  ];

  const getCategoryIcon = (categoryName) => {
    const category = payCategories.find((cat) => cat.value === categoryName);
    return category ? category.iconPath : null;
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline">Payment Method Usage</CardTitle>
        <CardDescription>
          Distribution of transactions by payment method.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dataPay}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value) => [`${value}%`, "Usage"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentMethodGraphic;

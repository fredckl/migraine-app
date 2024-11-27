import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';
import { parseISO, format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Fréquence des migraines par mois',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Nombre de migraines',
      },
      ticks: {
        stepSize: 1
      }
    }
  }
};

const MigraineMonthlyChart = ({ migraines }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (!migraines?.length) return;

    // Trouver la période totale
    const dates = migraines.map(m => parseISO(m.start_time));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Générer tous les mois dans l'intervalle
    const months = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate)
    });

    // Compter les migraines par mois
    const monthCounts = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      return {
        month: format(month, 'MMMM yyyy', { locale: fr }),
        count: migraines.filter(migraine => {
          const date = parseISO(migraine.start_time);
          return date >= monthStart && date <= monthEnd;
        }).length
      };
    });

    setChartData({
      labels: monthCounts.map(m => m.month),
      datasets: [
        {
          label: 'Nombre de migraines',
          data: monthCounts.map(m => m.count),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        }
      ]
    });
  }, [migraines]);

  if (!migraines?.length) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Fréquence des migraines par mois
          </Typography>
          <Typography color="textSecondary">
            Pas de données à afficher
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Bar options={options} data={chartData} />
      </CardContent>
    </Card>
  );
};

export default MigraineMonthlyChart;

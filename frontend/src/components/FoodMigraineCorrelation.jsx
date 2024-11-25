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
import { subHours, parseISO } from 'date-fns';

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
      text: 'Corrélation Aliments - Migraines (24h avant)',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '% de présence avant une migraine',
      },
      max: 100
    }
  }
};

const FoodMigraineCorrelation = ({ migraines, foodEntries }) => {
  const [correlationData, setCorrelationData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (!migraines?.length || !foodEntries?.length) {
      console.log('Pas de données à analyser:', { migraines, foodEntries });
      return;
    }

    console.log('Analyse des données:', { 
      nbMigraines: migraines.length, 
      nbFoodEntries: foodEntries.length 
    });

    // Fonction pour trouver les repas dans les 24h avant une migraine
    const findFoodsBefore = (migraineTime) => {
      const migraineDate = parseISO(migraineTime);
      const twentyFourHoursBefore = subHours(migraineDate, 24);
      
      return foodEntries.filter(entry => {
        const entryDate = parseISO(entry.datetime);
        return entryDate >= twentyFourHoursBefore && entryDate <= migraineDate;
      });
    };

    // Compter les occurrences de chaque aliment avant les migraines
    const foodCount = {};
    const totalFoodCount = {};

    // Initialiser le compteur pour tous les aliments
    foodEntries.forEach(entry => {
      if (!entry.food_items) {
        console.warn('Entry sans food_items:', entry);
        return;
      }
      
      entry.food_items.forEach(item => {
        const foodName = item.category?.name || item.name;
        if (!foodName) {
          console.warn('Item sans nom:', item);
          return;
        }
        
        if (!totalFoodCount[foodName]) {
          totalFoodCount[foodName] = 0;
        }
        totalFoodCount[foodName]++;
      });
    });

    console.log('Total des aliments:', totalFoodCount);

    // Compter les aliments avant les migraines
    migraines.forEach(migraine => {
      const relatedFoods = findFoodsBefore(migraine.start_time);
      console.log('Aliments trouvés avant la migraine du', migraine.start_time, ':', relatedFoods.length);
      
      relatedFoods.forEach(entry => {
        if (!entry.food_items) return;
        
        entry.food_items.forEach(item => {
          const foodName = item.category?.name || item.name;
          if (!foodName) return;
          
          if (!foodCount[foodName]) {
            foodCount[foodName] = 0;
          }
          foodCount[foodName]++;
        });
      });
    });

    console.log('Aliments avant migraines:', foodCount);

    // Calculer le pourcentage de corrélation
    const correlations = Object.entries(foodCount).map(([food, count]) => {
      const total = totalFoodCount[food] || 0;
      const correlation = total > 0 ? (count / total) * 100 : 0;
      return { food, correlation, count, total };
    });

    console.log('Corrélations calculées:', correlations);

    // Trier par corrélation et prendre les 10 premiers
    const topCorrelations = correlations
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, 10);

    console.log('Top 10 corrélations:', topCorrelations);

    setCorrelationData({
      labels: topCorrelations.map(item => item.food),
      datasets: [
        {
          label: '% de présence avant une migraine',
          data: topCorrelations.map(item => Number(item.correlation.toFixed(1))),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        }
      ]
    });
  }, [migraines, foodEntries]);

  if (!migraines?.length || !foodEntries?.length) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Corrélation Aliments - Migraines
          </Typography>
          <Typography color="textSecondary">
            Pas assez de données pour établir des corrélations
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Corrélation Aliments - Migraines
        </Typography>
        <Bar options={options} data={correlationData} />
      </CardContent>
    </Card>
  );
};

export default FoodMigraineCorrelation;

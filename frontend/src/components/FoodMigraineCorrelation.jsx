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
import { 
  Card, 
  CardContent, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Slider,
  Box,
  TextField,
  IconButton,
  Tooltip as MuiTooltip,
  InputAdornment
} from '@mui/material';
import { subHours, parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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

const formatDateForInput = (date) => {
  return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: fr });
};

const FoodMigraineCorrelation = ({ migraines, foodEntries }) => {
  const [correlationData, setCorrelationData] = useState({
    labels: [],
    datasets: []
  });
  const [minOccurrences, setMinOccurrences] = useState(1);
  const [minCorrelation, setMinCorrelation] = useState(0);
  const [numItems, setNumItems] = useState(10);
  const [allCorrelations, setAllCorrelations] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState({ min: '', max: '' });

  useEffect(() => {
    if (!migraines?.length || !foodEntries?.length) return;

    // Calculer les dates min et max une seule fois
    const dates = [...migraines.map(m => m.start_time), ...foodEntries.map(f => f.datetime)]
      .map(d => parseISO(d));
    const minDate = formatDateForInput(new Date(Math.min(...dates)));
    const maxDate = formatDateForInput(new Date(Math.max(...dates)));
    setDateRange({ min: minDate, max: maxDate });
  }, [migraines, foodEntries]);

  useEffect(() => {
    if (!migraines?.length || !foodEntries?.length) {
      return;
    }

    // Filtrer les migraines et les entrées alimentaires par date si des dates sont sélectionnées
    let filteredMigraines = migraines;
    let filteredFoodEntries = foodEntries;

    if (startDate && endDate) {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));

      filteredMigraines = migraines.filter(migraine => {
        const migraineDate = parseISO(migraine.start_time);
        return isWithinInterval(migraineDate, { start, end });
      });

      filteredFoodEntries = foodEntries.filter(entry => {
        const entryDate = parseISO(entry.datetime);
        return isWithinInterval(entryDate, { start, end });
      });
    }

    // Fonction pour trouver les repas dans les 24h avant une migraine
    const findFoodsBefore = (migraineTime) => {
      const migraineDate = parseISO(migraineTime);
      const twentyFourHoursBefore = subHours(migraineDate, 24);
      
      return filteredFoodEntries.filter(entry => {
        const entryDate = parseISO(entry.datetime);
        return entryDate >= twentyFourHoursBefore && entryDate <= migraineDate;
      });
    };

    // Compter les occurrences de chaque aliment avant les migraines
    const foodCount = {};
    const totalFoodCount = {};

    // Initialiser le compteur pour tous les aliments
    filteredFoodEntries.forEach(entry => {
      if (!entry.food_items) {
        return;
      }
      
      entry.food_items.forEach(item => {
        const foodName = item.category?.name || item.name;
        if (!foodName) {
          return;
        }
        
        if (!totalFoodCount[foodName]) {
          totalFoodCount[foodName] = 0;
        }
        totalFoodCount[foodName]++;
      });
    });

    // Compter les aliments avant les migraines
    filteredMigraines.forEach(migraine => {
      const relatedFoods = findFoodsBefore(migraine.start_time);
      
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

    // Calculer le pourcentage de corrélation
    const correlations = Object.entries(foodCount).map(([food, count]) => {
      const total = totalFoodCount[food] || 0;
      const correlation = total > 0 ? (count / total) * 100 : 0;
      return { food, correlation, count, total };
    });

    setAllCorrelations(correlations);
  }, [migraines, foodEntries, startDate, endDate]);

  useEffect(() => {
    if (!allCorrelations.length) return;

    // Filtrer et trier les corrélations selon les critères
    const filteredCorrelations = allCorrelations
      .filter(item => item.total >= minOccurrences && item.correlation >= minCorrelation)
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, numItems);

    setCorrelationData({
      labels: filteredCorrelations.map(item => item.food),
      datasets: [
        {
          label: '% de présence avant une migraine',
          data: filteredCorrelations.map(item => Number(item.correlation.toFixed(1))),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        }
      ]
    });
  }, [allCorrelations, minOccurrences, minCorrelation, numItems]);

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

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Corrélation Aliments - Migraines
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date de début"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: dateRange.min, max: endDate || dateRange.max }}
                      helperText={startDate ? formatDateForDisplay(startDate) : ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date de fin"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: startDate || dateRange.min, max: dateRange.max }}
                      helperText={endDate ? formatDateForDisplay(endDate) : ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    {(startDate || endDate) && (
                      <MuiTooltip title="Effacer les dates">
                        <IconButton onClick={handleClearDates} size="small">
                          <ClearIcon />
                        </IconButton>
                      </MuiTooltip>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ width: '100%' }}>
              <Typography gutterBottom>
                {`Nombre minimum d'occurrences`}
              </Typography>
              <Slider
                value={minOccurrences}
                onChange={(e, newValue) => setMinOccurrences(newValue)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ width: '100%' }}>
              <Typography gutterBottom>
                Corrélation minimum (%)
              </Typography>
              <Slider
                value={minCorrelation}
                onChange={(e, newValue) => setMinCorrelation(newValue)}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{`Nombre d'aliments`}</InputLabel>
              <Select
                value={numItems}
                label="Nombre d'aliments"
                onChange={(e) => setNumItems(e.target.value)}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Bar options={options} data={correlationData} />
      </CardContent>
    </Card>
  );
};

export default FoodMigraineCorrelation;

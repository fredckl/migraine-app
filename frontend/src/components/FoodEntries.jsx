import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { getFoodEntries, deleteFood } from '../api/apiService';
import AddFoodEntryForm from './forms/AddFoodEntryForm';

const FoodEntries = () => {
  const [entries, setEntries] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const loadEntries = async () => {
    try {
      const response = await getFoodEntries();
      setEntries(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des entrées:', error);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleAddSuccess = () => {
    setOpenDialog(false);
    loadEntries();
  };

  const handleDeleteFood = async (foodId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      try {
        await deleteFood(foodId);
        await loadEntries();
      } catch (error) {
        console.error('Erreur lors de la suppression du repas:', error);
      }
    }
  };

  const getMealTypeName = (mealType) => {
    switch (mealType) {
      case 'breakfast':
        return 'Petit-déjeuner';
      case 'lunch':
        return 'Déjeuner';
      case 'dinner':
        return 'Dîner';
      case 'snack':
        return 'Collation';
      default:
        return mealType;
    }
  };

  // Group entries by date and meal type
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = format(new Date(entry.datetime), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };
    }
    groups[date][entry.meal_type].push(entry);
    return groups;
  }, {});

  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      gap: 2
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h4" component="h1">
          Journal Alimentaire
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Ajouter un repas
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {Object.entries(groupedEntries)
          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, dayMeals]) => (
            <Paper key={date} sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {format(new Date(date), 'PPPP', { locale: fr })}
              </Typography>
              <Grid container spacing={2}>
                {mealTypeOrder.map((mealType) => {
                  const mealEntries = dayMeals[mealType];
                  if (mealEntries.length === 0) return null;

                  return (
                    <Grid item xs={12} key={mealType}>
                      <Card variant="outlined">
                        <CardContent>
                          {mealEntries.map((entry, index) => (
                            <Box key={index}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6">
                                      {format(new Date(entry.datetime), 'PPPP', { locale: fr })}
                                      {entry.time && ` à ${entry.time}`}
                                    </Typography>
                                    <Typography color="textSecondary">
                                      {getMealTypeName(entry.meal_type)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {entry.food_items.map((item, index) => (
                                      <Chip
                                        key={`${entry.id}-${index}`}
                                        label={`${item.category.name} ${item.name || ''} - ${item.quantity}${item.unit}`}
                                        color={item.category.is_common_trigger ? 'error' : 'default'}
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                  {entry.notes && (
                                    <Typography sx={{ mt: 1 }} color="textSecondary">
                                      Notes: {entry.notes}
                                    </Typography>
                                  )}
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteFood(entry.id)}
                                  sx={{ ml: 2 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          ))}
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <AddFoodEntryForm
          onSuccess={handleAddSuccess}
          onCancel={() => setOpenDialog(false)}
        />
      </Dialog>
    </Box>
  );
};

export default FoodEntries;

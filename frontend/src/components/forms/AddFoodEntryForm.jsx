import { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Grid,
  Autocomplete,
  InputAdornment,
  Typography,
} from '@mui/material';
import { addFoodEntry, getCategories } from '../../api/apiService';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const formatDateTimeForInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const formatDateTimeForDisplay = (dateStr) => {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'dd MMMM yyyy HH:mm', { locale: fr });
};

// eslint-disable-next-line react/prop-types
const AddFoodEntryForm = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    notes: '',
    datetime: formatDateTimeForInput(new Date()),
  });
  const [foodItems, setFoodItems] = useState([]);
  const [newItem, setNewItem] = useState({
    category_id: '',
    name: '',
    quantity: '',
    unit: 'g',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (foodItems.length === 0) {
      console.log('No food items to submit');
      return;
    }

    const datetime = new Date(formData.datetime);
    const entryData = {
      date: datetime.toISOString().split('T')[0],
      time: datetime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      meal_type: formData.meal_type,
      notes: formData.notes,
      food_items: foodItems,
    };
    console.log('Submitting entry:', entryData);

    try {
      const response = await addFoodEntry(entryData);
      console.log('Response:', response);
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error.response?.data || error.message);
    }
  };

  const handleAddItem = () => {
    if (!newItem.category_id || !newItem.quantity) {
      console.log('Missing required fields:', newItem);
      return;
    }

    console.log('Adding item:', newItem);
    setFoodItems([...foodItems, { ...newItem }]);
    setNewItem({
      category_id: '',
      name: '',
      quantity: '',
      unit: 'g',
    });
  };

  const handleRemoveItem = (index) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Ajouter un repas</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Date et heure"
              value={formData.datetime}
              onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText={formData.datetime ? formatDateTimeForDisplay(formData.datetime) : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type de repas</InputLabel>
              <Select
                value={formData.meal_type}
                label="Type de repas"
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
              >
                <MenuItem value="breakfast">Petit-déjeuner</MenuItem>
                <MenuItem value="lunch">Déjeuner</MenuItem>
                <MenuItem value="dinner">Dîner</MenuItem>
                <MenuItem value="snack">Collation</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      value={newItem.category_id}
                      label="Catégorie"
                      onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Nom (optionnel)"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantité"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Unité</InputLabel>
                    <Select
                      value={newItem.unit}
                      label="Unité"
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    >
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="ml">ml</MenuItem>
                      <MenuItem value="unité">unité</MenuItem>
                      <MenuItem value="tasse">tasse</MenuItem>
                      <MenuItem value="cuillère">cuillère</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button
                    variant="contained"
                    onClick={handleAddItem}
                    sx={{ height: '100%' }}
                  >
                    +
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {foodItems.map((item, index) => {
                const category = categories.find(c => c.id === item.category_id);
                return (
                  <Chip
                    key={index}
                    label={`${category?.name}: ${item.name} - ${item.quantity}${item.unit}`}
                    onDelete={() => handleRemoveItem(index)}
                    color={category?.is_trigger ? 'error' : 'default'}
                  />
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Annuler</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={foodItems.length === 0}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddFoodEntryForm;

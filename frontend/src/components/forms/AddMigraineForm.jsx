import { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  InputAdornment
} from '@mui/material';
import { addMigraine } from '../../api/apiService';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const INTENSITY_LEVELS = [
  { value: 1, label: 'Légère' },
  { value: 2, label: 'Modérée' },
  { value: 3, label: 'Sévère' },
  { value: 4, label: 'Très sévère' },
];

const COMMON_SYMPTOMS = [
  'Nausée',
  'Sensibilité à la lumière',
  'Sensibilité au bruit',
  'Aura visuelle',
  'Vertiges',
  'Fatigue',
  'Vomissements',
];

const formatDateTimeForInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const formatDateTimeForDisplay = (dateStr) => {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'dd MMMM yyyy HH:mm', { locale: fr });
};

const AddMigraineForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    start_time: formatDateTimeForInput(new Date()),
    end_time: '',
    intensity: 2,
    symptoms: [],
    medication: '',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      start_time: formData.start_time.replace('T', ' '),
      end_time: formData.end_time ? formData.end_time.replace('T', ' ') : null,
    };
    
    try {
      await addMigraine(data);
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Ajouter une migraine</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Début"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText={formData.start_time ? formatDateTimeForDisplay(formData.start_time) : ''}
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
            <TextField
              fullWidth
              type="datetime-local"
              label="Fin"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText={formData.end_time ? formatDateTimeForDisplay(formData.end_time) : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Intensité</InputLabel>
              <Select
                value={formData.intensity}
                label="Intensité"
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
              >
                {INTENSITY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <InputLabel sx={{ mb: 1 }}>Symptômes</InputLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COMMON_SYMPTOMS.map((symptom) => (
                <Chip
                  key={symptom}
                  label={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  color={formData.symptoms.includes(symptom) ? 'primary' : 'default'}
                  variant={formData.symptoms.includes(symptom) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Médicaments pris"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
            />
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
        <Button type="submit" variant="contained">
          Enregistrer
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddMigraineForm;

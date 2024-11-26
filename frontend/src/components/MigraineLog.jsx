import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  IconButton,
  Paper,
  Typography,
  Chip,
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { getMigraines, deleteMigraine } from '../api/apiService';
import AddMigraineForm from './forms/AddMigraineForm';

const MigraineLog = () => {
  const [migraines, setMigraines] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const loadMigraines = async () => {
    try {
      const response = await getMigraines();
      setMigraines(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des migraines:', error);
    }
  };

  useEffect(() => {
    loadMigraines();
  }, []);

  const handleAddMigraine = async () => {
    setOpenDialog(false);
    await loadMigraines();
  };

  const handleDeleteMigraine = async (migraineId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette migraine ?')) {
      try {
        await deleteMigraine(migraineId);
        await loadMigraines();
      } catch (error) {
        console.error('Erreur lors de la suppression de la migraine:', error);
      }
    }
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 8) return 'error';
    if (intensity >= 5) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Journal des migraines</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Ajouter une migraine
        </Button>
      </Box>

      {migraines.map((migraine) => (
        <Card key={migraine.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {format(new Date(migraine.start_time), 'PPPP', { locale: fr })}
                </Typography>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Intensité: {migraine.intensity}/10
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={migraine.intensity * 10}
                    color={getIntensityColor(migraine.intensity)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                {migraine.end_time && (
                  <Typography color="textSecondary" variant="body2">
                    Durée: {format(new Date(migraine.start_time), 'HH:mm')} - {format(new Date(migraine.end_time), 'HH:mm')}
                  </Typography>
                )}
                {migraine.symptoms && migraine.symptoms.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Symptômes:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {migraine.symptoms.map((symptom, index) => (
                        <Chip
                          key={index}
                          label={symptom}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {migraine.notes && (
                  <Typography sx={{ mt: 2 }} color="textSecondary">
                    Notes: {migraine.notes}
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={() => handleDeleteMigraine(migraine.id)}
                color="error"
                aria-label="supprimer"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <AddMigraineForm onSuccess={handleAddMigraine} onCancel={() => setOpenDialog(false)} />
      </Dialog>
    </Box>
  );
};

export default MigraineLog;

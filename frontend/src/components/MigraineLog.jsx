import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Box,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddMigraineForm from './forms/AddMigraineForm';
import { getMigraines, deleteMigraine } from '../api/apiService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  const handleAddSuccess = () => {
    setOpenDialog(false);
    loadMigraines();
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
    if (intensity >= 7) return 'error';
    if (intensity >= 4) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Journal des Migraines</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
            >
              Ajouter une migraine
            </Button>
          </Paper>
        </Grid>

        {migraines.map((migraine) => (
          <Grid item xs={12} key={migraine.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {format(new Date(migraine.start_time), 'PPP à HH:mm', { locale: fr })}
                    </Typography>
                    
                    <div style={{ marginTop: '16px' }}>
                      <Typography variant="body2" gutterBottom>
                        Intensité: {migraine.intensity}/10
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={migraine.intensity * 10}
                        color={getIntensityColor(migraine.intensity)}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </div>

                    {migraine.end_time && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Durée: {format(new Date(migraine.end_time), 'HH:mm', { locale: fr })}
                      </Typography>
                    )}

                    {migraine.symptoms && (
                      <div style={{ marginTop: '16px' }}>
                        <Typography variant="subtitle2">Symptômes:</Typography>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {migraine.symptoms.map((symptom, index) => (
                            <Chip
                              key={index}
                              label={symptom.trim()}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {migraine.triggers && (
                      <div style={{ marginTop: '16px' }}>
                        <Typography variant="subtitle2">Déclencheurs potentiels:</Typography>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {migraine.triggers.map((trigger, index) => (
                            <Chip
                              key={index}
                              label={trigger.trim()}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {migraine.medication && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Médicaments: {migraine.medication}
                      </Typography>
                    )}

                    {migraine.notes && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
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
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <AddMigraineForm onSuccess={handleAddSuccess} onCancel={() => setOpenDialog(false)} />
      </Dialog>
    </Container>
  );
};

export default MigraineLog;

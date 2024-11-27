import {
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { getFoodEntries, getMigraines } from '../api/apiService';
import FoodMigraineCorrelation from './FoodMigraineCorrelation';
import MigraineMonthlyChart from './MigraineMonthlyChart';

const Dashboard = () => {
  const [recentMigraines, setRecentMigraines] = useState([]);
  const [commonTriggers, setCommonTriggers] = useState([]);
  const [stats, setStats] = useState({
    totalMigraines: 0,
    averageIntensity: 0,
    commonSymptoms: [],
  });
  const [foodEntries, setFoodEntries] = useState([]);
  const [allMigraines, setAllMigraines] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [migrainesRes, entriesRes] = await Promise.all([
          getMigraines(),
          getFoodEntries(),
        ]);

        const migraines = migrainesRes.data;
        const entries = entriesRes.data;

        setFoodEntries(entries);
        setAllMigraines(migraines);

        // Calcul des statistiques
        const lastMonth = subDays(new Date(), 30);
        const recentMigraines = migraines.filter(m => 
          new Date(m.start_time) >= lastMonth
        );

        // Analyse des déclencheurs
        const triggerCount = {};
        recentMigraines.forEach(migraine => {
          if (migraine.triggers && migraine.triggers.length > 0) {
            migraine.triggers.forEach(trigger => {
              const t = trigger.trim();
              triggerCount[t] = (triggerCount[t] || 0) + 1;
            });
          }
        });

        const sortedTriggers = Object.entries(triggerCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        // Analyse des symptômes
        const symptomCount = {};
        recentMigraines.forEach(migraine => {
          if (migraine.symptoms && migraine.symptoms.length > 0) {
            migraine.symptoms.forEach(symptom => {
              const s = symptom.trim();
              symptomCount[s] = (symptomCount[s] || 0) + 1;
            });
          }
        });

        const sortedSymptoms = Object.entries(symptomCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        setRecentMigraines(recentMigraines.slice(0, 5));
        setCommonTriggers(sortedTriggers);
        setStats({
          totalMigraines: recentMigraines.length,
          averageIntensity: recentMigraines.length > 0 
            ? (recentMigraines.reduce((acc, m) => acc + m.intensity, 0) / recentMigraines.length).toFixed(1)
            : 0,
          commonSymptoms: sortedSymptoms,
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Tableau de bord
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MigraineMonthlyChart migraines={allMigraines} />
        </Grid>

        {/* Statistiques générales */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aperçu du dernier mois
            </Typography>
            <Typography variant="h3" component="div">
              {stats.totalMigraines}
            </Typography>
            <Typography color="textSecondary">
              migraines
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Intensité moyenne: {stats.averageIntensity}/10
            </Typography>
          </Paper>
        </Grid>

        {/* Déclencheurs communs */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Déclencheurs fréquents
            </Typography>
            {commonTriggers.map((trigger, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <Typography variant="body2">
                  {trigger.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(trigger.count / stats.totalMigraines) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </div>
            ))}
          </Paper>
        </Grid>

        {/* Symptômes communs */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Symptômes fréquents
            </Typography>
            {stats.commonSymptoms.map((symptom, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <Typography variant="body2">
                  {symptom.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(symptom.count / stats.totalMigraines) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </div>
            ))}
          </Paper>
        </Grid>

        {/* Graphique de corrélation */}
        <Grid item xs={12}>
          <FoodMigraineCorrelation migraines={recentMigraines} foodEntries={foodEntries} />
        </Grid>

        {/* Dernières migraines */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dernières migraines
            </Typography>
            <Grid container spacing={2}>
              {recentMigraines.map((migraine) => (
                <Grid item xs={12} sm={6} md={4} key={migraine.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">
                        {format(new Date(migraine.start_time), 'PPP', { locale: fr })}
                      </Typography>
                      <Typography color="textSecondary">
                        Intensité: {migraine.intensity}/10
                      </Typography>
                      {migraine.triggers && (
                        <Typography variant="body2" color="error">
                          Déclencheurs: {migraine.triggers.join(', ')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

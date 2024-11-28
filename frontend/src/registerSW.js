import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Une nouvelle version est disponible. Voulez-vous mettre à jour ?')) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log('L\'application est prête à fonctionner hors ligne')
  },
})

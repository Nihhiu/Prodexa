const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function removeSplashScreenTheme(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    if (manifest.manifest && manifest.manifest.application) {
      const application = manifest.manifest.application[0];
      
      if (application.activity) {
        application.activity.forEach((activity) => {
          if (activity.$['android:name'] === '.MainActivity') {
            // Remove o tema do SplashScreen e usa o tema padrão
            activity.$['android:theme'] = '@style/AppTheme';
          }
        });
      }
    }

    return config;
  });
};

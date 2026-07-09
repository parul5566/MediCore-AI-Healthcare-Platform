class AppConstants {
  // Base URL — uses 10.0.2.2 for Android emulator, replace with actual server URL for production
  static const String baseUrl = 'http://10.0.2.2:3000';
  static const String apiPrefix = '/api/mobile';
  
  // Animation durations
  static const int animDurationFast = 200;
  static const int animDurationNormal = 350;
  static const int animDurationSlow = 500;
  static const int animDurationPageTransition = 400;
  
  // UI constants
  static const double radiusSmall = 8;
  static const double radiusMedium = 16;
  static const double radiusLarge = 24;
  static const double paddingSmall = 8;
  static const double paddingMedium = 16;
  static const double paddingLarge = 24;
  
  // Health metric types
  static const List<String> metricTypes = [
    'HEART_RATE', 'BLOOD_PRESSURE', 'GLUCOSE', 'STEPS', 'SLEEP', 'WEIGHT', 'TEMPERATURE'
  ];
}

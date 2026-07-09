import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'services/api_service.dart';
import 'screens/auth/splash_screen.dart';
import 'screens/patient/patient_shell.dart';
import 'screens/doctor/doctor_shell.dart';
import 'screens/admin/admin_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MediCoreApp());
}

class MediCoreApp extends StatelessWidget {
  const MediCoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ApiService(),
      child: Consumer<ApiService>(
        builder: (context, auth, child) {
          return MaterialApp(
            title: 'MediCore AI Healthcare',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.system,
            home: const _AppEntryPoint(),
            routes: {
              '/patient': (context) => const PatientShell(),
              '/doctor': (context) => const DoctorShell(),
              '/admin': (context) => const AdminShell(),
            },
          );
        },
      ),
    );
  }
}

class _AppEntryPoint extends StatelessWidget {
  const _AppEntryPoint();

  @override
  Widget build(BuildContext context) {
    return Consumer<ApiService>(
      builder: (context, auth, child) {
        if (auth.isAuthenticated) {
          return _homeForRole(auth.user!);
        }
        return const SplashScreen();
      },
    );
  }

  Widget _homeForRole(UserModel user) {
    switch (user.role) {
      case 'PATIENT':
        return const PatientShell();
      case 'DOCTOR':
        return const DoctorShell();
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return const AdminShell();
      default:
        return const PatientShell();
    }
  }
}

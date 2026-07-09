import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/app_widgets.dart';
import '../../models/models.dart';
import '../auth/login_screen.dart';

class PatientProfile extends StatefulWidget {
  const PatientProfile({super.key});

  @override
  State<PatientProfile> createState() => _PatientProfileState();
}

class _PatientProfileState extends State<PatientProfile> {
  List<FamilyMemberModel> _familyMembers = [];
  List<HealthMetricModel> _metrics = [];
  bool _isLoadingFamily = true;
  bool _isLoadingMetrics = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final auth = context.read<ApiService>();
    try {
      final family = await auth.getFamilyMembers();
      if (mounted) setState(() { _familyMembers = family; _isLoadingFamily = false; });
    } catch (_) { if (mounted) setState(() => _isLoadingFamily = false); }
    try {
      final metrics = await auth.getHealthMetrics();
      if (mounted) setState(() { _metrics = metrics; _isLoadingMetrics = false; });
    } catch (_) { if (mounted) setState(() => _isLoadingMetrics = false); }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<ApiService>().user;
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile header
          GlassCard(
            gradient: AppTheme.primaryGradient,
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  width: 80, height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person, size: 44, color: Colors.white),
                ),
                const SizedBox(height: 12),
                Text(user?.fullName ?? 'User', style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white,
                )),
                const SizedBox(height: 4),
                Text(user?.email ?? '', style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.8),
                )),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(user?.role ?? 'PATIENT', style: const TextStyle(
                    color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600,
                  )),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Patient info
          if (user?.patient != null) ...[
            const Text('Health Information', style: TextStyle(
              fontSize: 18, fontWeight: FontWeight.bold,
            )),
            const SizedBox(height: 12),
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _infoRow('Blood Group', user!.patient!.bloodGroup ?? 'N/A', Icons.bloodtype),
                  _divider(),
                  _infoRow('Gender', user.patient!.gender ?? 'N/A', Icons.wc),
                  _divider(),
                  _infoRow('Date of Birth', user.patient!.dateOfBirth ?? 'N/A', Icons.cake),
                  _divider(),
                  _infoRow('Height', user.patient!.height != null ? '${user.patient!.height} cm' : 'N/A', Icons.height),
                  _divider(),
                  _infoRow('Weight', user.patient!.weight != null ? '${user.patient!.weight} kg' : 'N/A', Icons.monitor_weight),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
          // Family members
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Family Members', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.person_add, color: AppTheme.primary),
                onPressed: () => _showAddFamilySheet(),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_isLoadingFamily)
            const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
          else if (_familyMembers.isEmpty)
            const Text('No family members added', style: TextStyle(color: Colors.grey))
          else
            ..._familyMembers.map((m) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GlassCard(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppTheme.purple.withValues(alpha: 0.1),
                      child: const Icon(Icons.people, color: AppTheme.purple),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(m.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                          Text('${m.relationship} • ${m.bloodGroup ?? 'N/A'}',
                            style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            )),
          const SizedBox(height: 16),
          // Recent health metrics
          const Text('Recent Health Metrics', style: TextStyle(
            fontSize: 18, fontWeight: FontWeight.bold,
          )),
          const SizedBox(height: 8),
          if (_isLoadingMetrics)
            const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
          else if (_metrics.isEmpty)
            const Text('No metrics recorded', style: TextStyle(color: Colors.grey))
          else
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: _metrics.take(8).map((m) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Icon(_metricIcon(m.type), color: AppTheme.primary, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(m.type.replaceAll('_', ' ').toLowerCase(),
                          style: const TextStyle(fontSize: 14)),
                      ),
                      Text('${m.value} ${m.unit}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                )).toList(),
              ),
            ),
          const SizedBox(height: 24),
          // Logout
          GradientButton(
            label: 'Sign Out',
            icon: Icons.logout,
            gradient: LinearGradient(colors: [AppTheme.danger, AppTheme.danger.withValues(alpha: 0.8)]),
            onPressed: () async {
              await context.read<ApiService>().logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 14))),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _divider() => const Divider(height: 1);

  IconData _metricIcon(String type) {
    switch (type) {
      case 'HEART_RATE': return Icons.favorite;
      case 'BLOOD_PRESSURE': return Icons.monitor_heart;
      case 'GLUCOSE': return Icons.water_drop;
      case 'STEPS': return Icons.directions_walk;
      case 'SLEEP': return Icons.bedtime;
      case 'WEIGHT': return Icons.monitor_weight;
      case 'TEMPERATURE': return Icons.thermostat;
      default: return Icons.timeline;
    }
  }

  void _showAddFamilySheet() {
    final nameCtrl = TextEditingController();
    final relationCtrl = TextEditingController();
    String gender = 'Male';
    String bloodGroup = 'A+';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 24, right: 24, top: 24,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Add Family Member', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(labelText: 'Name', prefixIcon: Icon(Icons.person)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: relationCtrl,
                    decoration: const InputDecoration(labelText: 'Relationship', prefixIcon: Icon(Icons.family_restroom)),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: gender,
                          decoration: const InputDecoration(labelText: 'Gender'),
                          items: ['Male', 'Female', 'Other'].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                          onChanged: (v) => setSheetState(() => gender = v!),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: bloodGroup,
                          decoration: const InputDecoration(labelText: 'Blood'),
                          items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => DropdownMenuItem(value: b, child: Text(b))).toList(),
                          onChanged: (v) => setSheetState(() => bloodGroup = v!),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  GradientButton(
                    label: 'Add Member',
                    icon: Icons.check,
                    onPressed: () async {
                      if (nameCtrl.text.isEmpty || relationCtrl.text.isEmpty) return;
                      try {
                        await context.read<ApiService>().addFamilyMember({
                          'name': nameCtrl.text, 'relationship': relationCtrl.text,
                          'gender': gender, 'bloodGroup': bloodGroup,
                        });
                        if (context.mounted) {
                          Navigator.pop(context);
                          _loadData();
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.danger),
                          );
                        }
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

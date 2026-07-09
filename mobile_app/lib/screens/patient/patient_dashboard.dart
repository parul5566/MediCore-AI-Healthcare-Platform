import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/app_widgets.dart';

class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final auth = context.read<ApiService>();
      final data = await auth.getDashboard();
      setState(() { _dashboardData = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<ApiService>().user;
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 120,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                titlePadding: const EdgeInsets.only(left: 16, bottom: 14),
                title: Text('Hello, ${user?.firstName ?? "User"}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                background: Container(decoration: const BoxDecoration(gradient: AppTheme.primaryGradient)),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {},
                ),
              ],
            ),
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              SliverFillRemaining(
                child: Center(child: Text('Error: $_error')),
              )
            else ...[
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.1,
                  ),
                  delegate: SliverChildListDelegate([
                    StatCard(title: 'Upcoming Appts', value: '${_dashboardData?['stats']?['upcomingAppointments'] ?? 0}',
                      icon: Icons.calendar_today, gradient: AppTheme.primaryGradient),
                    StatCard(title: 'Available Doctors', value: '${_dashboardData?['stats']?['totalDoctors'] ?? 0}',
                      icon: Icons.medical_services, gradient: AppTheme.successGradient),
                    StatCard(title: 'Medical Records', value: '${_dashboardData?['stats']?['totalRecords'] ?? 0}',
                      icon: Icons.folder, gradient: AppTheme.accentGradient),
                    StatCard(title: 'Active Rx', value: '${_dashboardData?['stats']?['activePrescriptions'] ?? 0}',
                      icon: Icons.medication, gradient: AppTheme.warningGradient),
                  ]),
                ),
              ),
              // Upcoming appointments
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverToBoxAdapter(
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text('Upcoming Appointments', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            const Spacer(),
                            TextButton(onPressed: () {}, child: const Text('See All')),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if ((_dashboardData?['upcomingAppointments'] as List?)?.isEmpty ?? true)
                          const Text('No upcoming appointments', style: TextStyle(color: Colors.grey))
                        else
                          ...(_dashboardData!['upcomingAppointments'] as List).take(3).map((a) => _buildApptItem(a)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Recent health metrics
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverToBoxAdapter(
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Recent Health Metrics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        if ((_dashboardData?['recentMetrics'] as List?)?.isEmpty ?? true)
                          const Text('No metrics recorded', style: TextStyle(color: Colors.grey))
                        else
                          ...(_dashboardData!['recentMetrics'] as List).take(5).map((m) => _buildMetricItem(m)),
                      ],
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildApptItem(dynamic a) {
    final appt = a as Map<String, dynamic>;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.medical_services, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(appt['doctorName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text('${appt['time']} • ${appt['type']}', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              ],
            ),
          ),
          StatusBadge(status: appt['status'] ?? 'PENDING'),
        ],
      ),
    );
  }

  Widget _buildMetricItem(dynamic m) {
    final metric = m as Map<String, dynamic>;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(_metricIcon(metric['type']), color: AppTheme.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(metric['type'].toString().replaceAll('_', ' ').toLowerCase(),
              style: const TextStyle(fontSize: 14, textCapitalization: TextCapitalization.words)),
          ),
          Text('${metric['value']} ${metric['unit'] ?? ''}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }

  IconData _metricIcon(String? type) {
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
}

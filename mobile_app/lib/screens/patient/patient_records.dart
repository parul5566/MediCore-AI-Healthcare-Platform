import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/app_widgets.dart';

class PatientRecords extends StatefulWidget {
  const PatientRecords({super.key});

  @override
  State<PatientRecords> createState() => _PatientRecordsState();
}

class _PatientRecordsState extends State<PatientRecords>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<MedicalRecordModel> _records = [];
  List<PrescriptionModel> _prescriptions = [];
  List<LabReportModel> _labReports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final auth = context.read<ApiService>();
      final records = await auth.getMedicalRecords();
      final prescriptions = await auth.getPrescriptions();
      final labs = await auth.getLabReports();
      setState(() {
        _records = records;
        _prescriptions = prescriptions;
        _labReports = labs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Health Records'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          tabs: const [
            Tab(icon: Icon(Icons.folder), text: 'Records'),
            Tab(icon: Icon(Icons.medication), text: 'Rx'),
            Tab(icon: Icon(Icons.science), text: 'Labs'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildRecordsList(),
                _buildPrescriptionsList(),
                _buildLabReportsList(),
              ],
            ),
    );
  }

  Widget _buildRecordsList() {
    if (_records.isEmpty) {
      return const EmptyState(title: 'No Records', icon: Icons.folder_outlined);
    }
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _records.length,
        itemBuilder: (context, index) {
          final r = _records[index];
          return AnimatedListItem(
            index: index,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(_recordIcon(r.type), color: AppTheme.primary, size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text(r.doctorName, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                            ],
                          ),
                        ),
                        StatusBadge(status: r.type),
                      ],
                    ),
                    if (r.description != null && r.description!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(r.description!, style: TextStyle(color: Colors.grey[700], fontSize: 14)),
                    ],
                    const SizedBox(height: 8),
                    Text('${r.date.day}/${r.date.month}/${r.date.year}',
                      style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPrescriptionsList() {
    if (_prescriptions.isEmpty) {
      return const EmptyState(title: 'No Prescriptions', icon: Icons.medication_outlined);
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _prescriptions.length,
      itemBuilder: (context, index) {
        final p = _prescriptions[index];
        final meds = p.medications as List? ?? [];
        return AnimatedListItem(
          index: index,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.purple.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.medication, color: AppTheme.purple, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Prescription #${index + 1}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(p.doctorName, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                          ],
                        ),
                      ),
                      StatusBadge(status: p.status),
                    ],
                  ),
                  const Divider(height: 20),
                  if (meds.isNotEmpty) ...[
                    ...meds.map((m) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.circle, size: 8, color: AppTheme.purple),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              m is Map
                                ? '${m['name'] ?? ''} — ${m['dosage'] ?? ''} ${m['frequency'] ?? ''}'
                                : m.toString(),
                              style: const TextStyle(fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                    )),
                  ],
                  if (p.notes != null && p.notes!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text('Notes: ${p.notes}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                  ],
                  const SizedBox(height: 8),
                  Text('${p.date.day}/${p.date.month}/${p.date.year}',
                    style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLabReportsList() {
    if (_labReports.isEmpty) {
      return const EmptyState(title: 'No Lab Reports', icon: Icons.science_outlined);
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _labReports.length,
      itemBuilder: (context, index) {
        final r = _labReports[index];
        return AnimatedListItem(
          index: index,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.accent.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.science, color: AppTheme.accent, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(r.testName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(r.category, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                          ],
                        ),
                      ),
                      StatusBadge(status: r.status),
                    ],
                  ),
                  if (r.summary != null && r.summary!.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(r.summary!, style: TextStyle(color: Colors.grey[700], fontSize: 14)),
                  ],
                  const SizedBox(height: 8),
                  Text('${r.date.day}/${r.date.month}/${r.date.year}',
                    style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  IconData _recordIcon(String type) {
    switch (type) {
      case 'ALLERGY': return Icons.warning;
      case 'VACCINATION': return Icons.vaccines;
      case 'MEDICATION': return Icons.medication;
      case 'PROCEDURE': return Icons.medical_information;
      case 'IMAGING': return Icons.image;
      default: return Icons.note;
    }
  }
}

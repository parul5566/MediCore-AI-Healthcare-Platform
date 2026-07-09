import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/models.dart';

class ApiService extends ChangeNotifier {
  String? _token;
  UserModel? _user;
  bool _isLoading = false;
  String? _error;

  String? get token => _token;
  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;

  static const _tokenKey = 'medicore_token';
  static const _userKey = 'medicore_user';

  ApiService() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      try {
        _user = UserModel.fromJson(jsonDecode(userJson));
      } catch (e) {
        debugPrint('Failed to load session: $e');
      }
    }
    notifyListeners();
  }

  Future<void> _saveSession(String token, UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
    _token = token;
    _user = user;
    notifyListeners();
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    _token = null;
    _user = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    _error = null;
    notifyListeners();
  }

  Uri _buildUri(String endpoint) {
    return Uri.parse('${AppConstants.baseUrl}${AppConstants.apiPrefix}$endpoint');
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<Map<String, dynamic>> _request(
    String endpoint, {
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    try {
      final uri = _buildUri(endpoint);
      http.Response response;

      if (method == 'GET') {
        response = await http.get(uri, headers: _headers);
      } else if (method == 'PATCH') {
        response = await http.patch(uri, headers: _headers,
          body: body != null ? jsonEncode(body) : null);
      } else {
        response = await http.post(uri, headers: _headers,
          body: body != null ? jsonEncode(body) : null);
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode >= 400) {
        throw ApiException(data['message'] ?? 'Request failed');
      }
      return data;
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Network error: $e');
    }
  }

  // ─── AUTH ────────────────────────────────────────────────────

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    try {
      final data = await _request('/auth/login', method: 'POST', body: {
        'email': email, 'password': password,
      });
      if (data['success'] == true) {
        await _saveSession(data['token'], UserModel.fromJson(data['user']));
        return true;
      }
      return false;
    } on ApiException catch (e) {
      _error = e.message;
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    _setLoading(true);
    try {
      final data = await _request('/auth/register', method: 'POST', body: userData);
      if (data['success'] == true) {
        await _saveSession(data['token'], UserModel.fromJson(data['user']));
        return true;
      }
      return false;
    } on ApiException catch (e) {
      _error = e.message;
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    await clearSession();
  }

  Future<UserModel?> refreshUser() async {
    try {
      final data = await _request('/auth/me');
      if (data['success'] == true) {
        _user = UserModel.fromJson(data['user']);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_userKey, jsonEncode(_user!.toJson()));
        notifyListeners();
        return _user;
      }
    } catch (e) {
      debugPrint('Refresh user error: $e');
    }
    return null;
  }

  // ─── DASHBOARD ───────────────────────────────────────────────

  Future<Map<String, dynamic>> getDashboard() async => _request('/dashboard');

  // ─── DOCTORS ─────────────────────────────────────────────────

  Future<List<DoctorModel>> getDoctors({String? specialization, String? search}) async {
    String endpoint = '/doctors';
    final params = <String>[];
    if (specialization != null) params.add('specialization=$specialization');
    if (search != null) params.add('search=$search');
    if (params.isNotEmpty) endpoint += '?${params.join('&')}';
    final data = await _request(endpoint);
    return (data['doctors'] as List).map((d) => DoctorModel.fromJson(d)).toList();
  }

  // ─── APPOINTMENTS ────────────────────────────────────────────

  Future<List<AppointmentModel>> getAppointments() async {
    final data = await _request('/appointments');
    return (data['appointments'] as List).map((a) => AppointmentModel.fromJson(a)).toList();
  }

  Future<AppointmentModel> createAppointment({
    required String doctorId,
    required String date,
    required String time,
    String type = 'IN_PERSON',
    String? reason,
    String? symptoms,
  }) async {
    final data = await _request('/appointments', method: 'POST', body: {
      'doctorId': doctorId, 'date': date, 'time': time,
      'type': type, 'reason': reason, 'symptoms': symptoms,
    });
    return AppointmentModel.fromJson(data['appointment']);
  }

  Future<void> updateAppointmentStatus(String id, String status) async {
    await _request('/appointments/$id', method: 'PATCH', body: {'status': status});
  }

  // ─── MEDICAL RECORDS ─────────────────────────────────────────

  Future<List<MedicalRecordModel>> getMedicalRecords({String? patientId}) async {
    String endpoint = '/medical-records';
    if (patientId != null) endpoint += '?patientId=$patientId';
    final data = await _request(endpoint);
    return (data['records'] as List).map((r) => MedicalRecordModel.fromJson(r)).toList();
  }

  // ─── PRESCRIPTIONS ───────────────────────────────────────────

  Future<List<PrescriptionModel>> getPrescriptions({String? patientId}) async {
    String endpoint = '/prescriptions';
    if (patientId != null) endpoint += '?patientId=$patientId';
    final data = await _request(endpoint);
    return (data['prescriptions'] as List).map((p) => PrescriptionModel.fromJson(p)).toList();
  }

  // ─── LAB REPORTS ─────────────────────────────────────────────

  Future<List<LabReportModel>> getLabReports({String? patientId}) async {
    String endpoint = '/lab-reports';
    if (patientId != null) endpoint += '?patientId=$patientId';
    final data = await _request(endpoint);
    return (data['reports'] as List).map((r) => LabReportModel.fromJson(r)).toList();
  }

  // ─── FAMILY MEMBERS ──────────────────────────────────────────

  Future<List<FamilyMemberModel>> getFamilyMembers() async {
    final data = await _request('/family-members');
    return (data['members'] as List).map((m) => FamilyMemberModel.fromJson(m)).toList();
  }

  Future<void> addFamilyMember(Map<String, dynamic> member) async {
    await _request('/family-members', method: 'POST', body: member);
  }

  // ─── HEALTH METRICS ──────────────────────────────────────────

  Future<List<HealthMetricModel>> getHealthMetrics({String? type}) async {
    String endpoint = '/health-metrics';
    if (type != null) endpoint += '?type=$type';
    final data = await _request(endpoint);
    return (data['metrics'] as List).map((m) => HealthMetricModel.fromJson(m)).toList();
  }

  Future<void> addHealthMetric(Map<String, dynamic> metric) async {
    await _request('/health-metrics', method: 'POST', body: metric);
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────────

  Future<List<NotificationModel>> getNotifications() async {
    final data = await _request('/notifications');
    return (data['notifications'] as List).map((n) => NotificationModel.fromJson(n)).toList();
  }

  Future<int> getUnreadCount() async {
    final data = await _request('/notifications');
    return data['unreadCount'] as int? ?? 0;
  }

  Future<void> markNotificationsRead() async {
    await _request('/notifications', method: 'PATCH');
  }

  // ─── MESSAGES ────────────────────────────────────────────────

  Future<List<ConversationModel>> getConversations() async {
    final data = await _request('/messages');
    return (data['conversations'] as List).map((c) => ConversationModel.fromJson(c)).toList();
  }

  Future<List<MessageModel>> getMessages(String otherUserId) async {
    final data = await _request('/messages?userId=$otherUserId');
    return (data['messages'] as List).map((m) => MessageModel.fromJson(m)).toList();
  }

  Future<void> sendMessage(String receiverId, String content) async {
    await _request('/messages', method: 'POST', body: {
      'receiverId': receiverId, 'content': content,
    });
  }

  // ─── AI CHAT ─────────────────────────────────────────────────

  Future<String> sendAiMessage(String message, List<ChatMessage> history) async {
    final data = await _request('/ai/chat', method: 'POST', body: {
      'message': message,
      'history': history.map((h) => h.toHistoryJson()).toList(),
    });
    return data['reply'] ?? 'No response';
  }

  // ─── ADMIN ───────────────────────────────────────────────────

  Future<List<UserModel>> getAdminUsers({String? role, String? search}) async {
    String endpoint = '/admin/users';
    final params = <String>[];
    if (role != null) params.add('role=$role');
    if (search != null) params.add('search=$search');
    if (params.isNotEmpty) endpoint += '?${params.join('&')}';
    final data = await _request(endpoint);
    return (data['users'] as List).map((u) => UserModel.fromJson(u)).toList();
  }

  Future<void> updateUserStatus(String userId, String status) async {
    await _request('/admin/users', method: 'PATCH', body: {
      'userId': userId, 'status': status,
    });
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}

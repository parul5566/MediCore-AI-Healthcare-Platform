class UserModel {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final String role;
  final String? patientId;
  final String? doctorId;
  final bool? doctorVerified;
  final PatientProfile? patient;
  final DoctorProfile? doctor;

  UserModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    required this.role,
    this.patientId,
    this.doctorId,
    this.doctorVerified,
    this.patient,
    this.doctor,
  });

  String get fullName => '$firstName $lastName';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'PATIENT',
      patientId: json['patientId'],
      doctorId: json['doctorId'],
      doctorVerified: json['doctorVerified'],
      patient: json['patient'] != null ? PatientProfile.fromJson(json['patient']) : null,
      doctor: json['doctor'] != null ? DoctorProfile.fromJson(json['doctor']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'firstName': firstName, 'lastName': lastName, 'email': email,
    'phone': phone, 'role': role, 'patientId': patientId, 'doctorId': doctorId,
    'patient': patient?.toJson(), 'doctor': doctor?.toJson(),
  };
}

class PatientProfile {
  final String? dateOfBirth;
  final String? gender;
  final String? bloodGroup;
  final double? height;
  final double? weight;

  PatientProfile({this.dateOfBirth, this.gender, this.bloodGroup, this.height, this.weight});

  factory PatientProfile.fromJson(Map<String, dynamic> json) => PatientProfile(
    dateOfBirth: json['dateOfBirth']?.toString(),
    gender: json['gender'],
    bloodGroup: json['bloodGroup'],
    height: json['height'] != null ? (json['height'] as num).toDouble() : null,
    weight: json['weight'] != null ? (json['weight'] as num).toDouble() : null,
  );

  Map<String, dynamic> toJson() => {
    'dateOfBirth': dateOfBirth, 'gender': gender, 'bloodGroup': bloodGroup,
    'height': height, 'weight': weight,
  };
}

class DoctorProfile {
  final String? specialization;
  final String? licenseNumber;
  final int? experience;
  final double? consultationFee;
  final double? rating;
  final bool? verified;
  final String? bio;
  final String? qualification;

  DoctorProfile({
    this.specialization, this.licenseNumber, this.experience,
    this.consultationFee, this.rating, this.verified, this.bio, this.qualification,
  });

  factory DoctorProfile.fromJson(Map<String, dynamic> json) => DoctorProfile(
    specialization: json['specialization'],
    licenseNumber: json['licenseNumber'],
    experience: json['experience'] != null ? (json['experience'] as num).toInt() : null,
    consultationFee: json['consultationFee'] != null ? (json['consultationFee'] as num).toDouble() : null,
    rating: json['rating'] != null ? (json['rating'] as num).toDouble() : null,
    verified: json['verified'],
    bio: json['bio'],
    qualification: json['qualification'],
  );

  Map<String, dynamic> toJson() => {
    'specialization': specialization, 'licenseNumber': licenseNumber,
    'experience': experience, 'consultationFee': consultationFee,
    'rating': rating, 'verified': verified, 'bio': bio, 'qualification': qualification,
  };
}

class DoctorModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String specialization;
  final String? qualification;
  final int experience;
  final double consultationFee;
  final double rating;
  final int reviewCount;
  final bool verified;
  final String? bio;

  DoctorModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    required this.specialization,
    this.qualification,
    required this.experience,
    required this.consultationFee,
    required this.rating,
    required this.reviewCount,
    required this.verified,
    this.bio,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) => DoctorModel(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    email: json['email'],
    phone: json['phone'],
    specialization: json['specialization'] ?? '',
    qualification: json['qualification'],
    experience: json['experience'] != null ? (json['experience'] as num).toInt() : 0,
    consultationFee: json['consultationFee'] != null ? (json['consultationFee'] as num).toDouble() : 0,
    rating: json['rating'] != null ? (json['rating'] as num).toDouble() : 0,
    reviewCount: json['reviewCount'] != null ? (json['reviewCount'] as num).toInt() : 0,
    verified: json['verified'] ?? false,
    bio: json['bio'],
  );
}

class AppointmentModel {
  final String id;
  final String? patientId;
  final String? doctorId;
  final DateTime date;
  final String time;
  final int duration;
  final String status;
  final String type;
  final String? reason;
  final String? symptoms;
  final String? notes;
  final String? diagnosis;
  final String? doctorName;
  final String? doctorEmail;
  final String? patientName;

  AppointmentModel({
    required this.id,
    this.patientId,
    this.doctorId,
    required this.date,
    required this.time,
    this.duration = 30,
    required this.status,
    required this.type,
    this.reason,
    this.symptoms,
    this.notes,
    this.diagnosis,
    this.doctorName,
    this.doctorEmail,
    this.patientName,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) => AppointmentModel(
    id: json['id'] ?? '',
    patientId: json['patientId'],
    doctorId: json['doctorId'],
    date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
    time: json['time'] ?? '',
    duration: json['duration'] != null ? (json['duration'] as num).toInt() : 30,
    status: json['status'] ?? 'PENDING',
    type: json['type'] ?? 'IN_PERSON',
    reason: json['reason'],
    symptoms: json['symptoms'],
    notes: json['notes'],
    diagnosis: json['diagnosis'],
    doctorName: json['doctorName'],
    doctorEmail: json['doctorEmail'],
    patientName: json['patientName'],
  );
}

class MedicalRecordModel {
  final String id;
  final String title;
  final String? description;
  final String type;
  final String? severity;
  final DateTime date;
  final String doctorName;

  MedicalRecordModel({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    this.severity,
    required this.date,
    required this.doctorName,
  });

  factory MedicalRecordModel.fromJson(Map<String, dynamic> json) => MedicalRecordModel(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    description: json['description'],
    type: json['type'] ?? '',
    severity: json['severity'],
    date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
    doctorName: json['doctorName'] ?? 'Unknown',
  );
}

class PrescriptionModel {
  final String id;
  final dynamic medications;
  final String? notes;
  final String status;
  final DateTime date;
  final String doctorName;

  PrescriptionModel({
    required this.id,
    required this.medications,
    this.notes,
    required this.status,
    required this.date,
    required this.doctorName,
  });

  factory PrescriptionModel.fromJson(Map<String, dynamic> json) => PrescriptionModel(
    id: json['id'] ?? '',
    medications: json['medications'],
    notes: json['notes'],
    status: json['status'] ?? 'ACTIVE',
    date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
    doctorName: json['doctorName'] ?? 'Unknown',
  );
}

class LabReportModel {
  final String id;
  final String testName;
  final String category;
  final dynamic results;
  final String? summary;
  final String status;
  final DateTime date;

  LabReportModel({
    required this.id,
    required this.testName,
    this.category = 'GENERAL',
    this.results,
    this.summary,
    required this.status,
    required this.date,
  });

  factory LabReportModel.fromJson(Map<String, dynamic> json) => LabReportModel(
    id: json['id'] ?? '',
    testName: json['testName'] ?? '',
    category: json['category'] ?? 'GENERAL',
    results: json['results'],
    summary: json['summary'],
    status: json['status'] ?? 'PENDING',
    date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
  );
}

class FamilyMemberModel {
  final String id;
  final String name;
  final String relationship;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? bloodGroup;
  final String? phone;

  FamilyMemberModel({
    required this.id,
    required this.name,
    required this.relationship,
    this.dateOfBirth,
    this.gender,
    this.bloodGroup,
    this.phone,
  });

  factory FamilyMemberModel.fromJson(Map<String, dynamic> json) => FamilyMemberModel(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    relationship: json['relationship'] ?? '',
    dateOfBirth: json['dateOfBirth'] != null ? DateTime.tryParse(json['dateOfBirth'].toString()) : null,
    gender: json['gender'],
    bloodGroup: json['bloodGroup'],
    phone: json['phone'],
  );
}

class HealthMetricModel {
  final String id;
  final String type;
  final double value;
  final double? secondaryValue;
  final String unit;
  final DateTime date;

  HealthMetricModel({
    required this.id,
    required this.type,
    required this.value,
    this.secondaryValue,
    required this.unit,
    required this.date,
  });

  factory HealthMetricModel.fromJson(Map<String, dynamic> json) => HealthMetricModel(
    id: json['id'] ?? '',
    type: json['type'] ?? '',
    value: json['value'] != null ? (json['value'] as num).toDouble() : 0,
    secondaryValue: json['secondaryValue'] != null ? (json['secondaryValue'] as num).toDouble() : null,
    unit: json['unit'] ?? '',
    date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
  );
}

class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type;
  final bool read;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    this.type = 'INFO',
    this.read = false,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    message: json['message'] ?? '',
    type: json['type'] ?? 'INFO',
    read: json['read'] ?? false,
    createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
  );
}

class MessageModel {
  final String id;
  final String senderId;
  final String receiverId;
  final String content;
  final bool read;
  final DateTime createdAt;

  MessageModel({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.content,
    this.read = false,
    required this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) => MessageModel(
    id: json['id'] ?? '',
    senderId: json['senderId'] ?? '',
    receiverId: json['receiverId'] ?? '',
    content: json['content'] ?? '',
    read: json['read'] ?? false,
    createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
  );
}

class ConversationModel {
  final String userId;
  final String name;
  final String lastMessage;
  final DateTime lastMessageAt;

  ConversationModel({
    required this.userId,
    required this.name,
    required this.lastMessage,
    required this.lastMessageAt,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) => ConversationModel(
    userId: json['userId'] ?? '',
    name: json['name'] ?? '',
    lastMessage: json['lastMessage'] ?? '',
    lastMessageAt: json['lastMessageAt'] != null ? DateTime.parse(json['lastMessageAt']) : DateTime.now(),
  );
}

class ChatMessage {
  final String role;
  final String content;
  final DateTime timestamp;

  ChatMessage({required this.role, required this.content, DateTime? timestamp})
      : timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toHistoryJson() => {'role': role, 'content': content};
}

CREATE DATABASE IF NOT EXISTS university_events_db;
USE university_events_db;

CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'LECTURER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  event_id INT PRIMARY KEY AUTO_INCREMENT,
  create_by INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  max_participants INT NOT NULL,
  approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  event_status ENUM('OPEN', 'FULL', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_create_by FOREIGN KEY (create_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS registrations (
  reg_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  register_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('REGISTERED', 'CANCELLED', 'WAITLISTED') NOT NULL DEFAULT 'REGISTERED',
  check_in_time DATETIME NULL,
  check_status BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uq_registration_user_event (user_id, event_id),
  CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE IF NOT EXISTS approvals (
  approval_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  approved_by INT NOT NULL,
  status ENUM('APPROVED', 'REJECTED') NOT NULL,
  remark TEXT,
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_approvals_event FOREIGN KEY (event_id) REFERENCES events(event_id),
  CONSTRAINT fk_approvals_user FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  rating INT NOT NULL,
  comment_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_feedback_event FOREIGN KEY (event_id) REFERENCES events(event_id),
  CONSTRAINT chk_feedback_rating CHECK (rating >= 1 AND rating <= 5),
  UNIQUE KEY uq_feedback_user_event (user_id, event_id)
);

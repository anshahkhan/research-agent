-- 🟢 Root Persona
CREATE TABLE Personas (
    persona_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(50),
    nationality VARCHAR(100),
    marital_status VARCHAR(50),
    phone_number VARCHAR(50),
    email VARCHAR(255)
);

-- 🟢 Social Media Handles
CREATE TABLE SocialMediaHandles (
    handle_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    platform VARCHAR(100),
    url_or_username TEXT
);

-- 🟢 Address
CREATE TABLE Addresses (
    address_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postcode VARCHAR(20)
);

-- 🟢 Languages
CREATE TABLE LanguagesSpoken (
    lang_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    language VARCHAR(100)
);

-- 🟢 Hobbies
CREATE TABLE Hobbies (
    hobby_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    hobby VARCHAR(100)
);

-- 🟢 Professional Details (1-to-1)
CREATE TABLE ProfessionalDetails (
    prof_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    current_job_title VARCHAR(255),
    current_employer VARCHAR(255),
    experience_in_current_company VARCHAR(100),
    salary VARCHAR(100),
    years_of_experience INT
);

-- 🟢 Work Experience (1-to-many)
CREATE TABLE WorkExperience (
    exp_id SERIAL PRIMARY KEY,
    prof_id INT REFERENCES ProfessionalDetails(prof_id) ON DELETE CASCADE,
    job_title VARCHAR(255),
    company VARCHAR(255),
    start_date DATE,
    end_date DATE
);

-- 🟢 Education
CREATE TABLE Education (
    edu_id SERIAL PRIMARY KEY,
    prof_id INT REFERENCES ProfessionalDetails(prof_id) ON DELETE CASCADE,
    degree VARCHAR(255),
    institution VARCHAR(255),
    start_date DATE,
    end_date DATE
);

-- 🟢 Skills
CREATE TABLE Skills (
    skill_id SERIAL PRIMARY KEY,
    prof_id INT REFERENCES ProfessionalDetails(prof_id) ON DELETE CASCADE,
    skill VARCHAR(100)
);

-- 🟢 Achievements
CREATE TABLE ProfessionalAchievements (
    ach_id SERIAL PRIMARY KEY,
    prof_id INT REFERENCES ProfessionalDetails(prof_id) ON DELETE CASCADE,
    achievement TEXT
);

-- 🟢 Awards
CREATE TABLE AwardsAndCertifications (
    award_id SERIAL PRIMARY KEY,
    prof_id INT REFERENCES ProfessionalDetails(prof_id) ON DELETE CASCADE,
    award_name VARCHAR(255)
);

-- 🟢 Projects
CREATE TABLE ProjectsLed (
    project_id SERIAL PRIMARY KEY,
    prof_id INT REFERENCES ProfessionalDetails(prof_id) ON DELETE CASCADE,
    project_name TEXT
);

-- 🟢 Job Preferences
CREATE TABLE JobPreferences (
    pref_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    preferred_work_location VARCHAR(100),
    work_location_flexibility VARCHAR(50),
    preferred_company_size VARCHAR(100),
    willing_to_relocate VARCHAR(10),
    max_commuting_time VARCHAR(50),
    work_schedule_preference VARCHAR(100)
);

-- Preferred Industries
CREATE TABLE PreferredIndustries (
    industry_id SERIAL PRIMARY KEY,
    pref_id INT REFERENCES JobPreferences(pref_id) ON DELETE CASCADE,
    industry VARCHAR(100)
);

-- Preferred Job Types
CREATE TABLE PreferredJobTypes (
    jobtype_id SERIAL PRIMARY KEY,
    pref_id INT REFERENCES JobPreferences(pref_id) ON DELETE CASCADE,
    job_type VARCHAR(100)
);

-- 🟢 Salary Expectations
CREATE TABLE SalaryExpectations (
    salary_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    min_salary VARCHAR(100),
    expected_salary VARCHAR(100),
    max_salary VARCHAR(100),
    salary_negotiable VARCHAR(10),
    benefits_importance VARCHAR(50)
);

CREATE TABLE PreferredBenefits (
    benefit_id SERIAL PRIMARY KEY,
    salary_id INT REFERENCES SalaryExpectations(salary_id) ON DELETE CASCADE,
    benefit VARCHAR(100)
);

-- 🟢 Career Preferences
CREATE TABLE CareerPreferences (
    career_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    career_stage VARCHAR(100),
    leadership_interest VARCHAR(50),
    preferred_team_size VARCHAR(100),
    growth_aspiration VARCHAR(100)
);

CREATE TABLE LearningPreferences (
    learning_id SERIAL PRIMARY KEY,
    career_id INT REFERENCES CareerPreferences(career_id) ON DELETE CASCADE,
    learning_type VARCHAR(100)
);

-- 🟢 Work Environment Preferences
CREATE TABLE WorkEnvironmentPreferences (
    env_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    work_life_balance VARCHAR(100),
    travel_requirement VARCHAR(100),
    meeting_preference VARCHAR(100)
);

CREATE TABLE CompanyCulture (
    culture_id SERIAL PRIMARY KEY,
    env_id INT REFERENCES WorkEnvironmentPreferences(env_id) ON DELETE CASCADE,
    culture VARCHAR(100)
);

CREATE TABLE CommunicationStyle (
    comm_id SERIAL PRIMARY KEY,
    env_id INT REFERENCES WorkEnvironmentPreferences(env_id) ON DELETE CASCADE,
    style VARCHAR(100)
);

-- 🟢 Personal Preferences
CREATE TABLE PersonalPreferences (
    perspref_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE
);

CREATE TABLE LifestylePreferences (
    lifestyle_id SERIAL PRIMARY KEY,
    perspref_id INT REFERENCES PersonalPreferences(perspref_id) ON DELETE CASCADE,
    preference VARCHAR(100)
);

CREATE TABLE FamilyConsiderations (
    family_id SERIAL PRIMARY KEY,
    perspref_id INT REFERENCES PersonalPreferences(perspref_id) ON DELETE CASCADE,
    consideration VARCHAR(100)
);

CREATE TABLE HealthAndWellness (
    health_id SERIAL PRIMARY KEY,
    perspref_id INT REFERENCES PersonalPreferences(perspref_id) ON DELETE CASCADE,
    wellness VARCHAR(100)
);

CREATE TABLE FinancialGoals (
    goal_id SERIAL PRIMARY KEY,
    perspref_id INT REFERENCES PersonalPreferences(perspref_id) ON DELETE CASCADE,
    goal VARCHAR(100)
);

CREATE TABLE SocialPreferences (
    social_id SERIAL PRIMARY KEY,
    perspref_id INT REFERENCES PersonalPreferences(perspref_id) ON DELETE CASCADE,
    preference VARCHAR(100)
);

-- 🟢 Important Milestones
CREATE TABLE ImportantMilestones (
    milestone_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE,
    milestone TEXT,
    milestone_date DATE,
    significance TEXT
);

-- 🟢 Goals
CREATE TABLE Goals (
    goalset_id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES Personas(persona_id) ON DELETE CASCADE
);

CREATE TABLE ShortTermGoals (
    short_id SERIAL PRIMARY KEY,
    goalset_id INT REFERENCES Goals(goalset_id) ON DELETE CASCADE,
    goal TEXT
);

CREATE TABLE LongTermGoals (
    long_id SERIAL PRIMARY KEY,
    goalset_id INT REFERENCES Goals(goalset_id) ON DELETE CASCADE,
    goal TEXT
);

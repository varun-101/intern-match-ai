import { users, students, employers, internships, applications, aiMatches, type User, type Student, type Employer, type Internship, type Application, type InsertUser, type InsertStudent, type InsertEmployer, type InsertInternship, type InsertApplication, type UserWithProfile, type InternshipWithEmployer, type ApplicationWithDetails } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<UserWithProfile | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  
  // Student operations
  getStudent(userId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(userId: string, updates: Partial<InsertStudent>): Promise<Student>;
  
  // Employer operations
  getEmployer(userId: string): Promise<Employer | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;
  updateEmployer(userId: string, updates: Partial<InsertEmployer>): Promise<Employer>;
  
  // Internship operations
  createInternship(internship: InsertInternship): Promise<Internship>;
  getInternships(filters?: { status?: string; employerId?: string }): Promise<InternshipWithEmployer[]>;
  getInternship(id: string): Promise<InternshipWithEmployer | undefined>;
  updateInternship(id: string, updates: Partial<InsertInternship>): Promise<Internship>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(filters?: { studentId?: string; internshipId?: string; status?: string }): Promise<ApplicationWithDetails[]>;
  updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application>;
  
  // AI matching operations
  getRecommendedInternships(studentId: string, limit?: number): Promise<(InternshipWithEmployer & { matchScore: number; matchReasons: string[] })[]>;
  getRecommendedCandidates(internshipId: string, limit?: number): Promise<(Student & { matchScore: number; matchReasons: string[] })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<UserWithProfile | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    ) as UserWithProfile;
  }

  // Placeholder implementations for remaining methods
  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getStudent(userId: string): Promise<Student | undefined> {
    return undefined; // Placeholder
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    throw new Error('Not implemented in memory storage');
  }

  async updateStudent(userId: string, updates: Partial<InsertStudent>): Promise<Student> {
    throw new Error('Not implemented in memory storage');
  }

  async getEmployer(userId: string): Promise<Employer | undefined> {
    return undefined; // Placeholder
  }

  async createEmployer(employer: InsertEmployer): Promise<Employer> {
    throw new Error('Not implemented in memory storage');
  }

  async updateEmployer(userId: string, updates: Partial<InsertEmployer>): Promise<Employer> {
    throw new Error('Not implemented in memory storage');
  }

  async createInternship(internship: InsertInternship): Promise<Internship> {
    throw new Error('Not implemented in memory storage');
  }

  async getInternships(filters?: { status?: string; employerId?: string }): Promise<InternshipWithEmployer[]> {
    return [];
  }

  async getInternship(id: string): Promise<InternshipWithEmployer | undefined> {
    return undefined;
  }

  async updateInternship(id: string, updates: Partial<InsertInternship>): Promise<Internship> {
    throw new Error('Not implemented in memory storage');
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    throw new Error('Not implemented in memory storage');
  }

  async getApplications(filters?: { studentId?: string; internshipId?: string; status?: string }): Promise<ApplicationWithDetails[]> {
    return [];
  }

  async updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application> {
    throw new Error('Not implemented in memory storage');
  }

  async getRecommendedInternships(studentId: string, limit?: number): Promise<(InternshipWithEmployer & { matchScore: number; matchReasons: string[] })[]> {
    return [];
  }

  async getRecommendedCandidates(internshipId: string, limit?: number): Promise<(Student & { matchScore: number; matchReasons: string[] })[]> {
    return [];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<UserWithProfile | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return undefined;

    let profile = {};
    if (user.role === 'student') {
      const [student] = await db.select().from(students).where(eq(students.userId, user.id));
      profile = { student };
    } else if (user.role === 'employer') {
      const [employer] = await db.select().from(employers).where(eq(employers.userId, user.id));
      profile = { employer };
    }

    return { ...user, ...profile };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Student operations
  async getStudent(userId: string): Promise<Student | undefined> {
    console.log("getStudent", {userId});
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    console.log("getStudent after query", {student});
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(userId: string, updates: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db.update(students).set(updates).where(eq(students.userId, userId)).returning();
    return student;
  }

  // Employer operations
  async getEmployer(userId: string): Promise<Employer | undefined> {
    const [employer] = await db.select().from(employers).where(eq(employers.userId, userId));
    return employer;
  }

  async createEmployer(employer: InsertEmployer): Promise<Employer> {
    const [newEmployer] = await db.insert(employers).values(employer).returning();
    return newEmployer;
  }

  async updateEmployer(userId: string, updates: Partial<InsertEmployer>): Promise<Employer> {
    const [employer] = await db.update(employers).set(updates).where(eq(employers.userId, userId)).returning();
    return employer;
  }

  // Internship operations
  async createInternship(internship: InsertInternship): Promise<Internship> {
    const [newInternship] = await db.insert(internships).values(internship).returning();
    return newInternship;
  }

  async getInternships(filters?: { status?: string; employerId?: string }): Promise<InternshipWithEmployer[]> {
    const query = db.select().from(internships).leftJoin(employers, eq(internships.employerId, employers.id));
    
    if (filters?.status) {
      query.where(eq(internships.status, filters.status));
    }
    if (filters?.employerId) {
      query.where(eq(internships.employerId, filters.employerId));
    }

    const results = await query;
    return results.map(row => ({
      ...row.internships,
      employer: row.employers!
    }));
  }

  async getInternship(id: string): Promise<InternshipWithEmployer | undefined> {
    const [result] = await db.select()
      .from(internships)
      .leftJoin(employers, eq(internships.employerId, employers.id))
      .where(eq(internships.id, id));

    if (!result) return undefined;

    return {
      ...result.internships,
      employer: result.employers!
    };
  }

  async updateInternship(id: string, updates: Partial<InsertInternship>): Promise<Internship> {
    const [internship] = await db.update(internships).set(updates).where(eq(internships.id, id)).returning();
    return internship;
  }

  // Application operations
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getApplications(filters?: { studentId?: string; internshipId?: string; status?: string }): Promise<ApplicationWithDetails[]> {
    let query = db.select()
      .from(applications)
      .leftJoin(internships, eq(applications.internshipId, internships.id))
      .leftJoin(employers, eq(internships.employerId, employers.id))
      .leftJoin(students, eq(applications.studentId, students.id));

    const conditions = [];
    if (filters?.studentId) conditions.push(eq(applications.studentId, filters.studentId));
    if (filters?.internshipId) conditions.push(eq(applications.internshipId, filters.internshipId));
    if (filters?.status) conditions.push(eq(applications.status, filters.status));

    const results = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;
    return results.map(row => ({
      ...row.applications,
      internship: {
        ...row.internships!,
        employer: row.employers!
      },
      student: row.students!
    }));
  }

  async updateApplication(id: string, updates: Partial<InsertApplication>): Promise<Application> {
    const [application] = await db.update(applications).set(updates).where(eq(applications.id, id)).returning();
    return application;
  }

  // AI matching operations - simplified for now
  async getRecommendedInternships(studentId: string, limit = 10): Promise<(InternshipWithEmployer & { matchScore: number; matchReasons: string[] })[]> {
    // Get student profile
    const student = await this.getStudent(studentId);
    console.log("getRecommendedInternships", {student});
    if (!student) return [];

    // Get open internships
    const openInternships = await this.getInternships({ status: 'open' });
    
    // Simple matching algorithm - can be enhanced later
    const matches = openInternships.map(internship => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Skill matching
      if (student.skills && internship.skills) {
        const studentSkills = student.skills.map(s => s.toLowerCase());
        const internshipSkills = internship.skills.map(s => s.toLowerCase());
        const matchingSkills = studentSkills.filter(skill => 
          internshipSkills.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))
        );
        
        if (matchingSkills.length > 0) {
          score += matchingSkills.length * 10;
          reasons.push(`Skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
        }
      }

      // Interest matching
      if (student.interests && internship.skills) {
        const studentInterests = student.interests.map(i => i.toLowerCase());
        const internshipSkills = internship.skills.map(s => s.toLowerCase());
        const matchingInterests = studentInterests.filter(interest => 
          internshipSkills.some(skill => skill.includes(interest) || interest.includes(skill))
        );
        
        if (matchingInterests.length > 0) {
          score += matchingInterests.length * 8;
          reasons.push(`Interests align with role requirements`);
        }
      }

      // Graduation year consideration
      if (student.graduationYear && student.graduationYear <= 2025) {
        score += 15;
        reasons.push('Graduation timeline matches internship duration');
      }

      // Ensure score is within bounds
      score = Math.min(100, Math.max(0, score));

      return {
        ...internship,
        matchScore: score,
        matchReasons: reasons.slice(0, 4)
      };
    });

    // Sort by match score and return top results
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  async getRecommendedCandidates(internshipId: string, limit = 10): Promise<(Student & { matchScore: number; matchReasons: string[] })[]> {
    // Get internship details
    const internship = await this.getInternship(internshipId);
    if (!internship) return [];

    // Get all students (simplified - in production would filter better)
    const allStudents = await db.select().from(students).leftJoin(users, eq(students.userId, users.id));
    console.log({allStudents});
    // Simple matching algorithm
    const matches = allStudents.map(student => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Skill matching
      if (student.students.skills && internship.skills) {
        const studentSkills = student.students.skills.map(s => s.toLowerCase());
        const internshipSkills = internship.skills.map(s => s.toLowerCase());
        const matchingSkills = studentSkills.filter(skill => 
          internshipSkills.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))
        );
        
        if (matchingSkills.length > 0) {
          score += matchingSkills.length * 12;
          reasons.push(`Strong skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
        }
      }

      // GPA consideration
      if (student.students.gpa) {
        const gpaNum = parseFloat(student.students.gpa);
        if (gpaNum >= 3.5) {
          score += 20;
          reasons.push('High academic performance');
        } else if (gpaNum >= 3.0) {
          score += 10;
          reasons.push('Good academic performance');
        }
      }

      // Graduation year
      if (student.students.graduationYear >= 2024) {
        score += 10;
        reasons.push('Available for upcoming internship period');
      }

      score = Math.min(100, Math.max(0, score));
      console.log({student});
      
      return {
        ...student.students,
        user: student.users!,
        matchScore: score,
        matchReasons: reasons.slice(0, 4)
      };
    });

    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }
}

export const storage = new DatabaseStorage();

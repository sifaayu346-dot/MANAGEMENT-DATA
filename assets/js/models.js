/**
 * models.js
 * Implements OOP Concepts: Class, Object, Encapsulation, Inheritance, Polymorphism
 */

// Base Class (Encapsulation)
class Person {
    constructor(id, name) {
        // "Protected" properties convention using underscore
        this._id = id;
        this._name = name;
    }

    // Encapsulation: Getters and Setters
    get id() { return this._id; }
    set id(value) {
        if (!/^\d+$/.test(value)) throw new Error("ID harus berupa angka!");
        this._id = value;
    }

    get name() { return this._name; }
    set name(value) {
        if (!/^[a-zA-Z\s]+$/.test(value)) throw new Error("Nama hanya boleh huruf!");
        this._name = value;
    }

    // Polymorphism: Method to be overridden
    getInfo() {
        return `${this._id} - ${this._name}`;
    }
}

// Inheritance: Student inherits from Person
class Student extends Person {
    constructor(id, name, major, gpa, email) {
        super(id, name); // Call parent constructor
        this._major = major;
        this._gpa = parseFloat(gpa);
        this._email = email;
    }

    get major() { return this._major; }
    set major(value) { this._major = value; }

    get email() { return this._email; }
    set email(value) {
        // Regex for Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) throw new Error("Format Email tidak valid!");
        this._email = value;
    }

    get gpa() { return this._gpa; }
    set gpa(value) {
        let num = parseFloat(value);
        if (num < 0 || num > 4.0) throw new Error("IPK harus antara 0.00 - 4.00");
        this._gpa = num;
    }

    // Polymorphism: Overriding getInfo
    getInfo() {
        return `[MHS] ${super.getInfo()} | IPK: ${this._gpa.toFixed(2)}`;
    }

    // Helper to convert to simple object for JSON storage
    toJSON() {
        return {
            id: this._id,
            name: this._name,
            major: this._major,
            gpa: this._gpa,
            email: this._email
        };
    }

    // Static Factory Method
    static fromJSON(json) {
        return new Student(json.id, json.name, json.major, json.gpa, json.email);
    }
}

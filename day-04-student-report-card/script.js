const nameInput = document.getElementById("nameInput");
const gradeInput = document.getElementById("gradeInput");
const addStudentBtn = document.getElementById("addStudentBtn");
const studentList = document.getElementById("studentList");
const classSummary = document.getElementById("classSummary");
const targetName = document.getElementById("targetName");
const newGradeInput = document.getElementById("newGradeInput");
const addGradeBtn = document.getElementById("addGradeBtn");

const students = [];

function addStudent() {

    const name = nameInput.value.trim();
    const grade = Number(gradeInput.value);

    if (!name) return;
    if (!gradeInput.value.trim()) return;
    if (isNaN(grade) || grade < 0 || grade > 20) return;

    students.push({ name, grades: [grade] });

    nameInput.value = "";
    gradeInput.value = "";

    render();
}

function addGrade() {

    const name = targetName.value.trim();
    const grade = Number(newGradeInput.value);

    if (!name) return;
    if (!newGradeInput.value.trim()) return;
    if (isNaN(grade) || grade < 0 || grade > 20) return;

    let found = false;
    for (const student of students) {
        if (student.name.toLowerCase() === name.toLowerCase()) {
            student.grades.push(grade);
            found = true;
            break;
        }
    }

    if (!found) return;

    targetName.value = "";
    newGradeInput.value = "";
    render();
}

function render() {

    studentList.innerHTML = "";

    if (students.length === 0) {
        classSummary.textContent = "No students yet.";
        return;
    }

    let classTotal = 0;
    let classCount = 0;

    for (let i = 0; i < students.length; i++) {
        const student = students[i];

        let studentTotal = 0;

        for (const grade of student.grades) {
            studentTotal += grade;
        }

        const average = studentTotal / student.grades.length;
        const status = average >= 10 ? "Pass ✅" : "Fail ❌";
        const statusClass = average >= 10 ? "text-success" : "text-danger";

        classTotal += studentTotal;
        classCount += student.grades.length;

        let gradesHTML = "";
        
        for (let g = 0; g < student.grades.length; g++) {
            gradesHTML += `
                <span class="badge bg-secondary me-1">
                    ${student.grades[g]}
                    <button class="btn btn-sm btn-close btn-close-white ms-1"
                            data-action="remove-grade"
                            data-student="${i}"
                            data-grade="${g}"></button>
                </span>`;
        }

        studentList.innerHTML += `
            <div class="col-md-6">

                <div class="card">

                    <div class="card-body">

                        <h5 class="card-title d-flex justify-content-between">
                            ${student.name}
                            <button class="btn btn-sm btn-outline-danger"
                                    data-action="remove-student"
                                    data-student="${i}">Remove student</button>
                        </h5>

                        <p class="mb-2">Grades: ${gradesHTML}</p>
                        <p class="mb-0"><strong>Average:</strong> ${average.toFixed(2)} —
                            <span class="${statusClass}">${status}</span>
                        </p>

                    </div>

                </div>

            </div>`;
    }

    const classAverage = (classTotal / classCount).toFixed(2);
    classSummary.textContent = `Class average: ${classAverage} (${students.length} students, ${classCount} grades)`;
}

studentList.addEventListener("click", function(event) {

    const button = event.target;
    if (!button.matches("button[data-action]")) return;

    const action = button.dataset.action;
    const studentIndex = Number(button.dataset.student);

    if (action === "remove-student") {

        students.splice(studentIndex, 1);

    } else if (action === "remove-grade") {

        const gradeIndex = Number(button.dataset.grade);
        students[studentIndex].grades.splice(gradeIndex, 1);

        if (students[studentIndex].grades.length === 0) {

            students.splice(studentIndex, 1);
        }
    }

    render();
});

addStudentBtn.addEventListener("click", addStudent);
addGradeBtn.addEventListener("click", addGrade);

render();
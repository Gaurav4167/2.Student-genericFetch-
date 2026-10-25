var cl = console.log;


const form = document.getElementById("form")
const stuName = document.getElementById("name")
const course = document.getElementById("course")
const contact = document.getElementById("contact")
const degree = document.getElementById("degree")

const addBtn = document.getElementById("addBtn")
const updateBtn = document.getElementById("updateBtn")
const tbody = document.getElementById("tbody")
const spinner = document.getElementById("spinner")

const state = {
    studentsArr: [],
    edit_id: null
}

const BASE_URL = `https://gaurav2-1b96d-default-rtdb.firebaseio.com/`
const STUDENT_URL = `${BASE_URL}/Student2fetch.json`

//================ Generic API ============================
function makeGenericApiCall(URL, METHOD, BODY) {
    BODY = BODY ? JSON.stringify(BODY) : null
    return fetch(URL, {
        method: METHOD,
        body: BODY
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP Error ${res.status}`);
            }
            return res.json()
        })
}
cl(state.studentsArr)
//====================== READ ==============================
function fetchStudents(arr) {
    showSpinner("text-success")
    makeGenericApiCall(STUDENT_URL, "GET")
        .then(data => {
            for (const key in data) {
                data[key].id = key
                state.studentsArr.unshift(data[key])

            }

            let result = ""
            arr.forEach((ele, i) => {
                result += `<tr id=${ele.id}>
                            <td> ${i + 1}</td>
                            <td> ${ele.stuName} </td>
                            <td> ${ele.course} </td>
                            <td> ${ele.contact} </td>
                            <td> ${ele.degree} </td>
                            <td><button onClick="editStudent(this)" class="btn btn-primary shadow btn-block">Edt</button></td>
                            <td><button onClick="deleteStudent(this)" class="btn btn-danger shadow btn-block">Del</button></td>
                        </tr>`
            });
            tbody.innerHTML = result
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })
}
fetchStudents(state.studentsArr)
//====================== CREATE ============================
function createNewStudent(eve) {
    eve.preventDefault()
    let newStudent = {
        stuName: stuName.value,
        course: course.value,
        contact: contact.value,
        degree: degree.value,
    }
    showSpinner("text-success")
    makeGenericApiCall(STUDENT_URL, "POST", newStudent)
        .then(data => {
            newStudent.id = data.name
            state.studentsArr.unshift(newStudent)
            let tr = document.createElement("tr")
            tr.id = data.name
            tr.innerHTML = `
                            <td> ${1}</td>
                            <td> ${newStudent.stuName} </td>
                            <td> ${newStudent.course} </td>
                            <td> ${newStudent.contact} </td>
                            <td> ${newStudent.degree} </td>
                            <td><button onClick="editStudent(this)" class="btn btn-primary shadow btn-block">Edt</button></td>
                            <td><button onClick="deleteStudent(this)" class="btn btn-danger shadow btn-block">Del</button></td>
        `

            tbody.prepend(tr)
            let td = document.querySelectorAll("#tbody tr")
            td.forEach((td, i) => {
                td.querySelector("td").innerText = i + 1
            })
            showSnackBar("Added!", "Product added successfully", "success")
            clearform()
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })

}
//====================== EDIT ==============================
function editStudent(ele) {
    let EDIT_ID = ele.closest("tr").id
    let EDIT_URL = `${BASE_URL}/Student2fetch/${EDIT_ID}.json`

    showSpinner("text-success")
    makeGenericApiCall(EDIT_URL, "GET")
        .then(data => {
            stuName.value = data.stuName
            course.value = data.course
            contact.value = data.contact
            degree.value = data.degree

            addBtn.classList.add("d-none")
            updateBtn.classList.remove("d-none")
            state.edit_id = EDIT_ID
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })
}
//====================== UPDATE ============================
function updateStudent(ele) {
    let UPDATE_ID = state.edit_id
    let UPDATE_URL = `${BASE_URL}/Student2fetch/${UPDATE_ID}.json`

    let updatedStudentObj = {
        stuName: stuName.value,
        course: course.value,
        contact: contact.value,
        degree: degree.value,
        id: UPDATE_ID
    }
    showSpinner("text-success")
    makeGenericApiCall(UPDATE_URL, "PATCH", updatedStudentObj)
        .then(data => {
            let getIndex = state.studentsArr.findIndex(ele => ele.id === UPDATE_ID)
            state.studentsArr[getIndex] = updatedStudentObj

            document.getElementById(UPDATE_ID).innerHTML = `
                            <td> ${getIndex + 1}</td>
                            <td> ${updatedStudentObj.stuName} </td>
                            <td> ${updatedStudentObj.course} </td>
                            <td> ${updatedStudentObj.contact} </td>
                            <td> ${updatedStudentObj.degree} </td>
                            <td><button onClick="editStudent(this)" class="btn btn-primary shadow btn-block">Edt</button></td>
                            <td><button onClick="deleteStudent(this)" class="btn btn-danger shadow btn-block">Del</button></td>
        `

            addBtn.classList.remove("d-none")
            updateBtn.classList.add("d-none")
            state.edit_id = null
            clearform()
            showSnackBar("Updated!", "Product updated successfully", "success")
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })
}
//====================== DELETE ============================
function deleteStudent(ele) {
    let DELETE_ID = ele.closest("tr").id
    let DELETE_URL = `${BASE_URL}/Student2fetch/${DELETE_ID}.json`

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {

            showSpinner("text-danger")
            makeGenericApiCall(DELETE_URL, "DELETE")
                .then(data => {
                    let getIndex = state.studentsArr.findIndex(ele => ele.id === DELETE_ID)
                    state.studentsArr.splice(getIndex, 1)

                    ele.closest("tr").remove()
                    showSnackBar("Removed!", "Product removed successfully", "success")

                    let td = document.querySelectorAll("#tbody tr")
                    td.forEach((td, i) => {
                        td.querySelector("td").innerText = i + 1
                    })

                })
                .catch(err => {
                    showSnackBar("Error", err, "error")
                })
                .finally(() => {
                    hideSpinner("text-danger")
                })
        }
    });


}

function showSnackBar(title, msg, icon) {
    Swal.fire({
        title: title,
        text: msg,
        icon: icon
    });
}
function showSpinner(color) {
    spinner.classList.remove("d-none")
    spinner.classList.add(color)
}
function hideSpinner(color) {
    spinner.classList.add("d-none")
    spinner.classList.remove(color)
}
function clearform() {
    form.reset()
}



form.addEventListener("submit", createNewStudent)
updateBtn.addEventListener("click", updateStudent)











